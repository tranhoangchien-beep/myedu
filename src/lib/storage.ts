import { Course, ContinueProgress, CategoryType, UserStats } from '../types';

const STORAGE_KEY_COURSES = 'myedu_courses_v1';
const STORAGE_KEY_CONTINUE = 'myedu_continue_progress_v1';
const STORAGE_KEY_CATEGORIES = 'myedu_categories_v1';
const STORAGE_KEY_SOURCES = 'myedu_sources_v1';
const STORAGE_KEY_STATS = 'myedu_user_stats_v1';

export const DEFAULT_CATEGORIES: string[] = [
  'AI & Machine Learning',
  'Lập trình',
  'Marketing',
  'Kinh doanh',
  'Phân tích dữ liệu',
  'Kỹ năng sống',
  'Ngoại ngữ',
  'Thiết kế đồ họa'
];

export const DEFAULT_SOURCES: string[] = [
  'Udemy',
  'Coursera',
  'KTcity',
  'Unica',
  'Google Drive',
  'YouTube',
  'Khác'
];

export const INITIAL_SAMPLE_COURSES: Course[] = [
  {
    id: 'course_ai_mastery',
    title: 'Làm Chủ Trí Tuệ Nhân Tạo & AI Generative Ứng Dụng',
    description: 'Khóa học thực chiến ứng dụng AI, Large Language Models và tự động hóa quy trình công việc hiện đại.',
    category: 'AI & Machine Learning',
    instructor: 'Hoàng Minh (AI Specialist)',
    sourcePlatform: 'Udemy',
    tags: ['AI', 'Prompt Engineering', 'Automation', 'ChatGPT'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
    chapters: [
      {
        id: 'ch_1',
        title: 'Chương 1: Nền tảng AI & Tư duy Thiết kế Prompt',
        order: 1,
        lessons: [
          {
            id: 'les_ai_1',
            title: 'Bài 1: Giới thiệu Kiến trúc AI & Bối cảnh phát triển',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>',
            durationMinutes: 24,
            isCompleted: true,
            isStarred: true,
            attachments: [
              { id: 'att_1', name: 'Slide Bài giảng Chương 1 (PDF)', url: 'https://drive.google.com', type: 'pdf' },
              { id: 'att_2', name: 'Kho Prompt Mẫu Thực chiến', url: 'https://github.com', type: 'github' }
            ]
          },
          {
            id: 'les_ai_2',
            title: 'Bài 2: Thực hành Kỹ thuật Prompt Nâng cao & Chain-of-Thought',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/bGOgQoLE0" allowfullscreen></iframe>',
            durationMinutes: 32,
            isCompleted: false,
            isStarred: false,
            attachments: [
              { id: 'att_3', name: 'Tài liệu Thực hành Google Colab', url: 'https://colab.research.google.com', type: 'link' }
            ]
          }
        ]
      },
      {
        id: 'ch_2',
        title: 'Chương 2: Tự động hóa Quy trình với AI Agents',
        order: 2,
        lessons: [
          {
            id: 'les_ai_3',
            title: 'Bài 3: Xây dựng AI Agent cá nhân tự động hóa việc học',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 40,
            isCompleted: false,
            isStarred: false,
          }
        ]
      }
    ]
  },
  {
    id: 'course_fullstack_dev',
    title: 'Xây Dựng Web App Toàn Diện Với React, Next.js & TypeScript',
    description: 'Từ tư duy cấu trúc mã nguồn, tối ưu hóa giao diện đa thiết bị đến triển khai ứng dụng Cloud.',
    category: 'Lập trình',
    instructor: 'Alex Đặng',
    sourcePlatform: 'KTcity',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    createdAt: '2026-08-16T11:00:00Z',
    updatedAt: '2026-08-16T11:00:00Z',
    chapters: [
      {
        id: 'ch_dev_1',
        title: 'Phần 1: Kiến trúc Component & State Management',
        order: 1,
        lessons: [
          {
            id: 'les_dev_1',
            title: 'Bài 1: Thiết lập môi trường & Chuẩn hóa TypeScript',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 28,
            isCompleted: true,
            isStarred: false,
          },
          {
            id: 'les_dev_2',
            title: 'Bài 2: Tối ưu Iframe Video Player & Phím tắt bàn phím',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 35,
            isCompleted: false,
            isStarred: true,
          }
        ]
      }
    ]
  },
  {
    id: 'course_growth_marketing',
    title: 'Chiến Lược Growth Marketing & Tối Ưu Hóa Chuyển Đổi',
    description: 'Phương pháp xây dựng phễu khách hàng, phân tích chỉ số CAC, LTV và tăng trưởng doanh thu bền vững.',
    category: 'Marketing',
    instructor: 'Nguyễn Tiến Dũng',
    sourcePlatform: 'Coursera',
    tags: ['Growth', 'Funnel', 'SEO', 'Analytics'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    createdAt: '2026-08-16T12:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
    chapters: [
      {
        id: 'ch_mkt_1',
        title: 'Chương 1: Phễu Chuyển Đổi & Tâm Lý Khách Hàng',
        order: 1,
        lessons: [
          {
            id: 'les_mkt_1',
            title: 'Bài 1: Bản đồ hành trình khách hàng trong kỷ nguyên số',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 22,
            isCompleted: false,
            isStarred: false,
          }
        ]
      }
    ]
  }
];

export function getStoredCourses(): Course[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_COURSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(INITIAL_SAMPLE_COURSES));
      return INITIAL_SAMPLE_COURSES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse courses from localStorage', error);
    return INITIAL_SAMPLE_COURSES;
  }
}

export function saveCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
  } catch (error) {
    console.error('Failed to save courses to localStorage', error);
  }
}

export function getStoredCategories(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories', error);
  }
}

export function getStoredSources(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SOURCES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SOURCES;
  }
}

export function saveSources(sources: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(sources));
  } catch (error) {
    console.error('Failed to save sources', error);
  }
}

export function getContinueProgress(): ContinueProgress | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONTINUE);
    if (data) {
      return JSON.parse(data);
    }
    return {
      courseId: 'course_ai_mastery',
      courseTitle: 'Làm Chủ Trí Tuệ Nhân Tạo & AI Generative Ứng Dụng',
      lessonId: 'les_ai_2',
      lessonTitle: 'Bài 2: Thực hành Kỹ thuật Prompt Nâng cao & Chain-of-Thought',
      category: 'AI & Machine Learning',
      videoSource: 'https://abyssplayer.com/bGOgQoLE0',
      timestamp: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function saveContinueProgress(progress: ContinueProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTINUE, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save continue progress', error);
  }
}

export function getStoredUserStats(): UserStats {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEY_STATS);
    if (!data) {
      const defaultStats: UserStats = {
        streak: 1,
        lastStudyDate: today,
        todayCompletedCount: 0,
        totalCompletedCount: 0
      };
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(defaultStats));
      return defaultStats;
    }
    const parsed: UserStats = JSON.parse(data);
    
    // Check if new day -> reset todayCompletedCount
    if (parsed.lastStudyDate !== today) {
      const d1 = new Date(today);
      const d2 = new Date(parsed.lastStudyDate);
      const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
      
      let newStreak = parsed.streak;
      if (diffDays === 1) {
        // Kept streak
      } else if (diffDays > 1) {
        // Missed day
        newStreak = 1;
      }
      
      const updatedStats: UserStats = {
        ...parsed,
        streak: newStreak,
        todayCompletedCount: 0
      };
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updatedStats));
      return updatedStats;
    }
    return parsed;
  } catch {
    return {
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      todayCompletedCount: 0,
      totalCompletedCount: 0
    };
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save user stats', error);
  }
}

export function recordLessonCompletionStats(isNowCompleted: boolean): UserStats {
  const current = getStoredUserStats();
  const today = new Date().toISOString().split('T')[0];
  
  const d1 = new Date(today);
  const d2 = new Date(current.lastStudyDate);
  const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  
  let newStreak = current.streak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const todayCount = isNowCompleted 
    ? (current.todayCompletedCount + 1)
    : Math.max(0, current.todayCompletedCount - 1);

  const totalCount = isNowCompleted
    ? (current.totalCompletedCount + 1)
    : Math.max(0, current.totalCompletedCount - 1);

  const updated: UserStats = {
    streak: Math.max(1, newStreak),
    lastStudyDate: today,
    todayCompletedCount: todayCount,
    totalCompletedCount: totalCount
  };

  saveUserStats(updated);
  return updated;
}

