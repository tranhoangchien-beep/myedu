import { Lesson } from '../types';
import { extractAbyssId } from './abyss';

export interface ParsedLessonItem {
  title: string;
  videoSource: string;
  isValid: boolean;
}

export function parseBulkLessonInput(
  rawText: string,
  defaultPrefix: string = 'Bài'
): ParsedLessonItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.map((line, index) => {
    let title = `${defaultPrefix} ${index + 1}`;
    let rawSource = line;

    // Pattern A: "Tiêu đề | Link/Iframe" hoặc "Tiêu đề - Link/Iframe"
    if (line.includes('|')) {
      const parts = line.split('|');
      title = parts[0].trim();
      rawSource = parts.slice(1).join('|').trim();
    } else if (line.includes(' - http') || line.includes(' - <iframe') || line.includes(' : http')) {
      const parts = line.split(/ - | : /);
      title = parts[0].trim();
      rawSource = parts.slice(1).join(' - ').trim();
    } else {
      // Pattern B: Dòng chỉ chứa <iframe ...> hoặc link https://abyssplayer.com/...
      // Kiểm tra nếu có số thứ tự ở đầu dạng "1. https://..." hoặc "Bài 1. https://..."
      const numberedPrefix = line.match(/^((?:Bài\s*)?\d+[\.\:\-\)]\s*)(.+)/i);
      if (numberedPrefix) {
        title = `${defaultPrefix} ${index + 1}`;
        rawSource = numberedPrefix[2].trim();
      }
    }

    const videoId = extractAbyssId(rawSource);

    return {
      title: title || `${defaultPrefix} ${index + 1}`,
      videoSource: rawSource,
      isValid: videoId !== null,
    };
  });
}

export function createLessonsFromParsed(
  parsed: ParsedLessonItem[]
): Lesson[] {
  return parsed.map((item, index) => ({
    id: `lesson_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
    title: item.title,
    videoSource: item.videoSource,
    isCompleted: false,
    isStarred: false,
    attachments: [],
  }));
}
