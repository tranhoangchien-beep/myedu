import React from 'react';
import { Course } from '../../types';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Star, 
  Play, 
  Clock, 
  PlusCircle,
  FolderOpen,
  FileText,
  Layers,
  Paperclip
} from 'lucide-react';

interface LessonSidebarProps {
  course: Course;
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onToggleStar: (lessonId: string) => void;
  onBackToCourseList: () => void;
  onOpenBulkImportForCourse: (courseId: string) => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  course,
  currentLessonId,
  onSelectLesson,
  onToggleComplete,
  onToggleStar,
  onBackToCourseList,
  onOpenBulkImportForCourse
}) => {
  // Compute progress
  let totalLessons = 0;
  let completedCount = 0;

  (course.chapters || []).forEach((ch) => {
    (ch.lessons || []).forEach((l) => {
      totalLessons += 1;
      if (l.isCompleted) completedCount += 1;
    });
  });

  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col h-[calc(100vh-6.5rem)] shadow-2xl backdrop-blur-md">
      
      {/* Header & Back Button */}
      <div className="pb-3 border-b border-slate-800/80 mb-3 flex-shrink-0">
        <button
          onClick={onBackToCourseList}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-2 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Về danh sách khóa học</span>
        </button>

        <h2 className="font-bold text-sm text-white line-clamp-2 leading-tight">
          {course.title}
        </h2>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Tiến độ khóa học</span>
            <span className="text-emerald-400 font-bold">{completedCount}/{totalLessons} ({percent}%)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters and Lessons List (Full Scrollable Area) */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 custom-scrollbar">
        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1.5">
            {/* Chapter Header */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-950/80 rounded-xl border border-slate-800/60 sticky top-0 z-10 backdrop-blur-sm">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{chapter.title}</span>
              <span className="text-[10px] text-slate-500 font-normal ml-auto">({chapter.lessons.length})</span>
            </div>

            {/* Lessons List */}
            <div className="space-y-1 pl-1">
              {chapter.lessons.map((lesson) => {
                const isActive = lesson.id === currentLessonId;

                return (
                  <div
                    key={lesson.id}
                    className={`group/item flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                    onClick={() => onSelectLesson(lesson.id)}
                    title={lesson.title}
                  >
                    {/* Left: Format Icon / Title */}
                    <div className="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {lesson.type === 'article' ? (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-teal-500/20 text-teal-300 font-bold animate-pulse' : 'bg-slate-800 text-teal-400'
                          }`}>
                            <FileText className="w-2.5 h-2.5" />
                          </div>
                        ) : lesson.type === 'mixed' ? (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-amber-500/20 text-amber-300 font-bold animate-pulse' : 'bg-slate-800 text-amber-400'
                          }`}>
                            <Layers className="w-2.5 h-2.5" />
                          </div>
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center group-hover/item:text-slate-300">
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`font-medium line-clamp-2 leading-snug ${isActive ? 'text-emerald-300 font-bold' : ''}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.type === 'article' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              Bài đọc
                            </span>
                          )}
                          {lesson.durationMinutes && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {lesson.durationMinutes} phút
                            </span>
                          )}
                          {lesson.attachments && lesson.attachments.length > 0 && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5" title={`${lesson.attachments.length} tài liệu đính kèm`}>
                              <Paperclip className="w-2.5 h-2.5 text-emerald-400" />
                              {lesson.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Checkmark Action */}
                    <div className="flex items-center flex-shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleComplete(lesson.id)}
                        title={lesson.isCompleted ? 'Đánh dấu chưa học' : 'Đánh dấu đã hoàn thành'}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Add Button (Fixed at bottom) */}
      <div className="pt-3 border-t border-slate-800/80 mt-2 flex-shrink-0">
        <button
          onClick={() => onOpenBulkImportForCourse(course.id)}
          className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nạp thêm link Abyss vào khóa này</span>
        </button>
      </div>

    </div>
  );
};
