import React from 'react';
import { Course } from '../../types';
import { Bookmark, Star, Play, CheckCircle2, Circle, ArrowLeft, Radio } from 'lucide-react';

interface FavoritesViewProps {
  courses: Course[];
  onSelectLesson: (courseId: string, lessonId: string) => void;
  onToggleStar: (courseId: string, lessonId: string) => void;
  onToggleComplete: (courseId: string, lessonId: string) => void;
  onBackToHome: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  courses,
  onSelectLesson,
  onToggleStar,
  onToggleComplete,
  onBackToHome,
}) => {
  // Extract all starred lessons
  const starredItems: {
    course: Course;
    chapterTitle: string;
    lesson: Course['chapters'][0]['lessons'][0];
  }[] = [];

  (courses || []).forEach((c) => {
    (c.chapters || []).forEach((ch) => {
      (ch.lessons || []).forEach((l) => {
        if (l.isStarred) {
          starredItems.push({
            course: c,
            chapterTitle: ch.title,
            lesson: l,
          });
        }
      });
    });
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span>{starredItems.length} Bài giảng cốt lõi đã ghim</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-mono">
          <Bookmark className="w-6 h-6 text-amber-400" />
          <span>Kho Bài Giảng Ghim // STARRED VAULT</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Danh sách các bài học quan trọng bạn đã đánh dấu sao từ tất cả các khóa học.
        </p>
      </div>

      {starredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#0a0f24]/80 border border-cyan-500/20 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.05)]">
          <Star className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
          <p className="font-semibold text-slate-300 font-mono">Chưa có bài giảng nào được ghim</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Trong khi xem bài học, bấm vào biểu tượng ngôi sao ⭐ để lưu nhanh bài học vào danh sách này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {starredItems.map(({ course, chapterTitle, lesson }) => (
            <div
              key={`${course.id}_${lesson.id}`}
              className="p-4 rounded-xl bg-[#0a0f24]/85 border border-cyan-500/20 hover:border-amber-400/60 shadow-[0_0_20px_rgba(0,240,255,0.04)] hover:shadow-[0_0_25px_rgba(251,191,36,0.12)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#060813] text-cyan-300 border border-cyan-500/30">
                    {course.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-medium truncate max-w-xs">
                    {course.title}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  Chương: {chapterTitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectLesson(course.id, lesson.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Xem ngay</span>
                </button>

                <button
                  onClick={() => onToggleComplete(course.id, lesson.id)}
                  title={lesson.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  className="p-2 rounded-xl bg-[#060813] border border-cyan-500/20 hover:border-cyan-400 text-slate-400 transition-colors"
                >
                  {lesson.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shadow-[0_0_8px_rgba(0,255,157,0.4)]" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                  )}
                </button>

                <button
                  onClick={() => onToggleStar(course.id, lesson.id)}
                  title="Bỏ ghim"
                  className="p-2 rounded-xl bg-[#060813] border border-amber-500/30 hover:bg-rose-950/40 text-amber-400 hover:text-rose-400 transition-colors"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

