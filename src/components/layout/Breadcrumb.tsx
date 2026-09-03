import React from 'react';
import { ChevronRight, Home, Tags, BookOpen, FolderOpen, PlayCircle } from 'lucide-react';

interface BreadcrumbProps {
  category?: string;
  courseTitle?: string;
  courseId?: string;
  chapterTitle?: string;
  lessonTitle?: string;
  onNavigateHome: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectCourse?: (courseId: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  category,
  courseTitle,
  courseId,
  chapterTitle,
  lessonTitle,
  onNavigateHome,
  onSelectCategory,
  onSelectCourse,
}) => {
  return (
    <nav 
      aria-label="Breadcrumb"
      className="w-full flex items-center gap-2 text-xs font-mono text-slate-400 py-2 px-4 bg-[#0a0f24]/90 backdrop-blur-md rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,240,255,0.05)] overflow-x-auto whitespace-nowrap custom-scrollbar mb-4"
    >
      {/* 1. Trang Chủ */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1.5 font-medium hover:text-cyan-300 text-slate-300 transition-colors py-1 px-2 rounded-lg hover:bg-cyan-500/10 flex-shrink-0"
        title="Quay lại danh sách khóa học"
      >
        <Home className="w-3.5 h-3.5 text-cyan-400" />
        <span>Trang Chủ</span>
      </button>

      {/* 2. Danh Mục (Category) */}
      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/40 flex-shrink-0" />
          <button
            onClick={() => onSelectCategory && onSelectCategory(category)}
            className="flex items-center gap-1.5 font-medium text-slate-300 hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg hover:bg-cyan-500/10 flex-shrink-0"
            title={`Lọc theo danh mục: ${category}`}
          >
            <Tags className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{category}</span>
          </button>
        </>
      )}

      {/* 3. Khóa Học (Course) */}
      {courseTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/40 flex-shrink-0" />
          <button
            onClick={() => courseId && onSelectCourse && onSelectCourse(courseId)}
            className="flex items-center gap-1.5 font-semibold text-slate-200 hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg hover:bg-cyan-500/10 flex-shrink-0"
            title={`Khóa học: ${courseTitle}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{courseTitle}</span>
          </button>
        </>
      )}

      {/* 4. Chương (Chapter) */}
      {chapterTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/40 flex-shrink-0" />
          <span 
            className="flex items-center gap-1.5 text-slate-400 py-1 px-2 flex-shrink-0"
            title={`Chương: ${chapterTitle}`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{chapterTitle}</span>
          </span>
        </>
      )}

      {/* 5. Bài Giảng Hiện Tại (Active Lesson) */}
      {lessonTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-500/40 flex-shrink-0" />
          <span 
            className="flex items-center gap-1.5 font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-xl border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)] flex-shrink-0"
            title={`Bài học hiện tại: ${lessonTitle}`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>{lessonTitle}</span>
          </span>
        </>
      )}
    </nav>
  );
};
