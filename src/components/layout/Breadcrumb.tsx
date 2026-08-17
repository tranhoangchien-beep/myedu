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
      className="flex items-center gap-1.5 text-xs text-slate-400 py-1 px-1 overflow-x-auto whitespace-nowrap custom-scrollbar"
    >
      {/* 1. Trang Chủ */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1.5 font-medium hover:text-emerald-400 text-slate-400 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-800/60"
        title="Quay lại danh sách khóa học"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang Chủ</span>
      </button>

      {/* 2. Danh Mục (Category) */}
      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <button
            onClick={() => onSelectCategory && onSelectCategory(category)}
            className="flex items-center gap-1 font-medium text-slate-400 hover:text-emerald-400 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-800/60 max-w-[140px] truncate"
            title={`Lọc theo danh mục: ${category}`}
          >
            <Tags className="w-3 h-3 text-teal-400 flex-shrink-0" />
            <span className="truncate">{category}</span>
          </button>
        </>
      )}

      {/* 3. Khóa Học (Course) */}
      {courseTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <button
            onClick={() => courseId && onSelectCourse && onSelectCourse(courseId)}
            className="flex items-center gap-1 font-medium text-slate-300 hover:text-emerald-400 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-800/60 max-w-[180px] sm:max-w-[240px] truncate"
            title={`Khóa học: ${courseTitle}`}
          >
            <BookOpen className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{courseTitle}</span>
          </button>
        </>
      )}

      {/* 4. Chương (Chapter - Optional) */}
      {chapterTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 hidden md:block" />
          <span 
            className="hidden md:flex items-center gap-1 text-slate-400 max-w-[160px] truncate"
            title={`Chương: ${chapterTitle}`}
          >
            <FolderOpen className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{chapterTitle}</span>
          </span>
        </>
      )}

      {/* 5. Bài Giảng Hiện Tại (Active Lesson) */}
      {lessonTitle && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span 
            className="flex items-center gap-1 font-bold text-emerald-300 max-w-[200px] sm:max-w-[280px] truncate bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shadow-sm"
            title={`Bài học hiện tại: ${lessonTitle}`}
          >
            <PlayCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{lessonTitle}</span>
          </span>
        </>
      )}
    </nav>
  );
};
