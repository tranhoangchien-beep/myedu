/**
 * TeraBox Multi-Cloud Bridge & Dispatcher Engine (Version 2)
 * Hỗ trợ bóc tách link / thư mục TeraBox và tự động đẩy sang Streamtape (Chính) & Abyss (Dự phòng).
 */

import { Lesson } from '../types';
import { normalizeDurationMinutes } from './storage';

export interface CloudApiConfig {
  streamtapeLogin: string;
  streamtapeKey: string;
  abyssApiKey: string;
  teraboxToken: string; // Token / Cookie ndus từ TeraBox để giải mã luồng tải cao cấp
  hasStreamtapeKey?: boolean;
  hasAbyssKey?: boolean;
  hasTeraboxToken?: boolean;
}

export const CLOUD_CONFIG_STORAGE_KEY = 'myedu_cloud_api_config';

/**
 * Lấy cấu hình Cloud API từ Local Backend Server hoặc fallback LocalStorage
 */
export async function getCloudApiConfig(): Promise<CloudApiConfig> {
  try {
    const res = await fetch('/api/cloud/config');
    const data = await res.json();
    if (data.success && data.config) {
      return {
        streamtapeLogin: data.config.streamtapeLogin || 'b594c70e5a75cdfaa252',
        streamtapeKey: data.config.streamtapeKey || 'Ore0rexG6gSk2Q',
        abyssApiKey: data.config.abyssApiKey || 'ba8dac0020fbdbe8b3b931285e5acb42',
        teraboxToken: data.config.teraboxToken || 'YyBEzQx5eHui1iqLnLGobVhdjc_6HrAdN3ni2iD5',
        hasStreamtapeKey: data.config.hasStreamtapeKey,
        hasAbyssKey: data.config.hasAbyssKey,
        hasTeraboxToken: data.config.hasTeraboxToken,
      };
    }
  } catch {
    // ignore
  }
  return getStoredCloudConfig();
}

export function getStoredCloudConfig(): CloudApiConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    streamtapeLogin: 'b594c70e5a75cdfaa252',
    streamtapeKey: 'Ore0rexG6gSk2Q',
    abyssApiKey: 'ba8dac0020fbdbe8b3b931285e5acb42',
    teraboxToken: 'YyBEzQx5eHui1iqLnLGobVhdjc_6HrAdN3ni2iD5',
  };
}

export async function saveStoredCloudConfig(config: CloudApiConfig): Promise<void> {
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
    await fetch('/api/cloud/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch {
    // ignore
  }
}

export interface TeraBoxParsedItem {
  id: string;
  title: string;
  teraboxUrl: string;
  cleanName: string;
  isValid: boolean;
  dlink?: string;
  path?: string;
  size?: number;
  duration?: number;
  thumb?: string;
  isAlreadyOnCloud?: boolean;
  matchedCloudUrl?: string;
}

/**
 * Trích xuất danh sách link TeraBox từ văn bản người dùng dán vào
 * Hỗ trợ:
 * - https://terabox.com/s/1xyz...
 * - https://teraboxapp.com/s/1xyz...
 * - https://1024tera.com/s/1xyz...
 * - https://www.terabox.com/vietnamese/play/video?path=...
 * - Tên bài học | https://terabox.com/s/1xyz...
 */
export function parseTeraBoxInput(rawText: string, defaultPrefix: string = 'Bài'): TeraBoxParsedItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, index) => {
    let title = '';
    let teraboxUrl = '';

    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      title = parts[0];
      teraboxUrl = parts[1] || '';
    } else {
      teraboxUrl = line;
      title = `${defaultPrefix} ${index + 1}`;
    }

    // 1. Check share link pattern (/s/...)
    const shareMatch = teraboxUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|1024terabox\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/(?:1)?([a-zA-Z0-9_-]+)/i);

    // 2. Check direct internal drive/play pattern (path=... or play/video or /Course/...)
    const isPathLink = teraboxUrl.includes('path=') || teraboxUrl.includes('/play/video') || teraboxUrl.includes('terabox.com/main') || teraboxUrl.startsWith('/');

    let pathFileName = '';
    let rawFilePath = '';
    if (isPathLink) {
      try {
        const u = new URL(teraboxUrl.startsWith('http') ? teraboxUrl : `https://www.terabox.com${teraboxUrl}`);
        rawFilePath = u.searchParams.get('path') || teraboxUrl;
        const decoded = decodeURIComponent(rawFilePath);
        pathFileName = decoded.split('/').pop() || '';
      } catch {
        rawFilePath = teraboxUrl;
        pathFileName = teraboxUrl.split('/').pop() || '';
      }
    }

    const isValid = !!shareMatch || isPathLink;
    const id = shareMatch && shareMatch[1] ? shareMatch[1] : `tb_${index + 1}`;

    // Clean up title if it contains extension
    if (pathFileName && (!title || title.startsWith(defaultPrefix))) {
      title = pathFileName;
    }
    let cleanName = title.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();

    return {
      id,
      title: cleanName || `${defaultPrefix} ${index + 1}`,
      teraboxUrl,
      path: rawFilePath,
      cleanName,
      isValid,
    };
  });
}

export type DispatchDestination = 'streamtape' | 'abyss' | 'both';

export interface DispatchProgressItem {
  id: string;
  title: string;
  teraboxUrl: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  streamtapeUrl?: string;
  abyssUrl?: string;
  errorMessage?: string;
  durationMinutes?: number;
  thumbnailUrl?: string;
  dlink?: string;
  path?: string;
  cookieHeader?: string;
}

/**
 * Bóc tách đường dẫn tải luồng trực tiếp (Dlink) và danh sách tệp từ link hoặc thư mục TeraBox
 */
export async function resolveTeraBoxDirectLink(
  teraboxUrl: string,
  token?: string
): Promise<{ 
  success: boolean; 
  dlink?: string; 
  path?: string;
  filename?: string; 
  duration?: number; 
  thumb?: string; 
  files?: Array<{ filename: string; dlink?: string; path?: string; teraboxUrl?: string; size?: number; duration?: number; thumb?: string; cookieHeader?: string }>;
  fileCount?: number;
  error?: string;
}> {
  try {
    const res = await fetch('/api/terabox/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: teraboxUrl, token }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối tới bộ giải mã TeraBox Resolver',
    };
  }
}

export interface StreamtapeFolderItem {
  id: string;
  name: string;
  path?: string;
  parentId?: string;
}

/**
 * Lấy danh sách cây thư mục phân cấp trên tài khoản Streamtape
 */
export async function getStreamtapeFolders(): Promise<{ success: boolean; folders: StreamtapeFolderItem[]; error?: string }> {
  try {
    const res = await fetch('/api/streamtape/folders');
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, folders: [], error: err.message };
  }
}

/**
 * Tạo thư mục mới hoặc thư mục con trong thư mục cha trên Streamtape
 */
export async function createStreamtapeFolder(name: string, pid?: string): Promise<{ success: boolean; folderId?: string; name?: string; parentId?: string; error?: string }> {
  try {
    const res = await fetch('/api/streamtape/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pid }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Lấy danh sách cây thư mục phân cấp trên Abyss
 */
export async function getAbyssFolders(): Promise<{ success: boolean; folders: StreamtapeFolderItem[]; error?: string }> {
  try {
    const res = await fetch('/api/abyss/folders');
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, folders: [], error: err.message };
  }
}

/**
 * Tạo thư mục mới hoặc thư mục con trong thư mục cha trên Abyss
 */
export async function createAbyssFolder(name: string, pid?: string): Promise<{ success: boolean; folderId?: string; name?: string; parentId?: string; error?: string }> {
  try {
    const res = await fetch('/api/abyss/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pid }),
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Điều phối video từ TeraBox sang Streamtape (Chính) và Abyss (Dự phòng)
 */
export async function dispatchCloudVideo(
  params: {
    url?: string;
    dlink?: string;
    path?: string;
    title: string;
    folderId?: string;
    streamtapeFolderId?: string;
    abyssFolderId?: string;
    destination: DispatchDestination;
    token?: string;
    dispatchMode?: 'remote' | 'direct' | 'auto';
    cookieHeader?: string;
    config?: CloudApiConfig;
  }
): Promise<{
  success: boolean;
  streamtapeUrl?: string;
  abyssUrl?: string;
  filename?: string;
  duration?: number;
  thumb?: string;
  errors?: string[];
  error?: string;
}> {
  try {
    const res = await fetch('/api/cloud/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: params.url,
        dlink: params.dlink,
        path: params.path,
        title: params.title,
        folderId: params.folderId || params.streamtapeFolderId,
        streamtapeFolderId: params.streamtapeFolderId || params.folderId,
        abyssFolderId: params.abyssFolderId,
        destination: params.destination,
        dispatchMode: params.dispatchMode || 'auto',
        token: params.token || params.config?.teraboxToken,
        cookieHeader: params.cookieHeader,
        streamtapeLogin: params.config?.streamtapeLogin,
        streamtapeKey: params.config?.streamtapeKey,
        abyssApiKey: params.config?.abyssApiKey,
      }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối bộ điều phối Cloud Dispatcher',
    };
  }
}

/**
 * Truyền luồng trực tiếp (Direct Pipe) từ TeraBox sang Streamtape qua máy chủ Local (tương thích ngược)
 */
export async function pipeTeraBoxToStreamtape(
  teraboxUrl: string,
  fileName: string,
  config: CloudApiConfig
): Promise<{ success: boolean; streamtapeUrl?: string; filename?: string; duration?: number; thumb?: string; error?: string }> {
  try {
    const res = await fetch('/api/terabox/pipe-to-streamtape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: teraboxUrl,
        token: config.teraboxToken,
        streamtapeLogin: config.streamtapeLogin,
        streamtapeKey: config.streamtapeKey,
        fileName,
      }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối bộ truyền luồng Stream Pipe',
    };
  }
}

/**
 * Gửi lệnh Remote Upload sang Streamtape API (Trực tiếp từ Client)
 */
export async function dispatchToStreamtape(
  directDownloadUrl: string,
  fileName: string,
  config: CloudApiConfig
): Promise<{ success: boolean; streamtapeUrl?: string; error?: string }> {
  if (!config.streamtapeLogin || !config.streamtapeKey) {
    return { success: false, error: 'Chưa cấu hình API Login & API Key của Streamtape' };
  }

  try {
    const apiUrl = `https://api.streamtape.com/remotedl/add?login=${encodeURIComponent(
      config.streamtapeLogin
    )}&key=${encodeURIComponent(config.streamtapeKey)}&url=${encodeURIComponent(
      directDownloadUrl
    )}&name=${encodeURIComponent(fileName)}`;

    const res = await fetch(apiUrl, { method: 'GET' });
    const json = await res.json();

    if (json && json.status === 200 && json.result) {
      const linkId = json.result.id;
      return {
        success: true,
        streamtapeUrl: `https://streamtape.com/e/${linkId}?color=16,185,129`,
      };
    } else {
      return {
        success: false,
        error: json?.msg || 'Lỗi phản hồi từ máy chủ Streamtape',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi mạng khi kết nối Streamtape API',
    };
  }
}

/**
 * Gửi lệnh nạp video sang Abyss API (Trực tiếp từ Client)
 */
export async function dispatchToAbyss(
  teraboxUrl: string,
  fileName: string,
  config: CloudApiConfig
): Promise<{ success: boolean; abyssUrl?: string; error?: string }> {
  if (!config.abyssApiKey) {
    return { success: false, error: 'Chưa cấu hình Abyss API Key' };
  }

  try {
    const apiUrl = `https://api.abyss.to/v1/remote/url?apiKey=${encodeURIComponent(
      config.abyssApiKey
    )}&url=${encodeURIComponent(teraboxUrl)}&name=${encodeURIComponent(fileName)}`;

    const res = await fetch(apiUrl, { method: 'POST' });
    const json = await res.json();

    if (json && (json.slug || json.id || json.result?.slug || json.result?.id)) {
      const slug = json.slug || json.id || json.result?.slug || json.result?.id;
      return {
        success: true,
        abyssUrl: `https://player.abyssplayer.com/${slug}`,
      };
    } else {
      return {
        success: false,
        error: json?.message || 'Lỗi phản hồi từ máy chủ Abyss',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối Abyss API',
    };
  }
}

/**
 * Lấy danh sách tệp video đã có trong thư mục Streamtape (Hỗ trợ Smart De-duplication 0s)
 */
export async function getStreamtapeFiles(
  folderId?: string
): Promise<{ success: boolean; files?: Array<{ id: string; name: string; size?: number; streamtapeUrl: string }>; error?: string }> {
  try {
    const res = await fetch(`/api/streamtape/files${folderId ? `?folder=${encodeURIComponent(folderId)}` : ''}`);
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi lấy danh sách tệp Streamtape' };
  }
}

/**
 * Chuẩn hóa tên bài giảng phục vụ đối chiếu và so khớp mờ (Fuzzy Match)
 */
export function normalizeTitleForMatching(raw: string): string {
  if (!raw) return '';
  let clean = raw.trim();

  // 1. Giải mã URL Encoding nếu có (ví dụ: %E1%BA%A1 -> ạ)
  try {
    if (clean.includes('%')) {
      clean = decodeURIComponent(clean);
    }
  } catch {}

  // 2. Bỏ phần đuôi tệp video
  clean = clean.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '');

  // 3. Thay thế dấu gạch dưới, gạch ngang đơn lẻ và dấu chấm giữa các từ bằng khoảng trắng
  clean = clean.replace(/[_\-]+/g, ' ');
  
  // 4. Xóa các ký tự đặc biệt thừa và chuẩn hóa khoảng trắng
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Trích xuất chỉ số thứ tự bài giảng (ví dụ: "4.1", "4.2", "1.3")
 */
export function extractLessonIndex(titleOrUrl: string): string | null {
  if (!titleOrUrl) return null;
  const decoded = normalizeTitleForMatching(titleOrUrl);
  // Match "4.1", "4.2.1", "Bài 1", "04.1"
  const match = decoded.match(/^(\d+(?:\.\d+)+)/) || decoded.match(/^(?:bài|lesson|chương|phần)\s*(\d+(?:\.\d+)*)/i);
  if (match) return match[1];
  return null;
}

/**
 * So khớp thông minh một file TeraBox với danh sách video đã tồn tại trên Cloud (Streamtape)
 */
export function matchExistingCloudVideo(
  teraboxFilename: string,
  cloudFiles: Array<{ id: string; name: string; size?: number; streamtapeUrl: string }>
): { id: string; name: string; streamtapeUrl: string } | null {
  if (!teraboxFilename || !cloudFiles || cloudFiles.length === 0) return null;

  const targetClean = normalizeTitleForMatching(teraboxFilename).toLowerCase();
  const targetIndex = extractLessonIndex(teraboxFilename);

  // 1. Match chính xác tên chuẩn hóa
  const exactMatch = cloudFiles.find(cf => normalizeTitleForMatching(cf.name).toLowerCase() === targetClean);
  if (exactMatch) return exactMatch;

  // 2. Match theo chỉ số bài giảng (nếu có, ví dụ "4.1" hoặc "4.2")
  if (targetIndex) {
    const indexMatch = cloudFiles.find(cf => {
      const cfIndex = extractLessonIndex(cf.name);
      return cfIndex === targetIndex;
    });
    if (indexMatch) return indexMatch;
  }

  // 3. Match bao hàm chuỗi (Sub-string match)
  const partialMatch = cloudFiles.find(cf => {
    const cfClean = normalizeTitleForMatching(cf.name).toLowerCase();
    return targetClean.length > 5 && (cfClean.includes(targetClean) || targetClean.includes(cfClean));
  });
  if (partialMatch) return partialMatch;

  return null;
}

export interface MergedLessonItem {
  id: string;
  title: string;
  cleanName: string;
  streamtapeUrl?: string;
  abyssUrl?: string;
  durationMinutes: number;
}

/**
 * Bóc tách và Tự động ghép nối thông minh danh sách copy hàng loạt từ Streamtape / Abyss
 * Nhận diện 1 bài giảng duy nhất có đủ 2 luồng phát (Streamtape Primary + Abyss Mirror)
 */
export function parseAndMergeBulkExports(rawText: string): MergedLessonItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const itemsByKey: Map<string, { title: string; streamtapeUrl?: string; abyssUrl?: string }> = new Map();

  for (const line of lines) {
    // Trường hợp 1: Dòng Abyss Export: "4.1 - Dịch thuật | https://player.abyssplayer.com/eYoBb7tUN | <iframe...>"
    // hoặc "4.1 - Dịch thuật | https://player.abyssplayer.com/..."
    if (line.includes('abyssplayer.com') || line.includes('abyss.to')) {
      const parts = line.split('|').map(p => p.trim());
      const rawTitle = parts[0] && !parts[0].includes('http') ? parts[0] : '';
      const urlPart = parts.find(p => p.includes('http') && (p.includes('abyssplayer.com') || p.includes('abyss.to'))) || '';
      
      const slugMatch = urlPart.match(/(?:player\.)?abyssplayer\.com\/([a-zA-Z0-9_-]+)/) || urlPart.match(/abyss\.to\/([a-zA-Z0-9_-]+)/);
      const abyssUrl = slugMatch ? `https://player.abyssplayer.com/${slugMatch[1]}` : urlPart;

      const cleanTitle = normalizeTitleForMatching(rawTitle) || 'Bài Giảng Abyss';
      const key = extractLessonIndex(cleanTitle) || cleanTitle.toLowerCase();

      const existing = itemsByKey.get(key) || { title: cleanTitle };
      existing.abyssUrl = abyssUrl;
      if (!existing.title || existing.title.startsWith('Bài Giảng')) existing.title = cleanTitle;
      itemsByKey.set(key, existing);
    }
    // Trường hợp 2: Dòng Streamtape Export: "https://streamtape.com/e/Ywkb6xZvMBs2rk/4.2._T%E1%BA%A1o_b%E1%BA%A3ng_d%E1%BB%AF_li%E1%BB%87u.mp4"
    else if (line.includes('streamtape.com')) {
      const parts = line.split('|').map(p => p.trim());
      const urlPart = parts.find(p => p.includes('streamtape.com')) || parts[0];
      const explicitTitle = parts.length > 1 && !parts[0].includes('http') ? parts[0] : '';

      const match = urlPart.match(/streamtape\.com\/(?:e|v)\/([a-zA-Z0-9_-]+)(?:\/([^?\s#]+))?/);
      if (match) {
        const videoId = match[1];
        const rawFilenameInUrl = match[2] ? decodeURIComponent(match[2]) : '';
        const title = explicitTitle || normalizeTitleForMatching(rawFilenameInUrl) || `Bài Giảng Streamtape (${videoId})`;
        const streamtapeUrl = `https://streamtape.com/e/${videoId}?color=16,185,129`;

        const key = extractLessonIndex(title) || title.toLowerCase();

        const existing = itemsByKey.get(key) || { title };
        existing.streamtapeUrl = streamtapeUrl;
        if (!existing.title || existing.title.startsWith('Bài Giảng')) existing.title = title;
        itemsByKey.set(key, existing);
      }
    }
    // Trường hợp 3: Dòng tiêu đề | link thông thường
    else if (line.includes('http')) {
      const parts = line.split('|').map(p => p.trim());
      const rawTitle = parts.length > 1 ? parts[0] : '';
      const url = parts.find(p => p.includes('http')) || '';
      const title = rawTitle || normalizeTitleForMatching(url.split('/').pop() || '') || 'Bài Giảng';
      const key = extractLessonIndex(title) || title.toLowerCase();

      const existing = itemsByKey.get(key) || { title };
      if (url.includes('streamtape.com')) existing.streamtapeUrl = url;
      else if (url.includes('abyss')) existing.abyssUrl = url;
      itemsByKey.set(key, existing);
    }
  }

  // Chuyển Map thành mảng bài học
  const results: MergedLessonItem[] = [];
  let index = 1;
  itemsByKey.forEach((val) => {
    results.push({
      id: `bulk_merged_${Date.now()}_${index++}`,
      title: val.title,
      cleanName: val.title,
      streamtapeUrl: val.streamtapeUrl,
      abyssUrl: val.abyssUrl,
      durationMinutes: 15,
    });
  });

  return results;
}

/**
 * Tạo danh sách Lesson hoàn chỉnh từ kết quả Dispatch
 */
export function createLessonsFromDispatch(
  items: DispatchProgressItem[]
): Lesson[] {
  return items.map((item, idx) => {
    // Streamtape is Primary stream, Abyss is Mirror Fallback stream
    const primary = item.streamtapeUrl || item.abyssUrl || item.teraboxUrl;
    const mirror = item.streamtapeUrl && item.abyssUrl ? item.abyssUrl : undefined;

    return {
      id: `lesson_tb_${Date.now()}_${idx}`,
      title: item.title,
      type: 'video',
      videoSource: primary,
      mirrorVideoSource: mirror,
      durationMinutes: normalizeDurationMinutes(item.durationMinutes, 15),
      isCompleted: false,
      isStarred: false,
      attachments: [
        {
          id: `att_tb_${Date.now()}_${idx}`,
          name: `Kho File Gốc TeraBox (${item.title})`,
          url: item.teraboxUrl,
          type: 'terabox',
        },
      ],
    };
  });
}

