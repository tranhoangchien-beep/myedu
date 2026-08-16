---
name: course-data-manager
description: >-
  Manage course structures, batch import lesson links, progress tracking, and JSON data backup/export.
  Use when designing database models, importing courses in bulk, or managing learning progress state.
---

# Course Data Manager Skill

This skill defines the data models, bulk ingestion logic, and local state management for the MyEdu e-learning platform.

## 1. Core Data Models

```typescript
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'drive' | 'github' | 'link';
}

export interface Lesson {
  id: string;
  title: string;
  videoSource: string; // Abyss ID or URL
  durationMinutes?: number;
  attachments?: Attachment[];
  isCompleted?: boolean;
  isStarred?: boolean;
  lastWatchedAt?: string;
  notes?: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string; // 'Kinh doanh' | 'Marketing' | 'AI' | 'Lập trình' | 'Kỹ năng sống' | 'Data'
  tags: string[];
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
  lastLessonId?: string; // For 1-click continue
}
```

## 2. Bulk Ingestion Parser

When the user pastes a raw list of Abyss links or iframe tags, parse them automatically into lessons:

```typescript
export function parseBulkLessonInput(rawText: string, defaultTitlePrefix = 'Bài'): Partial<Lesson>[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  return lines.map((line, index) => {
    // Check if line format is "Title - https://abyssplayer.com/ID" or just "<iframe...>"
    let title = `${defaultTitlePrefix} ${index + 1}`;
    let videoSource = line;

    if (line.includes('|') || line.includes(' - ')) {
      const separator = line.includes('|') ? '|' : ' - ';
      const parts = line.split(separator);
      title = parts[0].trim();
      videoSource = parts.slice(1).join(separator).trim();
    }

    return {
      id: `lesson_${Date.now()}_${index}`,
      title,
      videoSource,
      isCompleted: false,
      isStarred: false,
    };
  });
}
```
