export type CategoryType = string;

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type?: 'pdf' | 'drive' | 'github' | 'link';
}

export interface Lesson {
  id: string;
  title: string;
  type?: 'video' | 'article' | 'mixed'; // Default 'video'
  videoSource?: string; // Abyss ID or full embed URL or iframe tag (optional if pure article)
  content?: string; // Markdown or article text content for reading lessons
  durationMinutes?: number;
  attachments?: Attachment[];
  isCompleted?: boolean;
  isStarred?: boolean;
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
  category: CategoryType;
  instructor?: string; // Tác giả / Giảng viên (ví dụ: Andrew Ng, Huy Nguyễn, ...)
  sourcePlatform?: string; // Nguồn khóa học (ví dụ: Udemy, Coursera, KTcity, Unica, Drive, ...)
  tags: string[];
  thumbnailUrl?: string;
  chapters: Chapter[];
  lastWatchedLessonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContinueProgress {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  category: CategoryType;
  videoSource?: string;
  timestamp: string;
}

export interface UserStats {
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  todayCompletedCount: number;
  totalCompletedCount: number;
}

