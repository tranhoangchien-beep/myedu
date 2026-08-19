import { Lesson } from '../types';
import { extractAbyssId, isValidAbyssInput, parseUniversalVideo } from './abyss';

export interface ParsedLessonItem {
  title: string;
  videoSource: string;
  isValid: boolean;
  rawFileName?: string;
  lessonNumber?: number;
  providerLabel?: string;
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

  const parsedItems: ParsedLessonItem[] = rawLines.map((line, index) => {
    let title = `${defaultPrefix} ${index + 1}`;
    let videoSource = line;
    let lessonNumber: number | undefined;

    // Pattern A: Abyss 3-part or 2-part pipe format: "Filename.mp4 | URL | <iframe...>"
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      
      // Find candidate title and candidate video source
      let rawTitle = '';
      let detectedSource = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!detectedSource && (part.startsWith('http') || part.startsWith('<iframe') || isValidAbyssInput(part))) {
          detectedSource = part;
        } else if (!rawTitle) {
          rawTitle = part;
        }
      }

      if (!detectedSource) {
        detectedSource = parts[parts.length - 1];
      }
      videoSource = detectedSource;

      // Strip video file extensions (.mp4, .webm, .mkv, .avi, .mov, .flv, .wmv, .ts, .m4v, .3gp)
      rawTitle = (rawTitle || parts[0]).replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();

      // Check if filename starts with a number like "7 Xác định...", "07. Lãi suất...", "Bài 7: ..."
      const prefixMatch = rawTitle.match(/^(?:Bài|Lesson|Chuong|Chương)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      } else {
        title = rawTitle;
      }
    } else if (line.includes(' - http') || line.includes(' - <iframe') || line.includes(' : http')) {
      // Pattern B: "Title - Link" or "Title : Link"
      const parts = line.split(/ - | : /);
      let rawTitle = parts[0].replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
      const prefixMatch = rawTitle.match(/^(?:Bài|Lesson)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      } else {
        title = rawTitle;
      }
      videoSource = parts.slice(1).join(' - ').trim();
    } else {
      // Pattern C: Single line link or iframe or filename
      const prefixMatch = line.match(/^(?:Bài|Lesson)?\s*(\d+)[\.\s:_-]+(.+)/i);
      if (prefixMatch) {
        lessonNumber = parseInt(prefixMatch[1], 10);
        title = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
      }
    }

    const universalVideo = parseUniversalVideo(videoSource);

    return {
      title: title || `${defaultPrefix} ${index + 1}`,
      videoSource,
      isValid: universalVideo.provider !== 'unknown' && universalVideo.embedUrl !== '',
      lessonNumber,
      providerLabel: universalVideo.label,
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
    durationMinutes: 15,
    isCompleted: false,
    isStarred: false,
    attachments: [],
  }));
}
