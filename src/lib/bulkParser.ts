import { Lesson } from '../types';
import { extractAbyssId, isValidAbyssInput, parseUniversalVideo } from './abyss';

export interface ParsedLessonItem {
  title: string;
  videoSource: string;
  isValid: boolean;
  rawFileName?: string;
  lessonNumber?: number;
  providerLabel?: string;
  durationMinutes?: number;
}

/**
 * Bóc tách thời lượng video từ chuỗi văn bản nếu có
 * Hỗ trợ: [06:10], (12:30), (01:05:20), [15m], (25p), [45 mins], 10 phút...
 */
export function extractDurationFromText(text: string): { durationMinutes?: number; cleanedText: string } {
  if (!text) return { cleanedText: text };
  let cleaned = text;
  let durationMinutes: number | undefined;

  // Pattern 1: [06:10], (12:30), (01:05:20)
  const timeMatch = text.match(/[\[\(](?:(\d+):)?(\d{1,2}):(\d{2})[\]\)]/);
  if (timeMatch) {
    const hours = timeMatch[1] ? parseInt(timeMatch[1], 10) : 0;
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    durationMinutes = Math.max(1, hours * 60 + minutes + (seconds >= 30 ? 1 : 0));
    cleaned = cleaned.replace(timeMatch[0], '').trim();
  } else {
    // Pattern 2: (15p), [20 phút], (25m), [30 mins], (45 min)
    const minMatch = text.match(/[\[\(](\d+)\s*(?:p|phút|m|min|mins|minutes)[\]\)]/i);
    if (minMatch) {
      durationMinutes = parseInt(minMatch[1], 10);
      cleaned = cleaned.replace(minMatch[0], '').trim();
    }
  }

  return { durationMinutes, cleanedText: cleaned };
}

export function parseBulkLessonInput(
  rawText: string,
  defaultPrefix: string = 'Bài',
  reverseOrder: boolean = false
): ParsedLessonItem[] {
  if (!rawText || !rawText.trim()) return [];

  const rawLines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const parsedItems: ParsedLessonItem[] = rawLines.map((rawLine, index) => {
    let line = rawLine.trim();

    // 0A. Extract BBCode if whole line is wrapped: [URL="https://..."][IMG]...[/IMG][/URL]
    const bbMatch = line.match(/\[URL=["']?([^\]"']+)["']?\]/i);
    if (bbMatch) {
      line = bbMatch[1];
    }

    // 0B. Extract HTML if whole line is wrapped: <a href="https://..."><img ... /></a>
    const aMatch = line.match(/<a\s+[^>]*href=["']([^"']+)["']/i);
    if (aMatch) {
      line = aMatch[1];
    }

    let title = '';
    let videoSource = '';
    let lessonNumber: number | undefined;
    let durationMinutes: number | undefined;

    // Helper to determine if a string segment is definitely a video source
    const isVideoSource = (str: string): boolean => {
      const s = str.trim();
      if (!s) return false;
      if (s.startsWith('<iframe') || s.startsWith('http://') || s.startsWith('https://')) {
        return true;
      }
      // If it ends with video extension and has no protocol, it's a filename, NOT a video source
      if (/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i.test(s)) {
        return false;
      }
      // Valid Abyss / Streamtape short ID pattern
      if (/^[a-zA-Z0-9_-]{6,30}$/.test(s) && !/^(Bài|Lesson|Chương|Chuong)/i.test(s)) {
        return true;
      }
      return false;
    };

    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      
      let candidateTitle = '';
      let candidateSource = '';

      // Priority 1: Search for an actual iframe or URL
      for (const part of parts) {
        if (part.startsWith('<iframe') || part.startsWith('http://') || part.startsWith('https://')) {
          candidateSource = part;
          break;
        }
      }

      // Priority 2: Abyss / Streamtape ID
      if (!candidateSource) {
        for (const part of parts) {
          if (isVideoSource(part)) {
            candidateSource = part;
            break;
          }
        }
      }

      // Find the best title (the part that is not candidateSource)
      for (const part of parts) {
        if (part !== candidateSource) {
          candidateTitle = part;
          break;
        }
      }

      if (!candidateSource && parts.length > 0) {
        candidateSource = parts[parts.length - 1];
      }
      if (!candidateTitle && parts.length > 0) {
        candidateTitle = parts[0];
      }

      videoSource = candidateSource;

      // Extract duration if present in candidateTitle or line
      const parsedDur = extractDurationFromText(candidateTitle);
      if (parsedDur.durationMinutes) {
        durationMinutes = parsedDur.durationMinutes;
        candidateTitle = parsedDur.cleanedText;
      }

      // Clean title and extract lesson number
      let cleanTitle = candidateTitle.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
      const prefixMatch = cleanTitle.match(/^(?:Bài|Lesson|Chuong|Chương)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      } else {
        title = cleanTitle;
      }
    } else if (line.includes(' - http') || line.includes(' - <iframe') || line.includes(' : http') || line.includes(' : <iframe')) {
      const parts = line.split(/ - | : /);
      let rawTitle = parts[0].replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
      
      const parsedDur = extractDurationFromText(rawTitle);
      if (parsedDur.durationMinutes) {
        durationMinutes = parsedDur.durationMinutes;
        rawTitle = parsedDur.cleanedText;
      }

      const prefixMatch = rawTitle.match(/^(?:Bài|Lesson)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      } else {
        title = rawTitle;
      }
      videoSource = parts.slice(1).join(' - ').trim();
    } else {
      // Single line
      if (isVideoSource(line)) {
        videoSource = line;
        title = `${defaultPrefix} ${index + 1}`;
      } else {
        let cleanTitle = line.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
        const parsedDur = extractDurationFromText(cleanTitle);
        if (parsedDur.durationMinutes) {
          durationMinutes = parsedDur.durationMinutes;
          cleanTitle = parsedDur.cleanedText;
        }

        const prefixMatch = cleanTitle.match(/^(?:Bài|Lesson)?\s*(\d+)[\.\s:_-]+(.+)/i);
        if (prefixMatch) {
          lessonNumber = parseInt(prefixMatch[1], 10);
          title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
        } else {
          title = cleanTitle;
        }
        videoSource = line;
      }
    }

    // Double Check Swap Guard: If title contains iframe/http and videoSource doesn't, swap!
    if (
      (title.startsWith('<iframe') || title.startsWith('http://') || title.startsWith('https://')) &&
      !videoSource.startsWith('<iframe') && !videoSource.startsWith('http://') && !videoSource.startsWith('https://')
    ) {
      const temp = title;
      title = videoSource.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
      const parsedDur = extractDurationFromText(title);
      if (parsedDur.durationMinutes) {
        durationMinutes = parsedDur.durationMinutes;
        title = parsedDur.cleanedText;
      }

      const prefixMatch = title.match(/^(?:Bài|Lesson|Chuong|Chương)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      }
      videoSource = temp;
    }

    const universalVideo = parseUniversalVideo(videoSource);

    // If title is default generic "Bài X" and URL contains a rich filename, use it!
    if ((!title || title === `${defaultPrefix} ${index + 1}`) && universalVideo.extractedTitle) {
      title = universalVideo.extractedTitle;
      const prefixMatch = title.match(/^(?:Bài|Lesson|Chuong|Chương)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
      }
    }

    return {
      title: title || `${defaultPrefix} ${index + 1}`,
      videoSource,
      isValid: universalVideo.provider !== 'unknown' && universalVideo.embedUrl !== '',
      lessonNumber,
      providerLabel: universalVideo.label,
      durationMinutes,
    };
  });

  if (reverseOrder) {
    return parsedItems.reverse();
  }

  return parsedItems;
}

export function createLessonsFromParsed(
  parsed: ParsedLessonItem[]
): Lesson[] {
  return parsed.map((item, index) => ({
    id: `les-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    title: item.title,
    type: 'video',
    videoSource: item.videoSource,
    durationMinutes: item.durationMinutes || 15,
    isCompleted: false,
    isStarred: false,
    attachments: [],
  }));
}
