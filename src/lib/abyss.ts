/**
 * Universal Video Embed Parser & Normalizer
 * Hỗ trợ bóc tách URL & ID từ Abyss Player, YouTube, Vimeo, MP4/WebM trực tiếp hoặc thẻ Iframe nhúng bất kỳ.
 */

export type VideoProviderType = 'abyss' | 'youtube' | 'vimeo' | 'mp4' | 'iframe' | 'unknown';

export interface ParsedVideoInfo {
  provider: VideoProviderType;
  embedUrl: string;
  rawInput: string;
  isDirectVideo: boolean;
  label: string;
  id?: string;
}

export function parseUniversalVideo(input: string): ParsedVideoInfo {
  if (!input) {
    return { provider: 'unknown', embedUrl: '', rawInput: '', isDirectVideo: false, label: 'Chưa có video' };
  }

  const trimmed = input.trim();

  // 1. Kiểm tra nếu là thẻ iframe full HTML: <iframe ... src="URL" ...>
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  let targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;
  targetUrl = targetUrl.replace(/&amp;/g, '&');

  // 2. Direct MP4 / WebM / OGG / HLS video URL
  if (/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(targetUrl)) {
    return {
      provider: 'mp4',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: true,
      label: 'Direct MP4/WebM Video',
    };
  }

  // 3. YouTube Embed hoặc Link
  // Formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch = targetUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `YouTube (${videoId})`,
      id: videoId,
    };
  }

  // 4. Vimeo Embed hoặc Link
  // Formats: vimeo.com/ID hoặc player.vimeo.com/video/ID
  const vimeoMatch = targetUrl.match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Vimeo (${videoId})`,
      id: videoId,
    };
  }

  // 5. Abyss Player Embed hoặc Link / ID
  const abyssMatch = targetUrl.match(/(?:player\.abyssplayer\.com|abyssplayer\.com|abyss\.to\/(?:v|e|embed))\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (abyssMatch && abyssMatch[1]) {
    const videoId = abyssMatch[1];
    return {
      provider: 'abyss',
      embedUrl: `https://player.abyssplayer.com/${videoId}`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Abyss (${videoId})`,
      id: videoId,
    };
  }

  // Nếu người dùng dán trực tiếp ID Abyss (ví dụ: mZ2faMYp2, Ld3tfGRGA, bGOgQoLE0)
  if (/^[a-zA-Z0-9_-]{5,25}$/.test(trimmed) && !trimmed.includes('.') && !trimmed.includes('/')) {
    return {
      provider: 'abyss',
      embedUrl: `https://player.abyssplayer.com/${trimmed}`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Abyss (${trimmed})`,
      id: trimmed,
    };
  }

  // 6. Generic Embed URL (Drive preview, Loom, DailyMotion, custom iframe link)
  if (/^https?:\/\//i.test(targetUrl)) {
    return {
      provider: 'iframe',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: false,
      label: iframeSrcMatch ? 'Thẻ Nhúng Iframe' : 'Link Video Nhúng',
    };
  }

  return {
    provider: 'unknown',
    embedUrl: trimmed,
    rawInput: trimmed,
    isDirectVideo: false,
    label: 'Khung Nhúng Video',
  };
}

export function extractAbyssId(input: string): string | null {
  if (!input) return null;
  const parsed = parseUniversalVideo(input);
  return parsed.id || (parsed.provider !== 'unknown' ? parsed.label : null);
}

export function getAbyssEmbedUrl(input: string): string {
  if (!input) return '';
  const parsed = parseUniversalVideo(input);
  return parsed.embedUrl;
}

export function isValidAbyssInput(input: string): boolean {
  if (!input) return false;
  const parsed = parseUniversalVideo(input);
  return parsed.provider !== 'unknown' && parsed.embedUrl !== '';
}
