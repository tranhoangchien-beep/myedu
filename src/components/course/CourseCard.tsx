import React, { useState } from 'react';
import { Course } from '../../types';
import { Play, PlusCircle, Trash2, BookOpen, Edit3, User, Globe } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (courseId: string) => void;
  onOpenBulkImport: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelectCourse,
  onOpenBulkImport,
  onEditCourse,
  onDeleteCourse,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);

  let totalLessons = 0;
  let completedLessons = 0;

  (course.chapters || []).forEach((ch) => {
    (ch.lessons || []).forEach((l) => {
      totalLessons += 1;
      if (l.isCompleted) completedLessons += 1;
    });
  });

  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1">
      
      {/* Thumbnail with graceful fallback */}
      <div 
        className="relative h-44 w-full bg-slate-800 overflow-hidden cursor-pointer"
        onClick={() => onSelectCourse(course.id)}
      >
        {course.thumbnailUrl && !imageError ? (
          <img
            src={course.thumbnailUrl}
            alt=""
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/50 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="w-12 h-12 text-slate-700 group-hover:text-emerald-500/50 transition-colors mb-1" />
            <span className="text-[11px] font-bold text-slate-500 line-clamp-1">{course.title}</span>
          </div>
        )}

        {/* Category Pill Over Thumbnail */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-slate-800 shadow">
            {course.category}
          </span>
          {course.sourcePlatform && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-teal-300 border border-slate-800 shadow flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {course.sourcePlatform}
            </span>
          )}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          
          {/* Author / Instructor badge */}
          {course.instructor && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">Giảng viên: <strong className="text-slate-200">{course.instructor}</strong></span>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h3 
            onClick={() => onSelectCourse(course.id)}
            className="font-bold text-base text-white hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.description || 'Chưa có mô tả cho khóa học này.'}
          </p>
        </div>

        {/* Progress Bar & Actions */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-400">{completedLessons}/{totalLessons} bài học</span>
              <span className="text-emerald-400 font-bold">{percent}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => onSelectCourse(course.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{completedLessons > 0 ? 'Học Tiếp' : 'Vào Học'}</span>
            </button>

            <button
              onClick={() => onEditCourse(course)}
              title="Chỉnh sửa thông tin & mục lục khóa học"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-teal-300 border border-slate-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenBulkImport(course.id)}
              title="Nạp thêm bài học vào khóa này"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}"?`)) {
                  onDeleteCourse(course.id);
                }
              }}
              title="Xóa khóa học này"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
