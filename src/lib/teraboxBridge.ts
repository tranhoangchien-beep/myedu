/**
 * TeraBox Multi-Cloud Bridge & Dispatcher Engine
 * Hỗ trợ bóc tách danh sách link TeraBox và đẩy sang Streamtape / Abyss tự động.
 */

import { Lesson } from '../types';

export interface CloudApiConfig {
  streamtapeLogin: string;
  streamtapeKey: string;
  abyssApiKey: string;
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
}

/**
 * Gửi lệnh Remote Upload sang Streamtape API
 */
export async function dispatchToStreamtape(
  teraboxUrl: string,
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
      teraboxUrl
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
