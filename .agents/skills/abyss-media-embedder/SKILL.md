---
name: abyss-media-embedder
description: >-
  Parse, validate, and normalize Abyss video player links, IDs, and iframe embed codes
  for the MyEdu learning platform. Use when importing new video lessons or rendering player components.
---

# Abyss Media Embedder Skill

This skill provides utilities and guidelines for extracting Video IDs and rendering clean, secure Abyssplayer embed iframes.

## 1. Supported Input Formats

The parser must support all of the following:

1. **Full iframe tags:**
   ```html
   <iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>
   ```
2. **Direct URLs:**
   - `https://abyssplayer.com/Ld3tfGRGA`
   - `https://abyss.to/v/Ld3tfGRGA`
   - `https://abyss.to/e/Ld3tfGRGA`
3. **Raw Video IDs:**
   - `Ld3tfGRGA`
   - `bGOgQoLE0`

## 2. Normalization Regex Pattern

To extract the clean Abyss Video ID:
```typescript
export function extractAbyssId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // If it's a raw alphanumeric ID (typically 8-15 chars)
  if (/^[a-zA-Z0-9_-]{5,20}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match src in iframe or direct URL
  const urlMatch = trimmed.match(/(?:abyssplayer\.com|abyss\.to\/(?:v|e))\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  return null;
}

export function getAbyssEmbedUrl(videoIdOrInput: string): string {
  const id = extractAbyssId(videoIdOrInput);
  return id ? `https://abyssplayer.com/${id}` : '';
}
```

## 3. Sandboxed Player Component Template

```tsx
interface AbyssPlayerProps {
  videoId: string;
  title?: string;
  onEnded?: () => void;
}

export const AbyssPlayer: React.FC<AbyssPlayerProps> = ({ videoId, title }) => {
  const embedUrl = getAbyssEmbedUrl(videoId);
  
  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 rounded-xl">
        Video ID không hợp lệ hoặc chưa được cấu hình.
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <iframe
        src={embedUrl}
        title={title || 'Abyss Video Lesson'}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
      />
    </div>
  );
};
```
