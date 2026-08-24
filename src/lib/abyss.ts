/**
 * Universal Video Embed Parser & Normalizer
 * Hỗ trợ bóc tách URL & ID từ Abyss Player, YouTube, TikTok, Vimeo, Google Drive, Loom, MP4/WebM trực tiếp hoặc thẻ Iframe nhúng bất kỳ.
 */

export type VideoProviderType = 'abyss' | 'streamtape' | 'terabox' | 'youtube' | 'tiktok' | 'vimeo' | 'gdrive' | 'loom' | 'mp4' | 'iframe' | 'unknown';

export interface ParsedVideoInfo {
  provider: VideoProviderType;
  embedUrl: string;
  rawInput: string;
  isDirectVideo: boolean;
  label: string;
  id?: string;
  extractedTitle?: string;
  thumbnailUrl?: string;
}

/**
 * Trích xuất ảnh thumbnail HD tự động từ Streamtape hoặc YouTube
 */
export function getThumbnailForVideo(input: string): string | undefined {
  if (!input) return undefined;
  const parsed = parseUniversalVideo(input);
  if (parsed.provider === 'streamtape' && parsed.id) {
    return `https://thumb.tapecontent.net/thumb/${parsed.id}/thumb.jpg`;
  }
  if (parsed.provider === 'youtube' && parsed.id) {
    return `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
  }
  return undefined;
}

/**
 * Trích xuất tiêu đề bài học từ URL tệp Streamtape / Abyss nếu có chứa tên tệp mã hóa
 */
export function extractTitleFromVideoUrl(url: string): string | undefined {
  if (!url) return undefined;
  try {
    // 1. Streamtape: /v/ID/filename.mp4 hoặc /e/ID/filename.mp4
    const stMatch = url.match(/(?:streamtape\.[a-z]+|streamta\.pe|tapecontent\.net|shavetape\.cash|strtape\.cloud|strcloud\.link)\/(?:v|e|embed|thumb)\/[a-zA-Z0-9_-]+\/([^\s"'?#]+)/i);
    if (stMatch && stMatch[1]) {
      let rawName = decodeURIComponent(stMatch[1]);
      rawName = rawName.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '');
      rawName = rawName.replace(/_/g, ' ').trim();
      if (rawName && !rawName.startsWith('http')) {
        return rawName;
      }
    }
  } catch {
    // ignore decode error
  }
  return undefined;
}

export function parseUniversalVideo(input: string): ParsedVideoInfo {
  if (!input) {
    return { provider: 'unknown', embedUrl: '', rawInput: '', isDirectVideo: false, label: 'Chưa có video' };
  }

  let trimmed = input.trim();

  // Security Hardening: Reject dangerous URI schemes
  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    return { provider: 'unknown', embedUrl: '', rawInput: trimmed, isDirectVideo: false, label: 'Nguồn video không hợp lệ' };
  }

  // 0A. Kiểm tra nếu là BBCode dạng: [URL="https://..."][IMG]...[/IMG][/URL]
  const bbUrlMatch = trimmed.match(/\[URL=["']?([^\]"']+)["']?\]/i);
  if (bbUrlMatch) {
    trimmed = bbUrlMatch[1];
  }

  // 0B. Kiểm tra nếu là thẻ HTML <a>: <a href="https://..."><img ... /></a>
  const aHrefMatch = trimmed.match(/<a\s+[^>]*href=["']([^"']+)["']/i);
  if (aHrefMatch) {
    trimmed = aHrefMatch[1];
  }

  // 1. Kiểm tra nếu là thẻ iframe full HTML: <iframe ... src="URL" ...>
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  let targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;
  targetUrl = targetUrl.replace(/&amp;/g, '&');

  // Trích xuất tiêu đề nhúng trong URL nếu có
  const extractedTitle = extractTitleFromVideoUrl(targetUrl) || extractTitleFromVideoUrl(trimmed);

  // 2. Streamtape Embed / Direct link / Shortlink / Thumbnail
  // Tone-sur-tone Emerald Theme (?color=16,185,129)
  const streamtapeMatch = targetUrl.match(/(?:streamtape\.(?:com|to|net|xyz)|streamta\.pe|tapecontent\.net|shavetape\.cash|strtape\.cloud|strcloud\.link)\/(?:v|e|embed|thumb)\/([a-zA-Z0-9_-]+)/i)
    || trimmed.match(/(?:streamtape\.(?:com|to|net|xyz)|streamta\.pe|tapecontent\.net|shavetape\.cash|strtape\.cloud|strcloud\.link)\/(?:v|e|embed|thumb)\/([a-zA-Z0-9_-]+)/i);

  if (streamtapeMatch && streamtapeMatch[1]) {
    const videoId = streamtapeMatch[1];
    return {
      provider: 'streamtape',
      embedUrl: `https://streamtape.com/e/${videoId}?color=16,185,129`,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `Streamtape (${videoId})`,
      id: videoId,
      extractedTitle,
      thumbnailUrl: `https://thumb.tapecontent.net/thumb/${videoId}/thumb.jpg`,
    };
  }

  // 2B. TeraBox Cloud Vault Link (terabox.com/s/..., 1024tera.com/s/...)
  const teraboxMatch = targetUrl.match(/(?:terabox\.com|teraboxapp\.com|1024tera\.com|freeterabox\.com|terasharelink\.com|mirrobox\.com|nephobox\.com)\/s\/([a-zA-Z0-9_-]+)/i);
  if (teraboxMatch && teraboxMatch[1]) {
    const shareId = teraboxMatch[1];
    return {
      provider: 'terabox',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: false,
      label: `TeraBox Vault (${shareId.slice(0, 8)}...)`,
      id: shareId,
      extractedTitle,
    };
  }

  // 3. Direct MP4 / WebM / OGG / HLS / MOV video URL
  if (/^(?:https?:\/\/|\/|blob:)/i.test(targetUrl) && /\.(mp4|webm|ogg|m3u8|mov|mkv|avi|m4v)(\?.*)?$/i.test(targetUrl)) {
    return {
      provider: 'mp4',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: true,
      label: 'Direct MP4/WebM Video',
      extractedTitle,
    };
  }

  // 4. YouTube Embed hoặc Link
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
      extractedTitle,
    };
  }

  // 5. TikTok Video Link / Iframe / Embed Code / Blockquote
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
      extractedTitle,
    };
  }

  // 6. Vimeo Embed hoặc Link
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
      extractedTitle,
    };
  }

  // 7. Google Drive Video (tự động chuyển /view, /open?id= thành /preview cho iframe nhúng)
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
      extractedTitle,
    };
  }

  // 8. Loom Video (tự động chuyển /share/ID thành /embed/ID)
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
      extractedTitle,
    };
  }

  // 9. Abyss Player Embed hoặc Link / ID
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
      extractedTitle,
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
      extractedTitle,
    };
  }

  // 10. Generic Embed URL (Drive preview, Loom, DailyMotion, custom iframe link)
  if (/^https?:\/\//i.test(targetUrl)) {
    return {
      provider: 'iframe',
      embedUrl: targetUrl,
      rawInput: trimmed,
      isDirectVideo: false,
      label: iframeSrcMatch ? 'Thẻ Nhúng Iframe' : 'Link Video Nhúng',
      extractedTitle,
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
  const trimmed = input.trim();
  // Filter out raw local filenames (e.g. "5. Lesson.mp4") without http/https
  if (!/^(?:https?:\/\/|<iframe)/i.test(trimmed) && /\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i.test(trimmed)) {
    return false;
  }
  const parsed = parseUniversalVideo(input);
  return parsed.provider !== 'unknown' && parsed.embedUrl !== '';
}
