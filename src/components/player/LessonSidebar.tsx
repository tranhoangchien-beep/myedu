import React, { useState } from 'react';
import { Course } from '../../types';
import { normalizeDurationMinutes } from '../../lib/storage';
import { 
  X, 
  Check,
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  Layers, 
  Paperclip, 
  Target,
  Clock,
  Sparkles,
  BookOpen,
  Edit3
} from 'lucide-react';

interface LessonSidebarProps {
  course: Course;
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onToggleStar?: (lessonId: string) => void;
  onUpdateDuration?: (lessonId: string, durationMinutes: number) => void;
  onBackToCourseList?: () => void;
  onOpenBulkImportForCourse?: (courseId: string) => void;
  onEditCourse?: (course: Course) => void;
  onCloseSidebar?: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  course,
  currentLessonId,
  onSelectLesson,
  onToggleComplete,
  onEditCourse,
  onCloseSidebar,
}) => {
  // Compute overall progress metrics
  let totalLessons = 0;
  let completedCount = 0;

  (course.chapters || []).forEach((ch) => {
    (ch.lessons || []).forEach((l) => {
      totalLessons += 1;
      if (l.isCompleted) completedCount += 1;
    });
  });

  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Track collapsed chapters (default: open all or open active chapter)
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chId: string) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [chId]: !prev[chId]
    }));
  };

  return (
    <div className="bg-[#0a0f24]/95 border border-cyan-500/20 rounded-3xl flex flex-col h-[calc(100vh-6.5rem)] shadow-[0_0_35px_rgba(0,240,255,0.06)] backdrop-blur-xl overflow-hidden font-sans select-none">
      
      {/* 1. COURSERA SYLLABUS HEADER */}
      <div className="p-4 sm:p-5 border-b border-cyan-500/15 flex-shrink-0 bg-[#060813]/60 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>Mục Lục Khóa Học</span>
            </div>
            <h2 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight tracking-tight" title={course.title}>
              {course.title}
            </h2>
          </div>

          {/* Close Sidebar button (Coursera [X] button with tooltip) */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEditCourse && (
              <button
                onClick={() => onEditCourse(course)}
                title="Chỉnh sửa khóa học"
                className="p-1.5 rounded-xl bg-[#060813] text-slate-400 hover:text-cyan-300 hover:bg-[#0e1633] border border-cyan-500/20 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                title="Thu gọn mục lục khóa học"
                className="p-1.5 rounded-xl bg-[#060813] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-cyan-500/20 transition-all group"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* 2. COURSERA DAILY GOAL / TARGET WIDGET */}
        <div className="p-3 rounded-2xl bg-[#060813] border border-cyan-500/25 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight">Mục tiêu khóa học</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Hoàn thành <span className="text-cyan-300 font-bold">{completedCount}/{totalLessons} bài</span>
              </p>
            </div>
          </div>

          {/* Progress Ring / Percentage Pill */}
          <div className="flex items-center gap-1.5 flex-shrink-0 font-mono">
            <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_10px_rgba(0,255,157,0.2)]">
              {percent}%
            </span>
          </div>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full h-1.5 bg-[#060813] rounded-full overflow-hidden border border-cyan-500/20">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 3. COURSERA MODULES & LESSONS ACCORDION LIST */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 custom-scrollbar">
        {course.chapters.map((chapter, chIdx) => {
          const isCollapsed = collapsedChapters[chapter.id];
          const completedInChapter = chapter.lessons.filter(l => l.isCompleted).length;
          const totalInChapter = chapter.lessons.length;
          const isChapterComplete = totalInChapter > 0 && completedInChapter === totalInChapter;

          return (
            <div key={chapter.id} className="rounded-2xl bg-[#060813]/60 border border-cyan-500/15 overflow-hidden transition-all shadow-sm">
              
              {/* Module / Chapter Accordion Header */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full p-3 bg-[#060813] hover:bg-[#0e1633] flex items-center justify-between gap-2 text-left transition-colors border-b border-cyan-500/10 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Mô-đun {chIdx + 1}
                    </span>
                    {isChapterComplete && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        Đã xong
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate mt-0.5">
                    {chapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 text-slate-500 group-hover:text-slate-300">
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {completedInChapter}/{totalInChapter}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-cyan-400/80 transition-transform" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform" />
                  )}
                </div>
              </button>

              {/* Lessons in Module */}
              {!isCollapsed && (
                <div className="divide-y divide-cyan-500/10">
                  {chapter.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`group flex items-start gap-3 p-3 text-xs transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border-l-4 border-cyan-400 text-white font-medium shadow-inner'
                            : 'hover:bg-[#0e1633]/60 text-slate-300 hover:text-white border-l-4 border-transparent'
                        }`}
                      >
                        {/* Coursera Checkbox Status Circle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(lesson.id);
                          }}
                          title={lesson.isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                          className="mt-0.5 flex-shrink-0 p-0.5 rounded-full hover:scale-110 transition-transform"
                        >
                          {lesson.isCompleted ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.7)] ring-1 ring-emerald-400">
                              <Check className="w-3 h-3 text-slate-950 stroke-[3.5]" />
                            </div>
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                              isActive ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-600 group-hover:border-slate-400'
                            }`} />
                          )}
                        </button>

                        {/* Title & Subtitle Badge (Coursera Style: "Video • 6 phút") */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className={`line-clamp-2 leading-snug transition-colors ${
                            isActive ? 'font-bold text-cyan-300' : 'font-medium text-slate-200 group-hover:text-white'
                          }`}>
                            {lesson.title}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400">
                            {/* Format Icon & Type */}
                            <span className="flex items-center gap-1 font-semibold">
                              {lesson.type === 'article' ? (
                                <>
                                  <FileText className="w-3 h-3 text-cyan-400" />
                                  <span>Bài đọc</span>
                                </>
                              ) : lesson.type === 'mixed' ? (
                                <>
                                  <Layers className="w-3 h-3 text-amber-400" />
                                  <span>Bài học tổng hợp</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-cyan-400 fill-cyan-400/30" />
                                  <span>Video</span>
                                </>
                              )}
                            </span>

                            <span>&bull;</span>

                            {/* Duration */}
                            {(() => {
                              const norm = normalizeDurationMinutes(lesson.durationMinutes, 15);
                              const formatted = norm >= 60
                                ? `${Math.floor(norm / 60)}h ${norm % 60 > 0 ? `${norm % 60}p` : ''}`
                                : `${norm} phút`;
                              return (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{formatted}</span>
                                </span>
                              );
                            })()}

                            {/* Attachments indicator */}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1 text-cyan-400/80 font-medium" title={`${lesson.attachments.length} tài liệu đính kèm`}>
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>{lesson.attachments.length} tệp</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

