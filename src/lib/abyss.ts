/**
 * Universal Video Embed Parser & Normalizer
 * Hỗ trợ bóc tách URL & ID từ Abyss Player, YouTube, TikTok, Vimeo, Google Drive, Loom, MP4/WebM trực tiếp hoặc thẻ Iframe nhúng bất kỳ.
 */

export type VideoProviderType = 'abyss' | 'youtube' | 'tiktok' | 'vimeo' | 'gdrive' | 'loom' | 'mp4' | 'iframe' | 'unknown';

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

  // Security Hardening: Reject dangerous URI schemes
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return { provider: 'unknown', embedUrl: '', rawInput: trimmed, isDirectVideo: false, label: 'Nguồn video không hợp lệ' };
  }

  // 1. Kiểm tra nếu là thẻ iframe full HTML: <iframe ... src="URL" ...>
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  let targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;
  targetUrl = targetUrl.replace(/&amp;/g, '&');

  // 2. Direct MP4 / WebM / OGG / HLS / MOV video URL
  if (/\.(mp4|webm|ogg|m3u8|mov|mkv|avi|m4v)(\?.*)?$/i.test(targetUrl)) {
    return {
      provider: 'mp4',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: true,
      label: 'Direct MP4/WebM Video',
    };
  }

  // 3. YouTube Embed hoặc Link
  // Formats: youtube.com/watch?v=ID, youtube.com/watch?t=10&v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtube.com/live/ID, youtube.com/v/ID
  const ytMatch = targetUrl.match(/(?:(?:youtube\.com\/(?:(?:watch\?(?:.*&)?v=)|(?:embed|shorts|v|live)\/))|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
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

  // 4. TikTok Video Link / Iframe / Embed Code / Blockquote
  // Formats: tiktok.com/@user/video/7123456789012345678, tiktok.com/embed/v2/7123456789012345678 hoặc data-video-id="7123456789012345678"
  const tiktokMatch = targetUrl.match(/(?:tiktok\.com\/(?:@[\w.-]+\/video\/|embed\/v2\/|embed\/|player\/v1\/)|data-video-id=["'])(\d+)/i)
    || trimmed.match(/data-video-id=["'](\d+)["']/i)
    || trimmed.match(/\/video\/(\d+)/i);

  if (tiktokMatch && tiktokMatch[1]) {
    const videoId = tiktokMatch[1];
    return {
      provider: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `TikTok (${videoId})`,
      id: videoId,
    };
  }

  // 5. Vimeo Embed hoặc Link
  // Formats: vimeo.com/ID, player.vimeo.com/video/ID, vimeo.com/channels/.../ID
  const vimeoMatch = targetUrl.match(/(?:vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i);
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

  // 6. Google Drive Video (tự động chuyển /view, /open?id= thành /preview cho iframe nhúng)
  const gdriveMatch = targetUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      provider: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Google Drive (${fileId.slice(0, 8)}...)`,
      id: fileId,
    };
  }

  // 7. Loom Video (tự động chuyển /share/ID thành /embed/ID)
  const loomMatch = targetUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      provider: 'loom',
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Loom (${videoId})`,
      id: videoId,
    };
  }

  // 8. Abyss Player Embed hoặc Link / ID
  // Formats: abyssplayer.com/ID, player.abyssplayer.com/ID, abyss.to/v/ID, abyss.to/e/ID, abyss.to/embed/ID, abysscdn.com/...
  const abyssMatch = targetUrl.match(/(?:(?:player\.)?abyssplayer\.com|abyss\.to|abysscdn\.com|abyssto\.com)\/(?:embed\/|v\/|e\/|play\/|d\/)?([a-zA-Z0-9_-]+)/i);
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

  // Nếu người dùng dán trực tiếp ID Abyss (ví dụ: mZ2faMYp2, Ld3tfGRGA, bGOgQoLE0, 58_ZxuvA0, -KRykxfuK)
  if (/^[a-zA-Z0-9_-]{5,32}$/.test(trimmed) && !trimmed.includes('.') && !trimmed.includes('/') && !trimmed.includes(' ') && !trimmed.includes(':')) {
    return {
      provider: 'abyss',
      embedUrl: `https://player.abyssplayer.com/${trimmed}`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Abyss (${trimmed})`,
      id: trimmed,
    };
  }

  // 9. Generic Embed URL (Drive preview, Loom, DailyMotion, custom iframe link)
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
