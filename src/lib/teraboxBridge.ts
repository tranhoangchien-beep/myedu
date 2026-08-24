/**
 * TeraBox Multi-Cloud Bridge & Dispatcher Engine
 * Hỗ trợ bóc tách danh sách link TeraBox và đẩy sang Streamtape / Abyss tự động.
 */

import { Lesson } from '../types';

export interface CloudApiConfig {
  streamtapeLogin: string;
  streamtapeKey: string;
  abyssApiKey: string;
  teraboxToken: string; // Token / Cookie ndus từ TeraBox để giải mã luồng tải cao cấp
}

export const CLOUD_CONFIG_STORAGE_KEY = 'myedu_cloud_api_config';

export function getStoredCloudConfig(): CloudApiConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    streamtapeLogin: '',
    streamtapeKey: '',
    abyssApiKey: '',
    teraboxToken: '',
  };
}

export function saveStoredCloudConfig(config: CloudApiConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
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
}

/**
 * Trích xuất danh sách link TeraBox từ văn bản người dùng dán vào
 * Hỗ trợ:
 * - https://terabox.com/s/1xyz...
 * - https://teraboxapp.com/s/1xyz...
 * - https://1024tera.com/s/1xyz...
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

    const match = teraboxUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/([a-zA-Z0-9_-]+)/i);
    const id = match && match[1] ? match[1] : `tb_${index + 1}`;
    const isValid = !!match;

    // Clean up title if it contains extension
    let cleanName = title.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();

    return {
      id,
      title: cleanName || `${defaultPrefix} ${index + 1}`,
      teraboxUrl,
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
}

/**
 * Bóc tách đường dẫn tải luồng trực tiếp (Dlink) từ link chia sẻ TeraBox qua Resolver API
 */
export async function resolveTeraBoxDirectLink(
  teraboxUrl: string,
  token?: string
): Promise<{ success: boolean; dlink?: string; filename?: string; duration?: number; thumb?: string; error?: string }> {
  try {
    const res = await fetch('/api/terabox/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: teraboxUrl, token }),
    });

    const json = await res.json();
    if (json.success) {
      return {
        success: true,
        dlink: json.dlink,
        filename: json.filename,
        duration: json.duration,
        thumb: json.thumb,
      };
    } else {
      return {
        success: false,
        error: json.error || 'Không thể bóc tách luồng tải trực tiếp từ TeraBox',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối tới bộ giải mã TeraBox Resolver',
    };
  }
}

/**
 * Truyền luồng trực tiếp (Direct Pipe) từ TeraBox sang Streamtape qua máy chủ Local
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
 * Gửi lệnh Remote Upload sang Streamtape API
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
 * Gửi lệnh nạp video sang Abyss API
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
    // Gọi Abyss Remote / Upload endpoint
    const apiUrl = `https://api.abyss.to/v1/remote/url?apiKey=${encodeURIComponent(
      config.abyssApiKey
    )}&url=${encodeURIComponent(teraboxUrl)}&name=${encodeURIComponent(fileName)}`;

    const res = await fetch(apiUrl, { method: 'POST' });
    const json = await res.json();

    if (json && (json.slug || json.id)) {
      const slug = json.slug || json.id;
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
 * Tạo danh sách Lesson hoàn chỉnh từ kết quả Dispatch
 */
export function createLessonsFromDispatch(
  items: DispatchProgressItem[]
): Lesson[] {
  return items.map((item, idx) => {
    // If streamtape is available, use it as primary, otherwise Abyss or fallback
    const primary = item.streamtapeUrl || item.abyssUrl || item.teraboxUrl;
    const mirror = item.streamtapeUrl && item.abyssUrl ? item.abyssUrl : undefined;

    return {
      id: `lesson_tb_${Date.now()}_${idx}`,
      title: item.title,
      type: 'video',
      videoSource: primary,
      mirrorVideoSource: mirror,
      durationMinutes: item.durationMinutes,
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
