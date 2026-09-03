import React, { useState } from 'react';
import { Course } from '../../types';
import { Play, PlusCircle, Trash2, BookOpen, Edit3, User, Globe, Radio } from 'lucide-react';

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
    <div 
      title={course.title}
      className="group relative bg-[#0a0f24]/80 backdrop-blur-xl hover:bg-[#0d1430] border border-cyan-500/20 hover:border-cyan-400/60 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.04)] hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-300 flex flex-col hover:-translate-y-1"
    >
      {/* Top Corner Cyber Accent */}
      <div className="absolute top-0 right-0 w-6 h-[2px] bg-gradient-to-l from-cyan-400 to-transparent z-20 pointer-events-none" />
      
      {/* Thumbnail with graceful fallback & Multi-Tab Link */}
      <a 
        href={`#/course/${course.id}`}
        title={course.title}
        className="relative h-44 w-full bg-[#060813] overflow-hidden block cursor-pointer"
        onClick={(e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            onSelectCourse(course.id);
          }
        }}
      >
        {course.thumbnailUrl && !imageError ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#060813] via-[#0a0f24] to-cyan-950/40 flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="w-12 h-12 text-cyan-500/40 group-hover:text-cyan-400 transition-colors mb-1" />
            <span className="text-[11px] font-mono font-bold text-slate-400 line-clamp-2 px-2">{course.title}</span>
          </div>
        )}

        {/* Category Pill Over Thumbnail */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#060813]/90 backdrop-blur-md text-cyan-300 border border-cyan-500/30 shadow">
            {course.category}
          </span>
          {course.sourcePlatform && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#060813]/90 backdrop-blur-md text-teal-300 border border-teal-500/30 shadow flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-400" />
              {course.sourcePlatform}
            </span>
          )}
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-[#060813]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </a>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          
          {/* Author / Instructor badge */}
          {course.instructor && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">GV: <strong className="text-slate-200">{course.instructor}</strong></span>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#060813] text-slate-400 border border-cyan-500/15"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <a 
            href={`#/course/${course.id}`}
            title={course.title}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onSelectCourse(course.id);
              }
            }}
            className="block group/title"
          >
            <h3 
              title={course.title}
              className="font-bold text-base text-white group-hover/title:text-cyan-300 transition-colors line-clamp-3 leading-snug cursor-pointer"
            >
              {course.title}
            </h3>
          </a>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.description || 'Chưa có mô tả cho khóa học này.'}
          </p>
        </div>

        {/* Progress Bar & Actions */}
        <div className="space-y-3 pt-2.5 border-t border-cyan-500/15">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-medium">
              <span className="text-slate-400">{completedLessons}/{totalLessons} bài học</span>
              <span className="text-cyan-300 font-bold">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#060813] rounded-full overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5">
            <a
              href={`#/course/${course.id}`}
              title={`Vào học khóa: ${course.title}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  onSelectCourse(course.id);
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-emerald-400 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 hover:border-transparent transition-all shadow-[0_0_10px_rgba(0,240,255,0.05)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{completedLessons > 0 ? 'Học Tiếp' : 'Vào Học'}</span>
            </a>

            <button
              onClick={() => onEditCourse(course)}
              title="Chỉnh sửa thông tin & mục lục khóa học"
              className="p-2 rounded-xl bg-[#060813] hover:bg-[#0e1633] text-slate-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/40 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenBulkImport(course.id)}
              title="Nạp thêm bài học vào khóa này"
              className="p-2 rounded-xl bg-[#060813] hover:bg-[#0e1633] text-slate-400 hover:text-emerald-400 border border-cyan-500/20 hover:border-emerald-400/40 transition-colors"
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
              className="p-2 rounded-xl bg-[#060813] hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-cyan-500/20 hover:border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

