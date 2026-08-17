import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Course } from '../../types';
import { getAbyssEmbedUrl, extractAbyssId, parseUniversalVideo } from '../../lib/abyss';
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
  Minimize2,
  Timer,
  RotateCcw,
  RotateCw,
  Bookmark,
  Play
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

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
  currentTimestampSeconds?: number;
  onUpdateTimestamp?: (seconds: number, duration?: number) => void;
}

// Helper: Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  autoPlayNext,
  onToggleAutoPlayNext,
  currentTimestampSeconds = 0,
  onUpdateTimestamp
}) => {
  const [notes, setNotes] = useState<string>(currentLesson.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveTimestamp, setLiveTimestamp] = useState<number>(currentTimestampSeconds);
  const [videoDuration, setVideoDuration] = useState<number>((currentLesson.durationMinutes || 25) * 60);
  const [isTimestampSavedFeedback, setIsTimestampSavedFeedback] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync timestamp when lesson changes
  useEffect(() => {
    setLiveTimestamp(currentTimestampSeconds);
    setVideoDuration((currentLesson.durationMinutes || 25) * 60);
  }, [currentLesson.id, currentTimestampSeconds]);

  const parsedVideo = parseUniversalVideo(currentLesson.videoSource || '');
  const embedUrl = parsedVideo.embedUrl;
  const rawId = extractAbyssId(currentLesson.videoSource || '');

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

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(videoDuration, newTime));
    setLiveTimestamp(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
    if (onUpdateTimestamp) {
      onUpdateTimestamp(clamped, videoDuration);
    }
    setIsTimestampSavedFeedback(true);
    setTimeout(() => setIsTimestampSavedFeedback(false), 2000);
  };

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
    const template = `\n- [${formatTime(liveTimestamp)}] `;
    setNotes(prev => prev + template);
    setNoteViewMode('edit');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
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
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80">
            <MarkdownRenderer content={currentLesson.content || ''} />
          </div>
        </div>
      ) : (
        // Universal Video Player (supports Abyss, YouTube, Vimeo, MP4, custom iframe)
        <div 
          ref={playerContainerRef}
          className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
            isZenMode ? 'ring-2 ring-teal-500/50 shadow-emerald-950/40' : ''
          }`}
        >
          {embedUrl ? (
            parsedVideo.isDirectVideo ? (
              <video
                ref={videoRef}
                key={embedUrl}
                src={embedUrl}
                controls
                autoPlay
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    const cur = Math.floor(videoRef.current.currentTime);
                    const dur = Math.floor(videoRef.current.duration) || videoDuration;
                    setLiveTimestamp(cur);
                    if (dur > 0) setVideoDuration(dur);
                    if (onUpdateTimestamp && cur % 5 === 0) {
                      onUpdateTimestamp(cur, dur);
                    }
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    const dur = Math.floor(videoRef.current.duration) || videoDuration;
                    setVideoDuration(dur);
                    if (currentTimestampSeconds > 0) {
                      videoRef.current.currentTime = currentTimestampSeconds;
                    }
                  }
                }}
                className="w-full h-full object-contain"
              >
                Trình duyệt không hỗ trợ phát dạng video MP4 trực tiếp này.
              </video>
            ) : (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-950">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="font-semibold text-slate-200">Bài giảng này chưa có link video hoặc nhúng mã</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Hãy bấm <strong className="text-emerald-400">Quản Trị -&gt; Sửa khóa học</strong> để dán link Abyss, YouTube, Vimeo, MP4 hoặc mã &lt;iframe...&gt; nhúng video.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Intelligent Video Time Tracker & Timestamp Bookmark Bar */}
      {lessonType !== 'article' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Đang xem dở: <span className="font-mono text-teal-400 font-extrabold">{formatTime(liveTimestamp)}</span> / {formatTime(videoDuration)}
                </span>
                {isTimestampSavedFeedback && (
                  <span className="text-[11px] font-bold text-emerald-400 animate-fade-in bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    ✓ Đã lưu mốc!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Tự động nhớ mốc thời gian để lần sau mở ra tiếp tục học ngay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleSeek(liveTimestamp - 30)}
              title="Lùi 30 giây"
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>-30s</span>
            </button>

            <button
              type="button"
              onClick={() => handleSeek(liveTimestamp + 30)}
              title="Tua tới 30 giây"
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-400" />
              <span>+30s</span>
            </button>

            <button
              type="button"
              onClick={() => handleSeek(liveTimestamp + 300)}
              title="Tua tới 5 phút"
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors hidden sm:flex"
            >
              <span>+5m</span>
            </button>

            <button
              type="button"
              onClick={() => handleSeek(liveTimestamp)}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Lưu Mốc Này</span>
            </button>
          </div>
        </div>
      )}

      {/* Mixed Format: Render Extra Article Reading Content under Video */}
      {lessonType === 'mixed' && currentLesson.content && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Nội Dung Bài Đọc Bổ Trợ</span>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <MarkdownRenderer content={currentLesson.content} />
          </div>
        </div>
      )}

      {/* 2. Structured 2-Tier Header & Action Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        
        {/* Tier 1: Category, ID & Full Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {course.category}
              </span>
              {parsedVideo.label && parsedVideo.provider !== 'unknown' && (
                <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                  {parsedVideo.label}
                </span>
              )}
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
              title="Bài tiếp (Phím N)"
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white disabled:opacity-30 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Bài tiếp theo</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Toggle Completion & Zen Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleComplete(currentLesson.id)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                currentLesson.isCompleted
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${currentLesson.isCompleted ? 'text-white' : 'text-emerald-400'}`} />
              <span>{currentLesson.isCompleted ? 'Đã Hoàn Thành' : 'Đánh Dấu Xong'}</span>
            </button>

            <button
              onClick={onToggleZenMode}
              title="Chế độ Zen Focus (Phím Z)"
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Zen Focus</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              title="Toàn màn hình (Phím F)"
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Lesson Attachments & Resources */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">Tài Liệu Đính Kèm</h3>
          </div>

          {currentLesson.attachments && currentLesson.attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentLesson.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-medium truncate">{att.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-1">
              Không có tài liệu đính kèm cho bài học này. Bấm "Chỉnh Sửa Khóa Học" ở trang Quản Trị để thêm link Slide PDF, Github, Google Drive.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Thời lượng bài: <strong className="text-slate-300">{currentLesson.durationMinutes ? `${currentLesson.durationMinutes} phút` : '15 phút'}</strong></span>
          <span>Chủ đề: <strong className="text-emerald-400">{course.category}</strong></span>
        </div>
      </div>
    </div>
  );
};
