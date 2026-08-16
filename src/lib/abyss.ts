/**
 * Abyss Video Parser & Normalizer
 * Hỗ trợ bóc tách ID và sinh URL nhúng an toàn cho player.abyssplayer.com / abyssplayer.com / abyss.to
 */

export function extractAbyssId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Trường hợp là thẻ iframe: <iframe ... src="https://player.abyssplayer.com/mZ2faMYp2" ...>
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  // 2. Trường hợp là URL player.abyssplayer.com/ID, abyssplayer.com/ID hoặc abyss.to/v/ID hoặc abyss.to/e/ID
  const urlMatch = targetUrl.match(/(?:player\.abyssplayer\.com|abyssplayer\.com|abyss\.to\/(?:v|e|embed))\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // 3. Trường hợp người dùng chỉ dán trực tiếp ID (ví dụ: mZ2faMYp2, Ld3tfGRGA, bGOgQoLE0)
  if (/^[a-zA-Z0-9_-]{5,25}$/.test(trimmed)) {
    return trimmed;
  }

  // 4. Nếu là bất kỳ URL nào khác có id ở cuối
  const genericMatch = targetUrl.match(/\/([a-zA-Z0-9_-]{6,20})(?:\?|\/|$)/);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return null;
}

export function getAbyssEmbedUrl(input: string): string {
  const id = extractAbyssId(input);
  if (!id) return '';
  // Ưu tiên chuẩn embed player.abyssplayer.com
  return `https://player.abyssplayer.com/${id}`;
}

export function isValidAbyssInput(input: string): boolean {
  return extractAbyssId(input) !== null;
}
