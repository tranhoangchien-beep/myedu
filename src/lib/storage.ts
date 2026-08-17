import { Course, ContinueProgress, CategoryType, UserStats } from '../types';

const STORAGE_KEY_COURSES = 'myedu_courses_v1';
const STORAGE_KEY_CONTINUE = 'myedu_continue_progress_v1';
const STORAGE_KEY_CATEGORIES = 'myedu_categories_v1';
const STORAGE_KEY_SOURCES = 'myedu_sources_v1';
const STORAGE_KEY_INSTRUCTORS = 'myedu_instructors_v1';
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

export const DEFAULT_INSTRUCTORS: string[] = [
  'Andrew Ng & Hoàng Minh',
  'Alex Đặng (Tech Lead)',
  'Sarah Jenkins (Senior Product Designer)',
  'Đặng Lê Quân (Growth Strategist)',
  'Vũ Minh Tuấn (Principal Cloud Architect)',
  'TS. Phan Thanh Hải (Chief Data Scientist)',
  'Lê Tuấn Khang (Founder & Angel Investor)',
  'Victoria Lee (Senior IELTS Examiner)',
  'Nguyễn Hoàng Nam (Productivity Coach)',
  'Minh Hoàng (Content Specialist)',
  'Lê Quang Huy (AI Researcher)',
  'Phạm Thành Nam (Mobile Architect)',
  'ThS. Vũ Hoàng Điệp (CFA Charterholder)',
  'Nguyễn Hải Đăng (Lead Data Engineer)',
  'Trịnh Minh Châu (Creative Director)',
  'Sensei Takahashi & Mai Hương',
  'Chris Voss & Đỗ Tuấn Anh',
  'Bùi Đức Thắng (Performance Marketer)',
  'Võ Quốc Khánh (Security Specialist)',
  'TS. Phạm Minh Tâm'
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
  },
  {
    id: 'course-data-analytics-python',
    title: 'Phân Tích Dữ Liệu Thực Chiến Với Python, Pandas & PowerBI',
    description: 'Từ thu thập, làm sạch dữ liệu với Pandas đến trực quan hóa chuyên sâu và xây dựng Dashboard điều hành tương tác trên PowerBI.',
    category: 'Phân tích dữ liệu',
    instructor: 'TS. Đặng Quốc Bảo (Senior Data Scientist)',
    sourcePlatform: 'Coursera',
    tags: ['Python', 'Pandas', 'PowerBI', 'Data Analysis', 'SQL', 'Visualization'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T13:00:00Z',
    updatedAt: '2026-08-17T04:30:00Z',
    lastWatchedLessonId: 'les-data-101',
    chapters: [
      {
        id: 'ch-data-pandas',
        title: 'Chương 1: Xử Lý & Làm Sạch Dữ Liệu Với Python Pandas',
        order: 1,
        lessons: [
          {
            id: 'les-data-101',
            title: 'Bài 1: Cấu Trúc DataFrame & Các Phép Biến Đổi Dữ Liệu Cơ Bản',
            type: 'video',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>',
            durationMinutes: 28,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-data-1',
                name: 'Slide_Pandas_Data_Transformation.pdf',
                url: 'https://drive.google.com/sample-pandas-pdf',
                type: 'pdf'
              },
              {
                id: 'att-data-2',
                name: 'Dataset Khách Hàng Mẫu (Google Drive)',
                url: 'https://drive.google.com/drive/folders/sample-dataset',
                type: 'drive'
              }
            ]
          },
          {
            id: 'les-data-102',
            title: 'Bài 2: Kỹ Thuật Xử Lý Missing Values & Outliers Chuẩn Thống Kê',
            type: 'mixed',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            content: '# Xử Lý Dữ Liệu Khuyết & Giá Trị Ngoại Lai Với Pandas\n\nTrong khoa học dữ liệu, việc tiền xử lý (Preprocessing) chiếm tới **70-80% thời gian** của toàn bộ dự án.\n\n### 1. Kiểm tra tỷ lệ khuyết thiếu (Missing Ratio):\n```python\nimport pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("sales_data.csv")\nmissing_percent = df.isnull().sum() / len(df) * 100\nprint("Tỷ lệ dữ liệu khuyết thiếu:\\n", missing_percent[missing_percent > 0])\n```\n\n### 2. Phương pháp Imputation phù hợp:\n* **Biến số (Numerical)**: Sử dụng `Median` khi dữ liệu có độ lệch cao (Skewed), sử dụng `Mean` khi phân phối chuẩn.\n* **Biến phân loại (Categorical)**: Sử dụng `Mode` hoặc gán nhãn `"Unknown"`.',
            durationMinutes: 35,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-data-3',
                name: 'Notebook Sổ Tay Thực Hành (Google Colab)',
                url: 'https://colab.research.google.com',
                type: 'link'
              }
            ]
          }
        ]
      },
      {
        id: 'ch-data-powerbi',
        title: 'Chương 2: Thiết Kế Executive Dashboard Trên PowerBI',
        order: 2,
        lessons: [
          {
            id: 'les-data-201',
            title: 'Bài 3: Xây Dựng Mô Hình Dữ Liệu Star Schema & DAX Measures',
            type: 'article',
            content: '# Xây Dựng Star Schema & DAX Measures Hiệu Quả\n\n## 1. Nguyên Tắc Thiết Kế Star Schema\n* **Fact Table**: Chứa các trường định lượng (Doanh thu, Số lượng bán, Chiết khấu).\n* **Dimension Tables**: Chứa các trường thuộc tính (Khách hàng, Sản phẩm, Ngày tháng, Chi nhánh).\n\n## 2. Công Thức DAX Tính Doanh Thu Cùng Kỳ (Year-over-Year):\n```dax\nTotal Sales YoY % = \nVAR CurrentYearSales = [Total Sales]\nVAR PriorYearSales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(\'DimDate\'[Date]))\nRETURN\n    DIVIDE(CurrentYearSales - PriorYearSales, PriorYearSales, 0)\n```',
            durationMinutes: 25,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-business-startup-lean',
    title: 'Khởi Nghiệp Tinh Gọn & Mô Hình Kinh Doanh Bền Vững (Lean Startup)',
    description: 'Xây dựng sản phẩm khả dụng tối thiểu (MVP), quy trình Build - Measure - Learn và chiến lược định giá, gọi vốn giai đoạn đầu.',
    category: 'Kinh doanh',
    instructor: 'Minh Đỗ (Venture Partner)',
    sourcePlatform: 'Udemy',
    tags: ['Startup', 'Kinh doanh', 'Lean', 'MVP', 'Quản trị', 'Vận hành'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T14:00:00Z',
    updatedAt: '2026-08-17T03:00:00Z',
    lastWatchedLessonId: 'les-biz-101',
    chapters: [
      {
        id: 'ch-biz-canvas',
        title: 'Chương 1: Xác Thực Ý Tưởng & Khung Business Model Canvas',
        order: 1,
        lessons: [
          {
            id: 'les-biz-101',
            title: 'Bài 1: 9 Yếu Tố Then Chốt Trên Business Model Canvas (BMC)',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 24,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-biz-1',
                name: 'Mau_Business_Model_Canvas.pdf',
                url: 'https://drive.google.com/sample-bmc-pdf',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'les-biz-102',
            title: 'Bài 2: Vòng Lặp Học Tập Kiểm Chứng (Build - Measure - Learn)',
            type: 'article',
            content: '# Vòng Lặp Build - Measure - Learn\n\nThay vì dành nhiều tháng phát triển sản phẩm hoàn chỉnh mà không chắc chắn người dùng có cần hay không, phương pháp Lean Startup đề xuất **phát hành bản MVP sớm nhất có thể** để nhận phản hồi thực tế.\n\n> *\"Thành công của startup được đo lường bằng tốc độ học tập thông qua phản hồi thực tế của khách hàng trả tiền.\"*\n\n### Các Bước Thực Thi:\n1. **Giả thuyết cốt lõi (Core Assumption)**: Khách hàng sẵn sàng trả tiền để giải quyết nỗi đau nào?\n2. **Xây dựng MVP (Minimum Viable Product)**: Sản phẩm đơn giản nhất nhưng chứng minh được giá trị.\n3. **Đo lường (Metrics)**: Số lượt đăng ký dùng thử, tỷ lệ giữ chân (Retention), phản hồi của nhóm tiên phong.',
            durationMinutes: 20,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-devops-cloud-docker',
    title: 'Làm Chủ Docker, Kubernetes & Tự Động Hóa CI/CD Cho Lập Trình Viên',
    description: 'Đóng gói Container chuyên nghiệp, cấu hình Cluster Kubernetes, thiết lập GitHub Actions CI/CD và giám sát hệ thống Cloud.',
    category: 'Lập trình',
    instructor: 'Trần Đức Hùng (DevOps Specialist)',
    sourcePlatform: 'KTcity',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'GitHub Actions', 'Cloud'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T15:00:00Z',
    updatedAt: '2026-08-17T02:00:00Z',
    lastWatchedLessonId: 'les-ops-101',
    chapters: [
      {
        id: 'ch-ops-docker',
        title: 'Chương 1: Containerization & Tối Ưu Hóa Dockerfile',
        order: 1,
        lessons: [
          {
            id: 'les-ops-101',
            title: 'Bài 1: Kỹ Thuật Multi-stage Build Tối Ưu Kích Thước Docker Image',
            type: 'mixed',
            videoSource: 'Ld3tfGRGA',
            content: '# Tối Ưu Dockerfile Với Multi-Stage Build\n\nMulti-stage build cho phép bạn tách biệt môi trường build (chứa Node.js, build tools nặng) và môi trường production runtime (chỉ chứa file tĩnh và Nginx nhẹ).\n\n```dockerfile\n# Stage 1: Build stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package.json bun.lock ./\nRUN bun install --frozen-lockfile\nCOPY . .\nRUN bun run build\n\n# Stage 2: Production runtime\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]\n```',
            durationMinutes: 30,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-ops-1',
                name: 'Docker_Best_Practices_Repo (GitHub)',
                url: 'https://github.com/myedu/docker-templates',
                type: 'github'
              }
            ]
          },
          {
            id: 'les-ops-102',
            title: 'Bài 2: Thiết Lập Docker Compose Cho Môi Trường Microservices',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 25,
            isCompleted: false,
            isStarred: false
          }
        ]
      },
      {
        id: 'ch-ops-cicd',
        title: 'Chương 2: Tự Động Hóa Triển Khai Với GitHub Actions',
        order: 2,
        lessons: [
          {
            id: 'les-ops-201',
            title: 'Bài 3: Cấu Hình Pipeline CI/CD Tự Động Test & Build Image',
            type: 'article',
            content: '# Pipeline CI/CD Mẫu Với GitHub Actions\n\nQuy trình tự động kích hoạt khi có commit mới đẩy lên nhánh `main`:\n\n```yaml\nname: Build & Deploy CI\non:\n  push:\n    branches: [ main ]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Setup Bun Runtime\n        uses: oven-sh/setup-bun@v1\n      - name: Install dependencies & Test\n        run: |\n          bun install\n          bun run test\n      - name: Build Web App\n        run: bun run build\n```',
            durationMinutes: 22,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-english-business-communication',
    title: 'Tiếng Anh Thương Mại & Giao Tiếp Đàm Phán Chuyên Nghiệp',
    description: 'Làm chủ kỹ năng viết Email thương mại chuẩn quốc tế, thuyết trình dự án cuốn hút và đàm phán hợp đồng tự tin với đối tác nước ngoài.',
    category: 'Ngoại ngữ',
    instructor: 'Ms. Rachel Vũ (Business English Coach)',
    sourcePlatform: 'YouTube',
    tags: ['English', 'Business English', 'Giao tiếp', 'Email Writing', 'Negotiation'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T16:00:00Z',
    updatedAt: '2026-08-17T01:30:00Z',
    lastWatchedLessonId: 'les-eng-101',
    chapters: [
      {
        id: 'ch-eng-emails',
        title: 'Chương 1: Email Tiếng Anh Thương Mại & Văn Phong Trang Trọng',
        order: 1,
        lessons: [
          {
            id: 'les-eng-101',
            title: 'Bài 1: 50+ Mẫu Câu Viết Email Chuẩn Formal & Professional',
            type: 'article',
            content: '# Cẩm Nang Viết Email Tiếng Anh Chuyên Nghiệp\n\n## 1. Mở Đầu Email (Openings)\n* *Formal*: \"I hope this email finds you well.\"\n* *Follow-up*: \"Further to our discussion yesterday regarding the quarterly roadmap...\"\n* *Request*: \"I am writing to inquire about the timeline for the contract finalization.\"\n\n## 2. Đưa Ra Đề Xuất & Nhắc Nhở Lịch Sự (Polite Follow-up)\n* Thay vì viết: *\"Do this now\"* $\\rightarrow$ Sử dụng: *\"Could you please review the attached proposal at your earliest convenience?\"*\n* Thay vì viết: *\"You are wrong\"* $\\rightarrow$ Sử dụng: *\"I believe there might be a slight misunderstanding regarding the delivery dates.\"*\n\n## 3. Kết Thúc Email (Sign-offs)\n* \"Best regards,\"\n* \"Sincerely,\"\n* \"Warm regards,\"',
            durationMinutes: 20,
            isCompleted: true,
            isStarred: true,
            attachments: [
              {
                id: 'att-eng-1',
                name: 'Business_Email_Templates_Vault.pdf',
                url: 'https://drive.google.com/sample-email-pdf',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'les-eng-102',
            title: 'Bài 2: Kỹ Thuật Thuyết Trình Dự Án & Xử Lý Câu Hỏi Q&A',
            type: 'video',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 30,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-life-skills-productivity',
    title: 'Nghệ Thuật Tập Trung Cao Độ & Tối Đa Hóa Năng Suất (Deep Work)',
    description: 'Phương pháp loại bỏ xao nhãng số, xây dựng thói quen làm việc sâu, quản lý năng lượng cá nhân và tư duy kỷ luật tự thân.',
    category: 'Kỹ năng sống',
    instructor: 'Hoàng Nam (Productivity Consultant)',
    sourcePlatform: 'Google Drive',
    tags: ['Productivity', 'Deep Work', 'Time Management', 'Kỹ năng sống', 'Focus'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T17:00:00Z',
    updatedAt: '2026-08-17T01:00:00Z',
    lastWatchedLessonId: 'les-life-101',
    chapters: [
      {
        id: 'ch-life-focus',
        title: 'Chương 1: 4 Quy Tắc Cốt Lõi Của Deep Work',
        order: 1,
        lessons: [
          {
            id: 'les-life-101',
            title: 'Bài 1: Bản Chất Của Sự Xao Nhãng & Phương Pháp Time-Blocking',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 26,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-life-1',
                name: 'Notion_Weekly_Time_Block_Template',
                url: 'https://notion.so',
                type: 'link'
              }
            ]
          },
          {
            id: 'les-life-102',
            title: 'Bài 2: Thiết Lập Môi Trường Học Tập & Làm Việc Không Xao Nhãng',
            type: 'article',
            content: '# Thiết Lập Môi Trường Deep Work\n\nNăng lượng ý chí (Willpower) là một tài nguyên có hạn. Để duy trì sự tập trung cao độ, bạn cần **thiết kế môi trường** sao cho việc bắt đầu làm việc trở nên tự nhiên nhất và việc xao nhãng trở nên khó khăn nhất.\n\n### 3 Thao Tác Cần Làm Trước Phiên Học:\n1. **Quy tắc 20 giây**: Đặt điện thoại ở phòng khác hoặc bật chế độ Không làm phiền (Do Not Disturb).\n2. **Đơn nhiệm (Single-tasking)**: Chỉ mở đúng 1 tab video bài học MyEdu và 1 cửa sổ ghi chú.\n3. **Cố định khung giờ vàng**: Dành trọn 90 phút đầu buổi sáng cho nhiệm vụ đòi hỏi tư duy cao nhất.',
            durationMinutes: 18,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-content-creator-seo',
    title: 'Chiến Lược Sáng Tạo Nội Dung Đa Kênh & SEO Viral Masterclass',
    description: 'Quy trình sản xuất video ngắn triệu view (Shorts/TikTok/Reels), tối ưu SEO YouTube và nghệ thuật Copywriting chạm cảm xúc khách hàng.',
    category: 'Marketing',
    instructor: 'Lê Thanh Bình (Content Director)',
    sourcePlatform: 'Unica',
    tags: ['Content', 'SEO', 'TikTok', 'Copywriting', 'Viral Marketing', 'YouTube'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T18:00:00Z',
    updatedAt: '2026-08-17T00:30:00Z',
    lastWatchedLessonId: 'les-cont-101',
    chapters: [
      {
        id: 'ch-cont-viral',
        title: 'Chương 1: Kịch Bản Video Ngắn Triệu View & Giữ Chân Người Xem',
        order: 1,
        lessons: [
          {
            id: 'les-cont-101',
            title: 'Bài 1: Công Thức Hook 3 Giây & Cấu Trúc Kể Chuyện Storytelling',
            type: 'video',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>',
            durationMinutes: 25,
            isCompleted: false,
            isStarred: false
          },
          {
            id: 'les-cont-102',
            title: 'Bài 2: Nghiên Cứu Từ Khóa SEO & Tối Ưu Tiêu Đề Bài Viết',
            type: 'mixed',
            videoSource: 'bGOgQoLE0',
            content: '# Nghệ Thuật Đặt Tiêu Đề & Nghiên Cứu Từ Khóa SEO\n\nTiêu đề quyết định **80% tỷ lệ click (CTR)** của người xem vào video hoặc bài viết của bạn.\n\n### 4 Công Thức Đặt Tiêu Đề Viral:\n1. **Số liệu + Lợi ích trực tiếp**: *\"7 Phương Pháp Tối Ưu Doanh Thu Trong 30 Ngày\"*\n2. **Nỗi sợ bị bỏ lỡ (FOMO)**: *\"Nếu Bạn Đang Học Lập Trình, Đừng Mắc Phải 3 Sai Lầm Này\"*\n3. **Bí quyết / Tiết lộ**: *\"Hé Lộ Quy Trình Tự Động Hóa Công Việc Với AI Của Top 1%\"*\n4. **So sánh tương phản**: *\"Lập Trình Web 2020 vs 2026: Những Gì Đã Thay Đổi?\"*',
            durationMinutes: 32,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-cont-1',
                name: 'Kich_Ban_Mau_Video_Ngan.docx (Drive)',
                url: 'https://drive.google.com/drive/sample-script',
                type: 'drive'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-machine-learning-scikit-learn',
    title: 'Học Máy Ứng Dụng (Machine Learning) Với Scikit-Learn & TensorFlow',
    description: 'Nắm vững các thuật toán Phân loại (Classification), Hồi quy (Regression), Phân cụm (Clustering) và huấn luyện mô hình Deep Learning cơ bản.',
    category: 'AI & Machine Learning',
    instructor: 'Lê Quang Huy (AI Researcher)',
    sourcePlatform: 'Coursera',
    tags: ['Machine Learning', 'AI', 'Scikit-Learn', 'TensorFlow', 'Python', 'Data Science'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T19:00:00Z',
    updatedAt: '2026-08-17T05:00:00Z',
    lastWatchedLessonId: 'les-ml-101',
    chapters: [
      {
        id: 'ch-ml-supervised',
        title: 'Chương 1: Học Có Giám Sát (Supervised Learning) & Đánh Giá Mô Hình',
        order: 1,
        lessons: [
          {
            id: 'les-ml-101',
            title: 'Bài 1: Thuật Toán Random Forest & Gradient Boosting (XGBoost)',
            type: 'video',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 32,
            isCompleted: true,
            isStarred: true,
            attachments: [
              {
                id: 'att-ml-1',
                name: 'Slide_Supervised_Learning.pdf',
                url: 'https://drive.google.com/sample-ml-pdf',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'les-ml-102',
            title: 'Bài 2: Thực Hành Đánh Giá Mô Hình Với Precision, Recall & F1-Score',
            type: 'mixed',
            videoSource: 'bGOgQoLE0',
            content: '# Đánh Giá Mô Hình Phân Loại Với Confusion Matrix\n\nKhi làm việc với dữ liệu mất cân bằng (Imbalanced Data), chỉ số **Accuracy** có thể gây đánh lừa. Cần phân tích sâu **Precision**, **Recall** và **AUC-ROC**.\n\n```python\nfrom sklearn.metrics import classification_report, confusion_matrix\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\n# Dự đoán và in báo cáo\ny_pred = model.predict(X_test)\nprint(classification_report(y_test, y_pred))\n\n# Trực quan hóa ma trận nhầm lẫn\ncm = confusion_matrix(y_test, y_pred)\nsns.heatmap(cm, annot=True, fmt="d", cmap="Blues")\nplt.show()\n```',
            durationMinutes: 38,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-ml-2',
                name: 'Jupyter_Notebook_Model_Evaluation (Colab)',
                url: 'https://colab.research.google.com',
                type: 'link'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-flutter-mobile-crossplatform',
    title: 'Lập Trình Ứng Dụng Di Động Đa Nền Tảng Với Flutter & Dart',
    description: 'Xây dựng ứng dụng iOS & Android từ một codebase duy nhất, quản lý State với Riverpod/Bloc và tích hợp REST API thời gian thực.',
    category: 'Lập trình',
    instructor: 'Phạm Thành Nam (Mobile Architect)',
    sourcePlatform: 'Udemy',
    tags: ['Flutter', 'Dart', 'Mobile', 'iOS', 'Android', 'Cross-Platform'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T20:00:00Z',
    updatedAt: '2026-08-17T04:45:00Z',
    lastWatchedLessonId: 'les-flt-101',
    chapters: [
      {
        id: 'ch-flt-widgets',
        title: 'Chương 1: Kiến Trúc Widget & Layout Tùy Biến',
        order: 1,
        lessons: [
          {
            id: 'les-flt-101',
            title: 'Bài 1: Xây Dựng UI Đẹp Mắt Với Custom Painter & Animation Controller',
            type: 'video',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/bGOgQoLE0" allowfullscreen></iframe>',
            durationMinutes: 30,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-flt-1',
                name: 'Flutter_Starter_Kit_Repo (GitHub)',
                url: 'https://github.com/myedu/flutter-clean-architecture',
                type: 'github'
              }
            ]
          },
          {
            id: 'les-flt-102',
            title: 'Bài 2: Quản Lý State Chuyên Nghiệp Với Flutter Riverpod',
            type: 'article',
            content: '# Quản Lý State Trong Flutter Với Riverpod 2.0\n\nRiverpod là giải pháp State Management an toàn kiểu (Type-safe), có khả năng compile-time check và không phụ thuộc vào `BuildContext`.\n\n### Ví dụ StateNotifierProvider:\n```dart\nfinal counterProvider = StateNotifierProvider<CounterNotifier, int>((ref) {\n  return CounterNotifier();\n});\n\nclass CounterNotifier extends StateNotifier<int> {\n  CounterNotifier() : super(0);\n  void increment() => state++;\n}\n```',
            durationMinutes: 24,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-financial-management-investing',
    title: 'Quản Trị Tài Chính Doanh Nghiệp & Đầu Tư Cổ Phiếu Dài Hạn',
    description: 'Phương pháp đọc hiểu Báo cáo tài chính (BCTC), định giá doanh nghiệp theo chiết khấu dòng tiền DCF và quản trị rủi ro danh mục đầu tư.',
    category: 'Kinh doanh',
    instructor: 'ThS. Vũ Hoàng Điệp (CFA Charterholder)',
    sourcePlatform: 'KTcity',
    tags: ['Tài chính', 'Đầu tư', 'Chứng khoán', 'Báo cáo tài chính', 'Quản trị'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T21:00:00Z',
    updatedAt: '2026-08-17T03:15:00Z',
    lastWatchedLessonId: 'les-fin-101',
    chapters: [
      {
        id: 'ch-fin-analysis',
        title: 'Chương 1: Đọc Hiểu & Phân Tích 3 Bảng Báo Cáo Tài Chính',
        order: 1,
        lessons: [
          {
            id: 'les-fin-101',
            title: 'Bài 1: Bảng Cân Đối Kế Toán & Phân Tích Cơ Cấu Nợ Vay',
            type: 'video',
            videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
            durationMinutes: 28,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-fin-1',
                name: 'File_Excel_Phan_Tich_BCTC_Mau.xlsx',
                url: 'https://drive.google.com/sample-excel-finance',
                type: 'drive'
              }
            ]
          },
          {
            id: 'les-fin-102',
            title: 'Bài 2: Báo Cáo Lưu Chuyển Tiền Tệ & Nhận Diện Dòng Tiền Thuần Hoạt Động (CFO)',
            type: 'article',
            content: '# Phân Tích Báo Cáo Lưu Chuyển Tiền Tệ (Cash Flow Statement)\n\nLợi nhuận kế toán có thể bị tác động bởi các bút toán trích lập, nhưng **Dòng tiền thực tế (Cash Flow)** không bao giờ nói dối.\n\n## 3 Luồng Tiền Cần Kiểm Tra:\n1. **CFO (Cash from Operating Activities)**: Phải dương và tăng trưởng đều qua các năm.\n2. **CFI (Cash from Investing Activities)**: Thường âm do doanh nghiệp mở rộng nhà máy, mua sắm TSCĐ (Capex).\n3. **CFF (Cash from Financing Activities)**: Phản ánh hoạt động vay nợ, trả nợ và chi trả cổ tức cho cổ đông.',
            durationMinutes: 22,
            isCompleted: false,
            isStarred: true
          }
        ]
      }
    ]
  },
  {
    id: 'course-data-engineering-sql-spark',
    title: 'Kỹ Sư Dữ Liệu Thực Chiến (Data Engineering) Với SQL & Apache Spark',
    description: 'Thiết kế Data Warehouse trên Cloud, tối ưu truy vấn SQL triệu dòng, xây dựng Data Pipeline với Apache Spark và điều phối luồng dữ liệu.',
    category: 'Phân tích dữ liệu',
    instructor: 'Nguyễn Hải Đăng (Lead Data Engineer)',
    sourcePlatform: 'Coursera',
    tags: ['Data Engineering', 'SQL', 'Spark', 'Big Data', 'ETL', 'Data Pipeline'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T22:00:00Z',
    updatedAt: '2026-08-17T02:40:00Z',
    lastWatchedLessonId: 'les-de-101',
    chapters: [
      {
        id: 'ch-de-pipeline',
        title: 'Chương 1: Xây Dựng Batch ETL Pipeline Với PySpark',
        order: 1,
        lessons: [
          {
            id: 'les-de-101',
            title: 'Bài 1: Khởi Tạo SparkSession & Tối Ưu Partitioning',
            type: 'mixed',
            videoSource: 'Ld3tfGRGA',
            content: '# Xử Lý Dữ Liệu Lớn Với PySpark Dataframe\n\n```python\nfrom pyspark.sql import SparkSession\nfrom pyspark.sql.functions import col, to_date, sum\n\nspark = SparkSession.builder \\\n    .appName("LogProcessingPipeline") \\\n    .config("spark.sql.shuffle.partitions", "200") \\\n    .getOrCreate()\n\n# Đọc và biến đổi dữ liệu Parquet\ndf = spark.read.parquet("s3://myedu-data-lake/logs/")\ncleaned_df = df.filter(col("status") == 200) \\\n    .groupBy(to_date("timestamp").alias("date")) \\\n    .agg(sum("bytes").alias("total_bytes"))\n\ncleaned_df.write.mode("overwrite").parquet("s3://myedu-data-warehouse/daily_traffic/")\n```',
            durationMinutes: 35,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-de-1',
                name: 'Spark_Pipeline_Config_Github',
                url: 'https://github.com/myedu/spark-pipelines',
                type: 'github'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-branding-visual-identity',
    title: 'Xây Dựng Nhận Diện Thương Hiệu (Brand Identity) & Logo Design',
    description: 'Quy trình sáng tạo Logo chuyên nghiệp, xây dựng Brand Guidelines, Moodboard, Typography và phối màu nhận diện cho doanh nghiệp.',
    category: 'Thiết kế đồ họa',
    instructor: 'Trịnh Minh Châu (Creative Director)',
    sourcePlatform: 'Udemy',
    tags: ['Brand Identity', 'Logo Design', 'Illustrator', 'Thiết kế', 'Branding'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-16T23:00:00Z',
    updatedAt: '2026-08-17T02:10:00Z',
    lastWatchedLessonId: 'les-brd-101',
    chapters: [
      {
        id: 'ch-brd-guidelines',
        title: 'Chương 1: Khởi Tạo Moodboard & Hệ Thống Nhận Diện',
        order: 1,
        lessons: [
          {
            id: 'les-brd-101',
            title: 'Bài 1: Phân Tích Tính Cách Thương Hiệu (Brand Archetypes)',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 26,
            isCompleted: false,
            isStarred: true,
            attachments: [
              {
                id: 'att-brd-1',
                name: 'Brand_Guidelines_Template_Figma',
                url: 'https://figma.com/@sample-brand-kit',
                type: 'link'
              }
            ]
          },
          {
            id: 'les-brd-102',
            title: 'Bài 2: Quy Chuẩn Vùng An Toàn & Tỷ Lệ Vàng Trong Thiết Kế Logo',
            type: 'article',
            content: '# Nguyên Tắc Thiết Lập Vùng An Toàn Cho Logo\n\nLogo khi xuất hiện trên các ấn phẩm truyền thông cần có **Vùng bảo vệ tối thiểu (Clear Space)** để không bị các yếu tố văn bản khác lấn át.\n\n* **Đơn vị đo**: Thường sử dụng chiều cao ký tự đầu tiên của logo (ví dụ ký tự `X`).\n* **Kích thước hiển thị tối thiểu**: Quy định rõ bản in (Print: min 20mm) và bản số (Digital: min 32px).',
            durationMinutes: 18,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-japanese-n3-business',
    title: 'Tiếng Nhật Thương Mại & Luyện Thi JLPT N3 Cấp Tốc',
    description: 'Chinh phục 650+ chữ Hán Kanji, ngữ pháp kính ngữ Keigo chuyên nghiệp trong môi trường công sở Nhật Bản và kỹ năng hội thoại thực tế.',
    category: 'Ngoại ngữ',
    instructor: 'Sensei Takahashi & Mai Hương',
    sourcePlatform: 'YouTube',
    tags: ['Tiếng Nhật', 'JLPT N3', 'Ngoại ngữ', 'Business Japanese', 'Kanji'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-17T00:00:00Z',
    updatedAt: '2026-08-17T01:50:00Z',
    lastWatchedLessonId: 'les-jp-101',
    chapters: [
      {
        id: 'ch-jp-keigo',
        title: 'Chương 1: Kính Ngữ Keigo Trong Giao Tiếp Doanh Nghiệp',
        order: 1,
        lessons: [
          {
            id: 'les-jp-101',
            title: 'Bài 1: Phân Biệt Tôn Kính Ngữ (Sonkeigo) & Khiêm Nhường Ngữ (Kenjougo)',
            type: 'article',
            content: '# Phân Biệt Tôn Kính Ngữ & Khiêm Nhường Ngữ\n\n## 1. Tôn Kính Ngữ (Sonkeigo - 尊敬語)\nSử dụng khi nói về hành động của **khách hàng, cấp trên, đối tác**:\n* 行く・来る・いる $\\rightarrow$ いらっしゃる / おいでになる\n* 言う $\\rightarrow$ おっしゃる\n* 食べる・飲む $\\rightarrow$ 召し上がる\n\n## 2. Khiêm Nhường Ngữ (Kenjougo - 謙譲語)\nSử dụng khi nói về hành động của **bản thân hoặc người trong công ty mình**:\n* 行く・来る $\\rightarrow$ 伺う (うかがう) / 参る (まいる)\n* 言う $\\rightarrow$ 申す (もうす) / 申し上げる\n* 見る $\\rightarrow$ 拝見する (はいけんする)',
            durationMinutes: 25,
            isCompleted: true,
            isStarred: true,
            attachments: [
              {
                id: 'att-jp-1',
                name: 'Bang_Keigo_Thuong_Mai_Cheatsheet.pdf',
                url: 'https://drive.google.com/sample-jp-pdf',
                type: 'pdf'
              }
            ]
          },
          {
            id: 'les-jp-102',
            title: 'Bài 2: Đàm Thoại Điện Thoại & Hẹn Gặp Khách Hàng Chuẩn Nhật',
            type: 'video',
            videoSource: '<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>',
            durationMinutes: 28,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-negotiation-leadership-skills',
    title: 'Nghệ Thuật Đàm Phán Đỉnh Cao & Tư Duy Lãnh Đạo Đội Ngũ (Leadership)',
    description: 'Kỹ thuật lắng nghe chủ động, chiến thuật thương lượng win-win, truyền cảm hứng và giải quyết xung đột trong nhóm làm việc.',
    category: 'Kỹ năng sống',
    instructor: 'Chris Voss & Đỗ Tuấn Anh',
    sourcePlatform: 'Unica',
    tags: ['Đàm phán', 'Lãnh đạo', 'Leadership', 'Giao tiếp', 'Quản lý'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-17T01:00:00Z',
    updatedAt: '2026-08-17T01:20:00Z',
    lastWatchedLessonId: 'les-lead-101',
    chapters: [
      {
        id: 'ch-lead-tactics',
        title: 'Chương 1: Tâm Lý Học Trong Đàm Phán & Giao Tiếp Thấu Cảm',
        order: 1,
        lessons: [
          {
            id: 'les-lead-101',
            title: 'Bài 1: Kỹ Thuật Phản Chiếu (Mirroring) & Gắn Nhãn Cảm Xúc (Labeling)',
            type: 'video',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            durationMinutes: 26,
            isCompleted: false,
            isStarred: true
          },
          {
            id: 'les-lead-102',
            title: 'Bài 2: Nghệ Thuật Đặt Câu Hỏi Mở \"Làm Thế Nào\" (Calibrated Questions)',
            type: 'article',
            content: '# Sức Mạnh Của Câu Hỏi Định Hướng (Calibrated Questions)\n\nThay vì nói \"Tôi không thể làm điều đó\", hãy chuyển gánh nặng giải quyết vấn đề sang đối phương bằng các câu hỏi bắt đầu bằng **\"Như thế nào\" (How)** hoặc **\"Cái gì\" (What)**.\n\n### Các Câu Hỏi Mẫu:\n* *\"Làm thế nào để tôi có thể đáp ứng mức giá đó trong khi vẫn đảm bảo chất lượng dịch vụ tốt nhất cho quý vị?\"*\n* *\"Điều gì khiến tiến độ dự án hiện tại trở thành mối quan tâm lớn nhất của anh/chị?\"*\n* *\"Chúng ta nên xử lý việc này như thế nào để cả hai bên đều đạt được mục tiêu?\"*',
            durationMinutes: 20,
            isCompleted: false,
            isStarred: false
          }
        ]
      }
    ]
  },
  {
    id: 'course-performance-facebook-tiktok-ads',
    title: 'Tối Ưu Quảng Cáo Facebook Ads & TikTok Ads Chuyển Đổi Cao',
    description: 'Thiết lập Pixel & CAPI chuẩn xác, xây dựng tệp Custom Audience, tối ưu ngân sách chiến dịch CBO/ABO và nâng cao chỉ số ROAS.',
    category: 'Marketing',
    instructor: 'Bùi Đức Thắng (Performance Marketer)',
    sourcePlatform: 'KTcity',
    tags: ['Facebook Ads', 'TikTok Ads', 'Performance Marketing', 'ROI', 'Media Buying'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-17T02:00:00Z',
    updatedAt: '2026-08-17T01:10:00Z',
    lastWatchedLessonId: 'les-ads-101',
    chapters: [
      {
        id: 'ch-ads-tracking',
        title: 'Chương 1: Thiết Lập Tracking & Đo Lường Dữ Liệu Chuẩn Xác',
        order: 1,
        lessons: [
          {
            id: 'les-ads-101',
            title: 'Bài 1: Cài Đặt Meta Conversions API (CAPI) & TikTok Events API',
            type: 'video',
            videoSource: 'Ld3tfGRGA',
            durationMinutes: 32,
            isCompleted: false,
            isStarred: false,
            attachments: [
              {
                id: 'att-ads-1',
                name: 'Tracking_Checklist_CAPI_GTM.pdf',
                url: 'https://drive.google.com/sample-tracking-pdf',
                type: 'pdf'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-cybersecurity-ethical-hacking',
    title: 'An Ninh Mạng Thực Chiến & Kiểm Thử Xâm Nhập (Ethical Hacking)',
    description: 'Nắm vững kỹ thuật rà quét lỗ hổng OWASP Top 10, phân tích mã độc, bảo mật hệ thống Linux/Cloud và quy trình Penetration Testing chuyên nghiệp.',
    category: 'Lập trình',
    instructor: 'Võ Quốc Khánh (Security Specialist)',
    sourcePlatform: 'Google Drive',
    tags: ['Security', 'Ethical Hacking', 'Pentest', 'Cybersecurity', 'Linux'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-17T03:00:00Z',
    updatedAt: '2026-08-17T00:50:00Z',
    lastWatchedLessonId: 'les-sec-101',
    chapters: [
      {
        id: 'ch-sec-owasp',
        title: 'Chương 1: Phòng Chống Lỗ Hổng Ứng Dụng Web (OWASP Top 10)',
        order: 1,
        lessons: [
          {
            id: 'les-sec-101',
            title: 'Bài 1: Nhận Diện & Khắc Phục Lỗ Hổng SQL Injection & XSS',
            type: 'mixed',
            videoSource: 'https://abyssplayer.com/bGOgQoLE0',
            content: '# Phòng Chống Lỗ Hổng Cross-Site Scripting (XSS)\n\nXSS xảy ra khi ứng dụng nhận dữ liệu không an toàn từ người dùng và render trực tiếp ra DOM mà không escape hoặc sanitize.\n\n### Biện pháp phòng chống:\n1. Sử dụng hàm encode/escape dữ liệu đầu ra phù hợp với ngữ cảnh.\n2. Cấu hình **Content Security Policy (CSP)** nghiêm ngặt qua HTTP Header.\n3. Luôn bật thuộc tính `HttpOnly` và `SameSite=Strict` cho Cookie nhạy cảm.',
            durationMinutes: 35,
            isCompleted: true,
            isStarred: true
          }
        ]
      }
    ]
  },
  {
    id: 'course-psychology-mindset-stoicism',
    title: 'Tâm Lý Học Hành Vi & Triết Học Khắc Kỷ (Stoicism) Ứng Dụng',
    description: 'Làm chủ cảm xúc trước nghịch cảnh, rèn luyện sự kiên định nội tâm và áp dụng tư duy Khắc kỷ vào công việc, sự nghiệp và cuộc sống.',
    category: 'Kỹ năng sống',
    instructor: 'TS. Phạm Minh Tâm',
    sourcePlatform: 'Coursera',
    tags: ['Tâm lý học', 'Stoicism', 'Mindset', 'Kỹ năng sống', 'Bình an nội tâm'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-17T04:00:00Z',
    updatedAt: '2026-08-17T00:20:00Z',
    lastWatchedLessonId: 'les-stc-101',
    chapters: [
      {
        id: 'ch-stc-dichotomy',
        title: 'Chương 1: Phân Đôi Quyền Kiểm Soát (Dichotomy of Control)',
        order: 1,
        lessons: [
          {
            id: 'les-stc-101',
            title: 'Bài 1: Những Thứ Nằm Trong & Ngoài Tầm Kiểm Soát Của Chúng Ta',
            type: 'article',
            content: '# Nguyên Tắc Phân Đôi Quyền Kiểm Soát Của Epictetus\n\n> *\"Có những điều nằm trong tầm kiểm soát của chúng ta, và có những điều hoàn toàn nằm ngoài tầm kiểm soát.\"*\n\n### 1. Nằm trong tầm kiểm soát:\n* Nhận định, suy nghĩ, phản ứng, hành động và giá trị sống của bản thân.\n\n### 2. Nằm ngoài tầm kiểm soát:\n* Ý kiến của người khác, thời tiết, nền kinh tế, thị trường, kết quả cuối cùng.\n\nKhi bạn dồn 100% năng lượng vào **nỗ lực của chính mình** thay vì lo lắng về kết quả ngoài tầm với, sự lo âu sẽ biến mất và sự bình an nội tâm sẽ xuất hiện.',
            durationMinutes: 20,
            isCompleted: false,
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
    // Auto-migrate if older initial sample dataset is detected (e.g. fewer than 20 courses or older ids)
    if (Array.isArray(parsed) && (parsed.length < 20 || parsed[0].id === 'course-ai-mastery' || parsed[0].id === 'course-web-dev')) {
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

export function getStoredInstructors(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_INSTRUCTORS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_INSTRUCTORS, JSON.stringify(DEFAULT_INSTRUCTORS));
      return DEFAULT_INSTRUCTORS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_INSTRUCTORS;
  }
}

export function saveInstructors(instructors: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSTRUCTORS, JSON.stringify(instructors));
  } catch (error) {
    console.error('Failed to save instructors', error);
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

