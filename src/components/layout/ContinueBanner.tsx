import React from 'react';
import { ContinueProgress } from '../../types';
import { Play, Sparkles, ArrowRight, Radio } from 'lucide-react';

interface ContinueBannerProps {
  progress: ContinueProgress | null;
  onResume: (courseId: string, lessonId: string) => void;
}

export const ContinueBanner: React.FC<ContinueBannerProps> = ({ progress, onResume }) => {
  if (!progress) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0a0f24]/85 backdrop-blur-xl border border-cyan-500/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,240,255,0.08)] mb-8 group hover:border-cyan-400/60 transition-all duration-300">
      {/* Cyber Ambient Lights */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Corner Grid Accent */}
      <div className="absolute top-0 left-0 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
      <div className="absolute top-0 left-0 h-8 w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Tiếp Tục Học Ngay
            </span>
            <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 bg-[#060813] border border-cyan-500/20 rounded-md">
              {progress.category}
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
            {progress.courseTitle}
          </h2>

          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-bold text-cyan-400 font-mono">▶</span>
            <span className="line-clamp-1 font-medium text-slate-200">{progress.lessonTitle}</span>
          </div>
        </div>

        <button
          onClick={() => onResume(progress.courseId, progress.lessonId)}
          className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.55)] transition-all transform active:scale-95 group/btn whitespace-nowrap"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Vào Học Tiếp</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

