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
      let rawTitle = parts[0];

      // Strip video file extensions (.mp4, .webm, .mkv, .avi, .mov, .flv, .wmv, .ts, etc.)
      rawTitle = rawTitle.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v)$/i, '').trim();

      // Check if filename starts with a number like "7 Xác định..." or "07. Lãi suất..."
      const numMatch = rawTitle.match(/^(\d+)[\.\s_-]+(.+)/);
      if (numMatch) {
        lessonNumber = parseInt(numMatch[1], 10);
        title = `Bài ${numMatch[1]}: ${numMatch[2].trim()}`;
      } else {
        title = rawTitle;
      }

      // Extract source URL (prefer part 1 if valid URL/iframe, else part 2)
      if (parts[1] && (parts[1].startsWith('http') || parts[1].startsWith('<iframe'))) {
        videoSource = parts[1];
      } else if (parts[2] && (parts[2].startsWith('http') || parts[2].startsWith('<iframe'))) {
        videoSource = parts[2];
      } else {
        videoSource = parts.slice(1).join('|');
      }
    } else if (line.includes(' - http') || line.includes(' - <iframe') || line.includes(' : http')) {
      // Pattern B: "Title - Link" or "Title : Link"
      const parts = line.split(/ - | : /);
      let rawTitle = parts[0].replace(/\.(mp4|webm|mkv|avi|mov)$/i, '').trim();
      const numMatch = rawTitle.match(/^(\d+)[\.\s_-]+(.+)/);
      if (numMatch) {
        lessonNumber = parseInt(numMatch[1], 10);
        title = `Bài ${numMatch[1]}: ${numMatch[2].trim()}`;
      } else {
        title = rawTitle;
      }
      videoSource = parts.slice(1).join(' - ').trim();
    } else {
      // Pattern C: Single line link or iframe or filename
      const numMatch = line.match(/^(\d+)[\.\s_-]+(.+)/);
      if (numMatch) {
        lessonNumber = parseInt(numMatch[1], 10);
        title = `Bài ${numMatch[1]}: ${numMatch[2].trim()}`;
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
    id: `lesson_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
    title: item.title,
    videoSource: item.videoSource,
    isCompleted: false,
    attachments: [],
  }));
}
