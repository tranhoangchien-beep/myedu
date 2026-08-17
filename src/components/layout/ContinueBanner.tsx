import React from 'react';
import { ContinueProgress } from '../../types';
import { Play, Sparkles, Clock, ArrowRight, Timer } from 'lucide-react';

interface ContinueBannerProps {
  progress: ContinueProgress | null;
  onResume: (courseId: string, lessonId: string) => void;
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

export const ContinueBanner: React.FC<ContinueBannerProps> = ({ progress, onResume }) => {
  if (!progress) return null;

  const hasTimestamp = typeof progress.timestampSeconds === 'number' && progress.timestampSeconds > 0;
  const duration = progress.durationSeconds || 0;
  const percentWatched = duration > 0 && hasTimestamp ? Math.min(100, Math.round((progress.timestampSeconds! / duration) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 p-5 sm:p-6 shadow-2xl mb-8 group hover:border-emerald-500/40 transition-all">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Xem Tiếp Gần Nhất
            </span>
            <span className="text-xs text-slate-400 font-medium px-2.5 py-0.5 bg-slate-800 rounded-lg">
              {progress.category}
            </span>
            {hasTimestamp && (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-lg border border-teal-500/30">
                <Timer className="w-3 h-3 text-teal-400" />
                Đang ở {formatTime(progress.timestampSeconds!)} {duration > 0 ? `/ ${formatTime(duration)}` : ''}
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
            {progress.courseTitle}
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
            <span className="font-semibold text-emerald-400">▶</span>
            <span className="line-clamp-1">{progress.lessonTitle}</span>
          </div>

          {/* Mini Watch Progress Bar if Timestamp Available */}
          {hasTimestamp && percentWatched > 0 && (
            <div className="w-full max-w-md pt-1">
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentWatched}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => onResume(progress.courseId, progress.lessonId)}
          className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform active:scale-95 group/btn whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{hasTimestamp ? `Tiếp Tục (${formatTime(progress.timestampSeconds!)})` : 'Vào Học Ngay'}</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
