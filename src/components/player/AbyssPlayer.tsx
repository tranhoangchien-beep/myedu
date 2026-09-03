import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Course } from '../../types';
import { extractAbyssId, normalizeLessonVideoSources, parseUniversalVideo } from '../../lib/abyss';
import { PlayerJSController } from '../../lib/playerjs';
import { normalizeDurationMinutes } from '../../lib/storage';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Minimize2,
  Paperclip, 
  FileText, 
  ExternalLink, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  Lightbulb,
  LightbulbOff,
  RefreshCw,
  HardDrive,
  Radio,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  StickyNote,
  Download
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
  onUpdateDuration?: (lessonId: string, durationMinutes: number) => void;
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
  onUpdateDuration,
  autoPlayNext,
  onToggleAutoPlayNext,
}) => {
  const [notes, setNotes] = useState<string>(currentLesson.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [useMirror, setUseMirror] = useState<boolean>(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Coursera Right Utility Rail Tab: null | 'transcript' | 'notes' | 'files'
  const [activeRightTab, setActiveRightTab] = useState<'transcript' | 'notes' | 'files' | null>(null);

  // User Reaction state: null | 'like' | 'dislike'
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerControllerRef = useRef<PlayerJSController | null>(null);

  // Chuẩn hóa thứ tự nguồn: Luôn ưu tiên Streamtape làm chính, Abyss làm dự phòng (kể cả khi dán ngược)
  const { primary: normalizedPrimary, mirror: normalizedMirror } = normalizeLessonVideoSources(
    currentLesson.videoSource,
    currentLesson.mirrorVideoSource
  );

  // Active video source (switching between primary and mirror)
  const activeSource = useMirror && normalizedMirror
    ? normalizedMirror
    : (normalizedPrimary || '');

  const parsedVideo = parseUniversalVideo(activeSource);
  const parsedPrimary = parseUniversalVideo(normalizedPrimary);
  const parsedMirror = parseUniversalVideo(normalizedMirror || '');
  const embedUrl = parsedVideo.embedUrl;

  // Sync notes when lesson changes
  useEffect(() => {
    setNotes(currentLesson.notes || '');
    setIsSavedNotes(false);
    setUseMirror(false);
  }, [currentLesson.id]);

  // Player.js Two-Way Communication & Smart Auto-Tracking
  useEffect(() => {
    if (!iframeRef.current) return;
    const controller = new PlayerJSController(iframeRef.current);
    playerControllerRef.current = controller;

    const cleanup = controller.on((data) => {
      if (data.event === 'timeupdate' && typeof data.value === 'object' && data.value) {
        const seconds = data.value.seconds || 0;
        const duration = data.value.duration || 0;
        setCurrentPlaybackTime(seconds);

        if (duration > 0) {
          const mins = Math.max(1, Math.round(duration / 60));
          if (onUpdateDuration && currentLesson.durationMinutes !== mins) {
            onUpdateDuration(currentLesson.id, mins);
          }

          // Auto complete when watched >= 90%
          if (seconds / duration >= 0.9 && !currentLesson.isCompleted) {
            onToggleComplete(currentLesson.id);
          }
        }
      } else if (data.event === 'ended') {
        if (!currentLesson.isCompleted) {
          onToggleComplete(currentLesson.id);
        }
        if (autoPlayNext && hasNextLesson) {
          onNextLesson();
        }
      } else if (data.event === 'play') {
        setIsPlaying(true);
      } else if (data.event === 'pause') {
        setIsPlaying(false);
      }
    });

    return () => {
      cleanup();
      controller.detach();
    };
  }, [embedUrl, currentLesson.id, currentLesson.isCompleted, autoPlayNext, hasNextLesson, onUpdateDuration, onToggleComplete, onNextLesson]);

  // Keyboard Shortcuts (Space: Play/Pause, ArrowLeft/Right: Seek ±10s, F: Fullscreen, N: Next, P: Prev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['TEXTAREA', 'INPUT', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (playerControllerRef.current) {
          playerControllerRef.current.togglePlay(isPlaying);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (playerControllerRef.current) {
          playerControllerRef.current.seekRelative(-10, currentPlaybackTime);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (playerControllerRef.current) {
          playerControllerRef.current.seekRelative(10, currentPlaybackTime);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        if (hasNextLesson) onNextLesson();
      } else if (e.key === 'p' || e.key === 'P') {
        if (hasPrevLesson) onPrevLesson();
      } else if (e.key === 'Escape') {
        if (activeRightTab) {
          setActiveRightTab(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentPlaybackTime, hasNextLesson, hasPrevLesson, onNextLesson, onPrevLesson, activeRightTab]);

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
    const mins = Math.floor(currentPlaybackTime / 60);
    const secs = Math.floor(currentPlaybackTime % 60);
    const formatted = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
    const template = `\n- ${formatted} `;
    setNotes(prev => prev + template);
    setNoteViewMode('edit');
    setActiveRightTab('notes');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  };

  const lessonType = currentLesson.type || (currentLesson.videoSource ? 'video' : 'article');

  return (
    <div className="flex gap-4 items-start w-full relative">
      
      {/* LEFT / CENTER: MAIN PLAYER & CONTENT AREA */}
      <div className="flex-1 min-w-0 space-y-4">
        
        {/* 1. COURSERA VIDEO PLAYER CONTAINER */}
        {lessonType === 'article' ? (
          // Pure Article Reader
          <div className="bg-[#0a0f24]/90 border border-cyan-500/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(0,240,255,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-500/15">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Tài Liệu Văn Bản // ARTICLE
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {currentLesson.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const norm = normalizeDurationMinutes(currentLesson.durationMinutes, 15);
                  return (
                    <span className="text-xs font-mono text-slate-400 bg-[#060813] px-3 py-1.5 rounded-xl border border-cyan-500/20 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>~{norm} phút đọc</span>
                    </span>
                  );
                })()}

                <button
                  onClick={() => onToggleComplete(currentLesson.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    currentLesson.isCompleted
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                      : 'bg-[#060813] hover:bg-[#0e1633] text-slate-300 border border-cyan-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentLesson.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu xong'}</span>
                </button>
              </div>
            </div>

            {/* Article Body */}
            <div className="bg-[#060813]/80 p-6 rounded-2xl border border-cyan-500/15">
              <MarkdownRenderer content={currentLesson.content || ''} />
            </div>
          </div>
        ) : (
          // Universal Video Player (Coursera 16:9 Cinema Container)
          <div 
            ref={playerContainerRef}
            className="relative w-full aspect-video max-h-[75vh] bg-black rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.08)] border border-cyan-500/30 transition-all"
          >
            {embedUrl ? (
              parsedVideo.isDirectVideo ? (
                <video
                  key={embedUrl}
                  src={embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onLoadedMetadata={(e) => {
                    if (e.currentTarget.duration && e.currentTarget.duration > 0) {
                      const mins = Math.max(1, Math.round(e.currentTarget.duration / 60));
                      if (onUpdateDuration && currentLesson.durationMinutes !== mins) {
                        onUpdateDuration(currentLesson.id, mins);
                      }
                    }
                  }}
                >
                  Trình duyệt không hỗ trợ phát dạng video MP4 trực tiếp này.
                </video>
              ) : (
                <iframe
                  ref={iframeRef}
                  key={embedUrl}
                  src={embedUrl}
                  title={currentLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-[#060813]">
                <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                <p className="font-semibold text-slate-200 font-mono">Bài giảng này chưa có link video hoặc nhúng mã</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Hãy bấm <strong className="text-cyan-400">Quản Trị -&gt; Sửa khóa học</strong> để nạp link Streamtape hoặc Abyss.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. COURSERA UNDER-VIDEO TITLE & ACTION BAR */}
        <div className="bg-[#0a0f24]/85 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 space-y-4 shadow-[0_0_25px_rgba(0,240,255,0.04)] font-sans">
          
          {/* Main Lesson Title (Bold & Large) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                  {course.category}
                </span>
                {parsedVideo.provider !== 'unknown' && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#060813] text-teal-300 border border-cyan-500/20 font-bold flex items-center gap-1">
                    <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                    <span>
                      {parsedVideo.provider === 'streamtape'
                        ? '⚡ Streamtape'
                        : parsedVideo.provider === 'abyss'
                        ? '📡 Abyss'
                        : parsedVideo.label}
                    </span>
                  </span>
                )}
                {normalizedMirror && (
                  <button
                    onClick={() => setUseMirror(prev => !prev)}
                    className={`px-2.5 py-0.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                      useMirror
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                    title="Chuyển đổi giữa nguồn phát chính (Streamtape) và nguồn dự phòng (Abyss)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      {useMirror
                        ? `Đang phát: ${parsedMirror.provider === 'abyss' ? 'Abyss' : 'Dự phòng'} → Bấm đổi về ${parsedPrimary.provider === 'streamtape' ? 'Streamtape' : 'Chính'}`
                        : `Đang phát: ${parsedPrimary.provider === 'streamtape' ? 'Streamtape' : 'Chính'} → Bấm đổi sang ${parsedMirror.provider === 'abyss' ? 'Abyss' : 'Dự phòng'}`}
                    </span>
                  </button>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {currentLesson.title}
              </h1>
            </div>

            {/* Note Quick Trigger */}
            <button
              onClick={insertTimestampTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex-shrink-0 pt-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Lưu ghi chú</span>
            </button>
          </div>

          {/* Action Row & Coursera Next Button */}
          <div className="pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Like / Dislike / Bookmark / Complete Checkbox */}
            <div className="flex items-center gap-2 flex-wrap text-slate-400">
              <button
                onClick={() => setReaction(prev => prev === 'like' ? null : 'like')}
                title="Hài lòng với bài học này"
                className={`p-2 rounded-xl border transition-all ${
                  reaction === 'like' 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                    : 'bg-[#060813] border-cyan-500/20 hover:text-white hover:bg-[#0e1633]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => setReaction(prev => prev === 'dislike' ? null : 'dislike')}
                title="Chưa hài lòng"
                className={`p-2 rounded-xl border transition-all ${
                  reaction === 'dislike' 
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300' 
                    : 'bg-[#060813] border-cyan-500/20 hover:text-white hover:bg-[#0e1633]'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleStar(currentLesson.id)}
                title="Yêu thích / Đánh dấu bài học"
                className={`p-2 rounded-xl border transition-all ${
                  currentLesson.isStarred 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                    : 'bg-[#060813] border-cyan-500/20 hover:text-amber-300 hover:bg-[#0e1633]'
                }`}
              >
                <Star className={`w-4 h-4 ${currentLesson.isStarred ? 'fill-current' : ''}`} />
              </button>

              <div className="h-4 w-[1px] bg-cyan-500/20 mx-1 hidden sm:block" />

              {/* Complete Toggle */}
              <button
                onClick={() => onToggleComplete(currentLesson.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                  currentLesson.isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,157,0.2)]'
                    : 'bg-[#060813] hover:bg-[#0e1633] text-slate-300 border-cyan-500/20'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${currentLesson.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{currentLesson.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}</span>
              </button>
            </div>

            {/* Right: COURSERA PROMINENT NAVIGATION CTA BUTTON */}
            <div className="flex items-center gap-2">
              {hasPrevLesson && (
                <button
                  onClick={onPrevLesson}
                  title="Chuyển về bài trước (Phím P)"
                  className="px-3.5 py-2.5 rounded-2xl bg-[#060813] hover:bg-[#0e1633] text-slate-300 hover:text-white border border-cyan-500/20 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Bài trước</span>
                </button>
              )}

              {hasNextLesson ? (
                <button
                  onClick={onNextLesson}
                  title="Chuyển đến mục tiếp theo (Phím N)"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs font-mono flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.55)] active:scale-[0.98]"
                >
                  <span>Chuyển đến mục tiếp theo</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã đến bài học cuối cùng!</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 3. Mixed Format Extra Reading Content */}
        {lessonType === 'mixed' && currentLesson.content && (
          <div className="bg-[#0a0f24]/90 border border-cyan-500/20 rounded-3xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Nội Dung Bài Đọc Bổ Trợ</span>
            </div>
            <div className="bg-[#060813]/80 p-5 rounded-2xl border border-cyan-500/15">
              <MarkdownRenderer content={currentLesson.content} />
            </div>
          </div>
        )}

      </div>

      {/* RIGHT: COURSERA UTILITY RAIL & SLIDE-OUT DRAWER */}
      <div className="flex items-start gap-2 sticky top-20 flex-shrink-0">
        
        {/* Active Utility Slide-Out Drawer Panel */}
        {activeRightTab && (
          <div className="w-80 sm:w-96 bg-[#0a0f24]/95 border border-cyan-500/25 rounded-3xl p-5 shadow-[0_0_35px_rgba(0,240,255,0.1)] backdrop-blur-xl h-[calc(100vh-6.5rem)] flex flex-col font-sans animate-slide-left z-20">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 flex-shrink-0 mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
                {activeRightTab === 'transcript' && (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Bản Chép Lời // TRANSCRIPT</span>
                  </>
                )}
                {activeRightTab === 'notes' && (
                  <>
                    <StickyNote className="w-4 h-4" />
                    <span>Ghi Chú Cá Nhân // NOTES</span>
                  </>
                )}
                {activeRightTab === 'files' && (
                  <>
                    <Paperclip className="w-4 h-4" />
                    <span>Tập Tin Đính Kèm // FILES</span>
                  </>
                )}
              </div>

              <button
                onClick={() => setActiveRightTab(null)}
                className="p-1 rounded-xl bg-[#060813] text-slate-400 hover:text-white border border-cyan-500/20 transition-colors"
                title="Đóng bảng tiện ích"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: TRANSCRIPT / ARTICLE CONTENT */}
            {activeRightTab === 'transcript' && (
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                {currentLesson.content ? (
                  <div className="bg-[#060813]/80 p-4 rounded-2xl border border-cyan-500/15 text-xs leading-relaxed text-slate-200">
                    <MarkdownRenderer content={currentLesson.content} />
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 space-y-2 bg-[#060813]/40 rounded-2xl border border-cyan-500/10">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-mono">Bài giảng này hiện chưa có bản chép lời hoặc nội dung bài viết bổ trợ.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NOTES & TIMESTAMPS */}
            {activeRightTab === 'notes' && (
              <div className="flex-1 flex flex-col space-y-3 min-h-0">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1 bg-[#060813] p-1 rounded-xl border border-cyan-500/20">
                    <button
                      onClick={() => setNoteViewMode('edit')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all ${
                        noteViewMode === 'edit' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      Soạn thảo
                    </button>
                    <button
                      onClick={() => setNoteViewMode('preview')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all ${
                        noteViewMode === 'preview' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      Xem trước
                    </button>
                  </div>

                  <button
                    onClick={insertTimestampTemplate}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                    title="Chèn mốc thời gian phát hiện tại"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Mốc giờ video</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0">
                  {noteViewMode === 'edit' ? (
                    <textarea
                      ref={textareaRef}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Gõ ghi chú, tóm tắt ý chính của bài giảng tại đây... (Hỗ trợ Markdown)"
                      className="w-full h-full p-3.5 bg-[#060813] border border-cyan-500/20 rounded-2xl text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none resize-none font-mono"
                    />
                  ) : (
                    <div className="w-full h-full p-3.5 bg-[#060813] border border-cyan-500/20 rounded-2xl text-xs text-white overflow-y-auto custom-scrollbar">
                      {notes ? (
                        <MarkdownRenderer content={notes} />
                      ) : (
                        <p className="text-slate-600 italic">Chưa có ghi chú nào.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between flex-shrink-0">
                  {isSavedNotes ? (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã lưu ghi chú!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Tự động đồng bộ</span>
                  )}

                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Ghi Chú</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: FILES & ATTACHMENTS (Coursera File Cards Style) */}
            {activeRightTab === 'files' && (
              <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                
                {/* 1. Video Stream Source File Card */}
                {embedUrl && (
                  <div className="p-3.5 rounded-2xl bg-[#060813] border border-cyan-500/15 hover:border-cyan-400/40 transition-all flex items-center justify-between gap-3 group shadow-sm">
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        mp4
                      </span>
                      <p className="font-bold text-xs text-white truncate pt-0.5">
                        Video bài giảng ({parsedVideo.provider === 'streamtape' ? 'Streamtape HD' : parsedVideo.provider === 'abyss' ? 'Abyss 1080p' : 'Nguồn phát'})
                      </p>
                    </div>
                    {(parsedVideo.rawInput || embedUrl) && (
                      <a
                        href={parsedVideo.rawInput || embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#0a0f24] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-cyan-500/20 transition-all"
                        title="Mở / Tải video bài giảng"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* 2. Reading / Transcript Content Card */}
                {currentLesson.content && (
                  <div className="p-3.5 rounded-2xl bg-[#060813] border border-cyan-500/15 hover:border-cyan-400/40 transition-all flex items-center justify-between gap-3 group shadow-sm">
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        txt
                      </span>
                      <p className="font-bold text-xs text-white truncate pt-0.5">
                        Bản chép lời / Tài liệu bài đọc
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveRightTab('transcript')}
                      className="p-2 rounded-xl bg-[#0a0f24] hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-cyan-500/20 transition-all"
                      title="Xem nội dung tài liệu đọc"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 3. Custom Lesson Attachments & TeraBox links */}
                {currentLesson.attachments && currentLesson.attachments.length > 0 ? (
                  currentLesson.attachments.map((att) => {
                    const isTeraBox = att.type === 'terabox' || att.url.includes('terabox') || att.url.includes('1024tera');
                    const safeUrl = /^(javascript|vbscript|data):/i.test(att.url.trim()) ? '#' : att.url;
                    return (
                      <a
                        key={att.id}
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                          isTeraBox
                            ? 'bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                            : 'bg-[#060813] border-cyan-500/15 hover:border-emerald-400/40 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isTeraBox ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {isTeraBox ? 'terabox' : 'tệp tin'}
                          </span>
                          <p className="font-bold text-xs truncate pt-0.5">{att.name}</p>
                        </div>
                        <Download className="w-4 h-4 text-cyan-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      </a>
                    );
                  })
                ) : !embedUrl && !currentLesson.content ? (
                  <div className="p-6 text-center text-slate-400 space-y-2 bg-[#060813]/40 rounded-2xl border border-cyan-500/10">
                    <Paperclip className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-mono">Bài giảng này hiện chưa có tập tin đính kèm.</p>
                  </div>
                ) : null}

              </div>
            )}

          </div>
        )}

        {/* COURSERA VERTICAL ICON BAR ON FAR RIGHT */}
        <div className="bg-[#0a0f24]/90 border border-cyan-500/20 rounded-3xl p-2 flex flex-col gap-2 shadow-[0_0_20px_rgba(0,240,255,0.05)] backdrop-blur-xl font-mono text-[10px]">
          
          <button
            onClick={() => setActiveRightTab(prev => prev === 'transcript' ? null : 'transcript')}
            title="Bản chép lời / Nội dung bài đọc"
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              activeRightTab === 'transcript'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-[#060813]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[9px] font-bold">Bản chép</span>
          </button>

          <button
            onClick={() => setActiveRightTab(prev => prev === 'notes' ? null : 'notes')}
            title="Ghi chú cá nhân"
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              activeRightTab === 'notes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-[#060813]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-[9px] font-bold">Ghi chú</span>
          </button>

          <button
            onClick={() => setActiveRightTab(prev => prev === 'files' ? null : 'files')}
            title="Các tập tin & Tài liệu đính kèm"
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
              activeRightTab === 'files'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-[#060813]'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-[9px] font-bold">Tập tin</span>
          </button>

        </div>

      </div>

    </div>
  );
};

