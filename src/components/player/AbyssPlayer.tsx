import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Course } from '../../types';
import { getAbyssEmbedUrl, extractAbyssId, parseUniversalVideo } from '../../lib/abyss';
import { PlayerJSController } from '../../lib/playerjs';
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
  Lightbulb,
  LightbulbOff,
  RefreshCw,
  HardDrive,
  Radio
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
  onUpdateDuration,
  isZenMode,
  onToggleZenMode,
  autoPlayNext,
  onToggleAutoPlayNext,
}) => {
  const [notes, setNotes] = useState<string>(currentLesson.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isEditingDuration, setIsEditingDuration] = useState<boolean>(false);
  const [tempDuration, setTempDuration] = useState<string>(String(currentLesson.durationMinutes || 15));
  const [useMirror, setUseMirror] = useState<boolean>(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerControllerRef = useRef<PlayerJSController | null>(null);

  // Active video source (switching between primary and mirror)
  const activeSource = useMirror && currentLesson.mirrorVideoSource
    ? currentLesson.mirrorVideoSource
    : (currentLesson.videoSource || '');

  const parsedVideo = parseUniversalVideo(activeSource);
  const embedUrl = parsedVideo.embedUrl;
  const rawId = extractAbyssId(activeSource);

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
      // Don't intercept if user is typing in textarea / input
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
      } else if (e.key === 'z' || e.key === 'Z') {
        onToggleZenMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentPlaybackTime, hasNextLesson, hasPrevLesson, onNextLesson, onPrevLesson, onToggleZenMode]);

  // Real-time auto-detect duration from player events (Abyss postMessage, Plyr, VideoJS, YouTube)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            // not json
          }
        }

        let detectedSeconds: number | null = null;

        if (typeof data === 'object' && data !== null) {
          if (typeof data.duration === 'number' && data.duration > 0) {
            detectedSeconds = data.duration;
          } else if (typeof data.value === 'number' && (data.event === 'loadedmetadata' || data.type === 'duration')) {
            detectedSeconds = data.value;
          } else if (data.info && typeof data.info.duration === 'number' && data.info.duration > 0) {
            detectedSeconds = data.info.duration;
          }
        }

        if (detectedSeconds && detectedSeconds > 0) {
          const minutes = Math.max(1, Math.round(detectedSeconds / 60));
          if (onUpdateDuration && currentLesson.durationMinutes !== minutes) {
            onUpdateDuration(currentLesson.id, minutes);
          }
        }
      } catch (err) {
        // silent catch
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentLesson.id, currentLesson.durationMinutes, onUpdateDuration]);

  const handleSaveDuration = () => {
    const parsed = parseInt(tempDuration, 10);
    if (!isNaN(parsed) && parsed > 0 && onUpdateDuration) {
      onUpdateDuration(currentLesson.id, parsed);
    }
    setIsEditingDuration(false);
  };

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
          className={`relative w-full aspect-video max-h-[70vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
            isZenMode ? 'ring-2 ring-emerald-500/40 shadow-emerald-950/40' : ''
          }`}
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
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-950">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="font-semibold text-slate-200">Bài giảng này chưa có link video hoặc nhúng mã</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Hãy bấm <strong className="text-emerald-400">Quản Trị -&gt; Sửa khóa học</strong> để dán link Streamtape, Abyss, YouTube, Vimeo, MP4 hoặc mã &lt;iframe...&gt; nhúng video.
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {course.category}
              </span>
              {parsedVideo.label && parsedVideo.provider !== 'unknown' && (
                <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{parsedVideo.label}</span>
                </span>
              )}
              {currentLesson.mirrorVideoSource && (
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  {useMirror ? 'Nguồn phụ (Mirror)' : 'Nguồn chính'}
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
          
          {/* Left: Previous / Next Lesson Navigation & Dual-Source Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {/* Dual-Source Fallback Button */}
            {currentLesson.mirrorVideoSource && (
              <button
                onClick={() => setUseMirror(prev => !prev)}
                title="Chuyển đổi giữa Nguồn Chính và Nguồn Dự Phòng"
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  useMirror
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>{useMirror ? 'Đang phát: Nguồn Dự Phòng' : 'Đổi Nguồn Dự Phòng'}</span>
              </button>
            )}
          </div>

          {/* Right: Toggle Completion & Zen Mode with Clear State Indicator */}
          <div className="flex items-center gap-2.5">
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

            {/* Zen Mode Button with Explicit ON / OFF Indicator */}
            <button
              onClick={onToggleZenMode}
              title="Bật/Tắt chế độ Zen Focus tập trung cao độ (Phím Z)"
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isZenMode
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isZenMode ? (
                <>
                  <Lightbulb className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse flex-shrink-0" />
                  <span>Zen Focus: <strong className="text-amber-300 font-extrabold uppercase tracking-wide">ĐANG BẬT</strong></span>
                </>
              ) : (
                <>
                  <LightbulbOff className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>Zen Focus: <span className="text-slate-400 font-medium">Đang Tắt</span></span>
                </>
              )}
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
              {currentLesson.attachments.map((att) => {
                const isTeraBox = att.type === 'terabox' || att.url.includes('terabox') || att.url.includes('1024tera');
                const safeUrl = /^(javascript|vbscript|data):/i.test(att.url.trim()) ? '#' : att.url;
                return (
                  <a
                    key={att.id}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all group ${
                      isTeraBox
                        ? 'bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white'
                        : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isTeraBox ? (
                        <HardDrive className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                      <span className="font-medium truncate">{att.name}</span>
                    </div>
                    <ExternalLink className={`w-3.5 h-3.5 transition-colors flex-shrink-0 ${
                      isTeraBox ? 'text-cyan-400' : 'text-slate-500 group-hover:text-emerald-400'
                    }`} />
                  </a>
                );
              })}
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
