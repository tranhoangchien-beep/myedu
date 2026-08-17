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
    id: 'course-ai-generative-mastery',
    title: 'Làm Chủ Trí Tuệ Nhân Tạo & Generative AI Thực Chiến',
    description: 'Chinh phục Prompt Engineering, mô hình LLM, xây dựng AI Agents tự động hóa quy trình làm việc và ứng dụng thực tiễn trong doanh nghiệp.',
    category: 'AI & Machine Learning',
    instructor: 'Andrew Ng & Hoàng Minh',
    sourcePlatform: 'Coursera',
    tags: ['AI', 'Generative AI', 'LLM', 'Prompt Engineering', 'Automation'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T08:00:00Z',
    updatedAt: '2026-08-17T04:00:00Z',
    lastWatchedLessonId: 'les-ai-102',
    chapters: [
      {
        id: 'ch-ai-fundamentals',
        title: 'Chương 1: Nền Tảng Kỹ Thuật Prompt & Tư Duy AI',
        order: 1,
        lessons: [
          {
            id: 'les-ai-101',
            title: 'Bài 1: Giới thiệu Tổng quan Kiến trúc LLM & AI Agents',
            type: 'video',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>',
            durationMinutes: 25,
            isCompleted: true,
            isStarred: true,
            notes: 'Mốc thời gian quan trọng:\n- [04:15] Khái niệm Attention Mechanism.\n- [12:30] Sự khác biệt giữa Fine-tuning và RAG.\n- Cần ôn lại phần Embedding vector.',
            attachments: [
              {
                id: 'att-ai-1',
                name: 'Slide_KienTruc_LLM_Chuong1.pdf',
                url: 'https://drive.google.com/file/d/sample-ai-pdf',
                type: 'pdf'
              },
              {
                id: 'att-ai-2',
                name: 'Kho Prompt Mẫu Chuẩn (GitHub Repo)',
                url: 'https://github.com/myedu/prompt-engineering-vault',
                type: 'github'
              }
            ]
          },
          {
            id: 'les-ai-102',
            title: 'Bài 2: Hướng dẫn Kỹ thuật Prompting Nâng cao (CoT & Few-shot)',
            type: 'mixed',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            content: '# Hướng Dẫn Thực Hành Kỹ Thuật Chain-of-Thought (CoT)\n\nKỹ thuật **Chain-of-Thought** giúp mô hình ngôn ngữ lớn giải quyết các bài toán logic phức tạp bằng cách chia nhỏ quá trình tư duy thành từng bước.\n\n### 1. Cấu trúc Prompt Tiêu Chuẩn\n> **Quy tắc vàng:** Hãy yêu cầu mô hình giải thích từng bước trước khi đưa ra câu trả lời cuối cùng.\n\n```markdown\nBạn là một chuyên gia phân tích dữ liệu.\nHãy giải quyết vấn đề sau theo từng bước:\nBước 1: Xác định các biến số đầu vào.\nBước 2: Lập công thức tính toán chỉ số CAC và LTV.\nBước 3: Đưa ra nhận xét và kết luận.\n```\n\n### 2. Các Lỗi Thường Gặp Khi Prompting\n* Đặt câu hỏi quá chung chung, thiếu ngữ cảnh.\n* Không chỉ định định dạng đầu ra (JSON, Markdown, Bảng biểu).\n* Bỏ qua bước kiểm tra lại tính logic của mô hình.',
            durationMinutes: 35,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-ai-3',
                name: 'Sổ tay Jupyter Notebook Thực Hành (Google Colab)',
                url: 'https://colab.research.google.com',
                type: 'link'
              }
            ]
          }
        ]
      },
      {
        id: 'ch-ai-agents',
        title: 'Chương 2: Xây Dựng Autonomous AI Agent Tự Vận Hành',
        order: 2,
        lessons: [
          {
            id: 'les-ai-201',
            title: 'Bài 3: Cẩm nang Thiết kế Tool Calling & Tích hợp API',
            type: 'article',
            content: '# Cẩm Nang Thiết Kế AI Tool Calling\n\nAI Agent không chỉ dừng lại ở việc sinh văn bản, mà còn có khả năng **gọi công cụ bên ngoài (Tool Use / Function Calling)** để truy xuất dữ liệu thời gian thực và tương tác với hệ thống.\n\n## Kiến Trúc Hoạt Động\n1. **User Request**: Người dùng đưa ra chỉ thị.\n2. **Model Decision**: Mô hình phân tích và quyết định công cụ cần kích hoạt.\n3. **Tool Execution**: Client chạy hàm logic và trả kết quả về cho mô hình.\n4. **Final Response**: Mô hình tổng hợp thông tin và trả lời hoàn chỉnh.\n\n```json\n{\n  "name": "fetch_weather_forecast",\n  "description": "Lấy dự báo thời tiết tại thành phố chỉ định",\n  "parameters": {\n    "type": "object",\n    "properties": {\n      "city": { "type": "string" }\n    },\n    "required": ["city"]\n  }\n}\n```',
            durationMinutes: 20,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-ai-4',
                name: 'Thư mục Mã nguồn Mẫu (Google Drive)',
                url: 'https://drive.google.com/drive/folders/sample-agent-code',
                type: 'drive'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-react-nextjs-fullstack',
    title: 'Lập Trình Web Hiện Đại Với React 18, Next.js & TypeScript',
    description: 'Từ tư duy kiến trúc Component sạch, tối ưu hóa tốc độ tải trang, Responsive Design System với Tailwind CSS đến triển khai PWA.',
    category: 'Lập trình',
    instructor: 'Alex Đặng (Senior Frontend Architect)',
    sourcePlatform: 'KTcity',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'PWA'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T09:00:00Z',
    updatedAt: '2026-08-17T03:30:00Z',
    lastWatchedLessonId: 'les-dev-101',
    chapters: [
      {
        id: 'ch-dev-setup',
        title: 'Chương 1: Khởi Tạo Dự Án & Chuẩn Hóa TypeScript',
        order: 1,
        lessons: [
          {
            id: 'les-dev-101',
            title: 'Bài 1: Cấu hình Next.js App Router & Strict TypeScript',
            type: 'video',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 28,
            isCompleted: true,
            isStarred: false,
            attachments: [
              {
                id: 'att-dev-1',
                name: 'Starter_Template_NextJS.zip (Drive)',
                url: 'https://drive.google.com',
                type: 'drive'
              }
            ]
          },
          {
            id: 'les-dev-102',
            title: 'Bài 2: Kỹ thuật nhúng Video Abyss Player & Sandboxing Iframe',
            type: 'video',
            videoSource: 'bGOgQoLE0',
            durationMinutes: 32,
            isCompleted: false,
            isStarred: true
          }
        ]
      },
      {
        id: 'ch-dev-state',
        title: 'Chương 2: Tối Ưu State Management & LocalStorage Persistence',
        order: 2,
        lessons: [
          {
            id: 'les-dev-201',
            title: 'Bài 3: Xây dựng Custom Storage Hook & Quản lý Tiến độ',
            type: 'mixed',
            videoSource: 'Ld3tfGRGA',
            content: '# Quản Lý LocalStorage Bất Đồng Bộ Trong React\n\nKhi làm việc với `localStorage`, cần đảm bảo cơ chế đồng bộ tránh gây hiện tượng Layout Shift và lỗi Hydration trên SSR.\n\n### Ví dụ Custom Hook:\n```tsx\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n  // ...\n}\n```',
            durationMinutes: 40,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-uiux-design-handbook',
    title: 'Cẩm Nang Thiết Kế UI/UX & Xây Dựng Design System Chuyên Nghiệp',
    description: 'Khóa học lý thuyết bài đọc toàn diện về quy chuẩn phối màu 60-30-10, Typography Scale, thiết kế vi chuyển động (Micro-interactions) và Lean UX.',
    category: 'Thiết kế đồ họa',
    instructor: 'Huy Nguyễn (Lead Product Designer)',
    sourcePlatform: 'Udemy',
    tags: ['UI/UX', 'Design System', 'Figma', 'Typography', 'Color Theory'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-17T02:00:00Z',
    lastWatchedLessonId: 'les-uiux-101',
    chapters: [
      {
        id: 'ch-uiux-theory',
        title: 'Chương 1: Quy Chuẩn Visual Design & Typography',
        order: 1,
        lessons: [
          {
            id: 'les-uiux-101',
            title: 'Bài 1: Nguyên Tắc Phối Màu 60-30-10 & Bảng Màu HSL Cho Dark Mode',
            type: 'article',
            content: '# Nguyên Tắc Phối Màu 60-30-10 Trong Giao Diện Tối (Dark Mode)\n\nThiết kế Dark Mode không chỉ đơn thuần là đổi nền đen thành chữ trắng. Cần sử dụng các sắc độ xám đậm có chiều sâu và độ tương phản chuẩn WCAG AAA.\n\n## 1. Tỷ Lệ Phối Màu Vàng\n* **60% Nền chủ đạo (Background)**: Xám đen sâu (`#0f172a` hoặc `#020617`).\n* **30% Khối bề mặt & Card (Surface)**: Xám Slate mờ (`#1e293b`).\n* **10% Điểm nhấn (Accent Color)**: Màu xanh ngọc Emerald (`#10b981`) hoặc Teal để tạo cảm giác tươi mới, dễ chịu cho mắt.\n\n## 2. Bảng Thang Đo Typographic Scale Chuẩn Web\n| Cấp độ | Kích thước Font | Line Height | Ứng dụng |\n| :--- | :--- | :--- | :--- |\n| **Display/H1** | 28px - 32px | 1.25 | Tiêu đề chính trang web |\n| **H2** | 22px - 24px | 1.3 | Tiêu đề chương / phân mục |\n| **H3** | 18px - 20px | 1.4 | Tiêu đề bài học |\n| **Body** | 16px - 18px | 1.6 | Văn bản đọc bài viết |',
            durationMinutes: 15,
            isCompleted: true,
            isStarred: true,
            attachments: [
              {
                id: 'att-uiux-1',
                name: 'Design_Tokens_Cheatsheet.pdf',
                url: 'https://drive.google.com/sample-uiux-pdf',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'les-uiux-102',
            title: 'Bài 2: Triết Lý Thiết Kế Lean UX & Tối Giản Hóa Trải Nghiệm Học Tập',
            type: 'article',
            content: '# Triết Lý Thiết Kế Lean UX Cho Nền Tảng Học Tập\n\nMột sản phẩm tốt là một sản phẩm giúp người dùng **đạt được mục tiêu nhanh nhất với ít phiền toái nhất**.\n\n> *\"Less is more - Loại bỏ tất cả những chi tiết thừa thãi để người học tập trung hoàn toàn vào nội dung bài giảng.\"*\n\n### 4 Tiêu Chí Cốt Lõi:\n1. **Zero Distraction**: Không thanh điều hướng rườm rà khi đang xem video.\n2. **1-Click Resume**: Vào ứng dụng là có thể tiếp tục xem ngay bài đang học dở.\n3. **Direct Drag & Drop**: Quản trị viên sắp xếp giáo trình trực quan bằng kéo thả tay nắm `⠿`.\n4. **Phím Tắt Tiện Lợi**: Điều khiển trình phát video tức thì bằng bàn phím mà không cần rê chuột.',
            durationMinutes: 18,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-growth-marketing-funnel',
    title: 'Chiến Lược Growth Marketing & Phân Tích Phễu Chuyển Đổi',
    description: 'Nắm vững các chỉ số CAC, LTV, Retention Rate, A/B Testing và chiến lược tăng trưởng người dùng bền vững.',
    category: 'Marketing',
    instructor: 'Nguyễn Tiến Dũng',
    sourcePlatform: 'Unica',
    tags: ['Marketing', 'Growth', 'Analytics', 'Funnel', 'Conversion'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T11:00:00Z',
    updatedAt: '2026-08-17T01:00:00Z',
    lastWatchedLessonId: 'les-mkt-101',
    chapters: [
      {
        id: 'ch-mkt-funnel',
        title: 'Chương 1: Tối Ưu Hóa Phễu Chuyển Đổi (Conversion Funnel)',
        order: 1,
        lessons: [
          {
            id: 'les-mkt-101',
            title: 'Bài 1: Phân Tích Chỉ Số CAC và LTV Trong Mô Hình Digital',
            type: 'video',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 22,
            isCompleted: true,
            isStarred: false
          },
          {
            id: 'les-mkt-102',
            title: 'Bài 2: Thực Hành Đo Lường Phễu Với Google Analytics 4',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 30,
            isCompleted: true,
            isStarred: true
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
    const parsed: Course[] = JSON.parse(data);
    // Auto-migrate if older initial sample dataset is detected
    if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].id === 'course-ai-mastery' || parsed[0].id === 'course-web-dev')) {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(INITIAL_SAMPLE_COURSES));
      return INITIAL_SAMPLE_COURSES;
    }
    return parsed;
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
      const parsed: ContinueProgress = JSON.parse(data);
      if (parsed.courseId === 'course_ai_mastery' || parsed.courseId === 'course-ai-mastery') {
        parsed.courseId = 'course-ai-generative-mastery';
        parsed.courseTitle = 'Làm Chủ Trí Tuệ Nhân Tạo & Generative AI Thực Chiến';
        parsed.lessonId = 'les-ai-102';
        parsed.lessonTitle = 'Bài 2: Hướng dẫn Kỹ thuật Prompting Nâng cao (CoT & Few-shot)';
        parsed.category = 'AI & Machine Learning';
        parsed.videoSource = 'https://abyssplayer.com/bGOgQoLE0';
        saveContinueProgress(parsed);
      }
      return parsed;
    }
    return {
      courseId: 'course-ai-generative-mastery',
      courseTitle: 'Làm Chủ Trí Tuệ Nhân Tạo & Generative AI Thực Chiến',
      lessonId: 'les-ai-102',
      lessonTitle: 'Bài 2: Hướng dẫn Kỹ thuật Prompting Nâng cao (CoT & Few-shot)',
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

