import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Course } from '../../types';
import { getAbyssEmbedUrl, extractAbyssId } from '../../lib/abyss';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Tv, 
  Paperclip, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle,
  Eye,
  Clock,
  Sparkles,
  Minimize2
} from 'lucide-react';

interface AbyssPlayerProps {
  course: Course;
  currentLesson: Lesson;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onToggleComplete: (lessonId: string) => void;
  onToggleStar: (lessonId: string) => void;
  onUpdateNotes: (lessonId: string, notes: string) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  autoPlayNext: boolean;
  onToggleAutoPlayNext: () => void;
}

export const AbyssPlayer: React.FC<AbyssPlayerProps> = ({
  course,
  currentLesson,
  hasPrevLesson,
  hasNextLesson,
  onPrevLesson,
  onNextLesson,
  onToggleComplete,
  onToggleStar,
  onUpdateNotes,
  isZenMode,
  onToggleZenMode,
}) => {
  const [notes, setNotes] = useState<string>(currentLesson.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const embedUrl = currentLesson.videoSource ? getAbyssEmbedUrl(currentLesson.videoSource) : null;
  const rawId = currentLesson.videoSource ? extractAbyssId(currentLesson.videoSource) : null;

  // Sync notes when lesson changes
  useEffect(() => {
    setNotes(currentLesson.notes || '');
    setIsSavedNotes(false);
  }, [currentLesson.id, currentLesson.notes]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSaveNotes = () => {
    onUpdateNotes(currentLesson.id, notes);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handleToggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };

  const insertTimestampTemplate = () => {
    const template = '\n- [00:00] ';
    setNotes(prev => prev + template);
    setNoteViewMode('edit');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  };

  const renderFormattedNotes = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-xs text-slate-500 italic py-2">
          Chưa có ghi chú nào. Hãy chuyển sang tab Soạn thảo để thêm mốc thời gian hoặc ý chính bài học.
        </p>
      );
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          // Timestamp matching like [02:15] or [1:20:30]
          const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
          const hasTimestamp = timestampRegex.test(line);

          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-sm text-emerald-400 pt-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-base text-white pt-1">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('# ')) {
            return <h2 key={idx} className="font-extrabold text-lg text-white pt-1">{line.replace('# ', '')}</h2>;
          }

          let formattedContent: React.ReactNode = line;
          if (hasTimestamp) {
            const parts = line.split(/(\[\d{1,2}:\d{2}(?::\d{2})?\])/g);
            formattedContent = parts.map((part, pIdx) => {
              if (/^\[\d{1,2}:\d{2}(?::\d{2})?\]$/.test(part)) {
                return (
                  <span 
                    key={pIdx} 
                    className="inline-flex items-center gap-1 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mr-1 shadow-sm"
                  >
                    <Clock className="w-3 h-3 inline" />
                    {part.replace('[', '').replace(']', '')}
                  </span>
                );
              }
              return part;
            });
          }

          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-400 font-bold leading-none select-none mt-1">&bull;</span>
                <div className="flex-1">{typeof formattedContent === 'string' ? formattedContent.substring(2) : formattedContent}</div>
              </div>
            );
          }

          return <div key={idx} className="min-h-[1.25rem]">{formattedContent}</div>;
        })}
      </div>
    );
  };

  const lessonType = currentLesson.type || (currentLesson.videoSource ? 'video' : 'article');

  return (
    <div className="space-y-4">
      {/* 1. Main Media Area: Video Player OR Article Reader */}
      {lessonType === 'article' ? (
        // Pure Article Reader
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                  Bài Đọc / Tài Liệu Văn Bản
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {currentLesson.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>{currentLesson.durationMinutes ? `~${currentLesson.durationMinutes} phút đọc` : 'Tài liệu đọc'}</span>
              </span>

              <button
                onClick={() => onToggleComplete(currentLesson.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  currentLesson.isCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentLesson.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu xong'}</span>
              </button>
            </div>
          </div>

          {/* Article Text / Markdown Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3 bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            {currentLesson.content ? (
              renderFormattedNotes(currentLesson.content)
            ) : (
              <p className="text-slate-500 italic">Chưa có nội dung chi tiết cho bài đọc này.</p>
            )}
          </div>
        </div>
      ) : (
        // Video Player (for 'video' and 'mixed' types)
        <div 
          ref={playerContainerRef}
          className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
            isZenMode ? 'ring-2 ring-teal-500/50 shadow-emerald-950/40' : ''
          }`}
        >
          {embedUrl ? (
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={currentLesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-950">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="font-semibold text-slate-200">Không thể tải video từ mã nhúng Abyss</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Nguồn video hiện tại: <code className="text-emerald-400">{currentLesson.videoSource}</code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mixed Format: Render Extra Article Reading Content under Video */}
      {lessonType === 'mixed' && currentLesson.content && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Nội Dung Bài Đọc Bổ Trợ</span>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-2 leading-relaxed">
            {renderFormattedNotes(currentLesson.content)}
          </div>
        </div>
      )}

      {/* 2. Structured 2-Tier Header & Action Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* Tier 1: Category, ID, Star & Full Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {course.category}
              </span>
              {rawId && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ID: {rawId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStar(currentLesson.id)}
                title={currentLesson.isStarred ? 'Bỏ ghim bài này' : 'Ghim bài giảng cốt lõi'}
                className="p-1.5 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Star className={`w-4 h-4 ${currentLesson.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                <span>{currentLesson.isStarred ? 'Đã ghim' : 'Ghim bài'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
            {currentLesson.title}
          </h1>
        </div>

        {/* Tier 2: Dedicated Action Toolbar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Left: Previous / Next Lesson Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              title="Bài trước (Phím P)"
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <SkipBack className="w-4 h-4" />
              <span className="hidden sm:inline">Bài trước</span>
            </button>

            <button
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              title="Bài kế tiếp (Phím N)"
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="hidden sm:inline">Bài tiếp theo</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Mark Completed, Zen Focus & Fullscreen */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onToggleComplete(currentLesson.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                currentLesson.isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {currentLesson.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span>Đã Xong</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>Đánh Dấu Xong</span>
                </>
              )}
            </button>

            {/* Zen Focus Mode Button */}
            <button
              onClick={onToggleZenMode}
              title="Chế độ tập trung Zen Mode (Phím Z)"
              className={`p-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                isZenMode
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 ring-1 ring-teal-500/30'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Zen Focus</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              title="Toàn màn hình (Phím F)"
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shadow-sm"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>

      {/* 3. Lesson Attachments & Interactive Markdown Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Attachments & Resource Links */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Tài Liệu Đính Kèm</h3>
            </div>

            {currentLesson.attachments && currentLesson.attachments.length > 0 ? (
              <div className="space-y-2">
                {currentLesson.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium">{att.name}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Không có tài liệu đính kèm cho bài học này.
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Thời lượng bài: <strong>{currentLesson.durationMinutes ? `${currentLesson.durationMinutes} phút` : 'Chưa cập nhật'}</strong></span>
            <span>Khóa học: <strong className="text-slate-400">{course.category}</strong></span>
          </div>
        </div>

        {/* Smart Lesson Notes with Markdown & Timestamp Support */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Ghi Chú Bài Giảng</h3>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Edit / Preview Toggle Tabs */}
                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setNoteViewMode('edit')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      noteViewMode === 'edit' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Soạn thảo
                  </button>
                  <button
                    onClick={() => setNoteViewMode('preview')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                      noteViewMode === 'preview' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Xem trước
                  </button>
                </div>

                <button
                  onClick={insertTimestampTemplate}
                  title="Chèn mốc thời gian mẫu [mm:ss]"
                  className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>+Mốc [00:00]</span>
                </button>
              </div>
            </div>

            {noteViewMode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú lại các ý chính, mốc thời gian dạng [05:30] hoặc đoạn code mẫu..."
                rows={4}
                className="w-full text-xs p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:border-emerald-500/60 transition-colors resize-none font-mono"
              />
            ) : (
              <div className="min-h-[96px] max-h-[140px] overflow-y-auto p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                {renderFormattedNotes(notes)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500">
              {isSavedNotes ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Đã lưu vào máy
                </span>
              ) : (
                'Hỗ trợ Markdown & [mm:ss]'
              )}
            </span>

            <button
              onClick={handleSaveNotes}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu ghi chú</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
