import React from 'react';
import { ContinueProgress } from '../../types';
import { Play, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface ContinueBannerProps {
  progress: ContinueProgress | null;
  onResume: (courseId: string, lessonId: string) => void;
}

export const ContinueBanner: React.FC<ContinueBannerProps> = ({ progress, onResume }) => {
  if (!progress) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-5 sm:p-6 shadow-xl mb-8 group hover:border-emerald-500/40 transition-all">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Xem Tiếp Gần Nhất
            </span>
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-800 rounded-md">
              {progress.category}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
            {progress.courseTitle}
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-semibold text-emerald-400">▶</span>
            <span className="line-clamp-1">{progress.lessonTitle}</span>
          </div>
        </div>

        <button
          onClick={() => onResume(progress.courseId, progress.lessonId)}
          className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform active:scale-95 group/btn whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Vào Học Ngay</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
