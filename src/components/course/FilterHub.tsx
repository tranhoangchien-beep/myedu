import React from 'react';
import { Course } from '../../types';
import { 
  Sparkles, 
  Globe, 
  User, 
  RotateCcw, 
  Tags
} from 'lucide-react';

interface FilterHubProps {
  courses: Course[];
  categories: string[];
  sources: string[];
  selectedCategory: string;
  selectedSource: string;
  selectedInstructor: string;
  onSelectCategory: (cat: string) => void;
  onSelectSource: (source: string) => void;
  onSelectInstructor: (instructor: string) => void;
  onResetFilters: () => void;
}

export const FilterHub: React.FC<FilterHubProps> = ({
  courses,
  categories,
  sources,
  selectedCategory,
  selectedSource,
  selectedInstructor,
  onSelectCategory,
  onSelectSource,
  onSelectInstructor,
  onResetFilters,
}) => {
  // All unique categories (managed + found in courses)
  const allUniqueCategories = Array.from(
    new Set([...categories, ...courses.map(c => c.category?.trim()).filter(Boolean)])
  ) as string[];
  const displayCategories = ['Tất cả', ...allUniqueCategories];

  // All unique sources (managed + found in courses)
  const allUniqueSources = Array.from(
    new Set([...sources, ...courses.map(c => c.sourcePlatform?.trim()).filter(Boolean)])
  ) as string[];
  const displaySources = ['Tất cả', ...allUniqueSources];

  // All unique instructors found in courses
  const allUniqueInstructors = Array.from(
    new Set(courses.map(c => c.instructor?.trim()).filter(Boolean))
  ) as string[];

  // Check if any active filter is applied
  const isFiltered = 
    selectedCategory !== 'Tất cả' || 
    selectedSource !== 'Tất cả' || 
    selectedInstructor !== 'Tất cả';

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-lg backdrop-blur-md">
      
      {/* 1. Category Filter Row (Wrapped, No scrollbar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tags className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chủ Đề / Danh Mục:</span>
          </span>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Categories wrapped dynamically to new lines */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory.trim().toLowerCase() === cat.trim().toLowerCase();
            const count = cat === 'Tất cả'
              ? courses.length
              : courses.filter(c => c.category?.trim().toLowerCase() === cat.trim().toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {cat === 'Tất cả' && <Sparkles className="w-3 h-3" />}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Filters Row: Source Platform & Instructors */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Source Platform Filter Pills (Wrapped) */}
        <div className="space-y-1.5 flex-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3 text-teal-400" />
            <span>Nguồn Khóa Học:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {displaySources.map((src) => {
              const isSelected = selectedSource.trim().toLowerCase() === src.trim().toLowerCase();
              const count = src === 'Tất cả'
                ? courses.length
                : courses.filter(c => c.sourcePlatform?.trim().toLowerCase() === src.trim().toLowerCase()).length;

              return (
                <button
                  key={src}
                  onClick={() => onSelectSource(src)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{src}</span>
                  <span className={`text-[10px] px-1 rounded-full ${
                    isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructor / Author Filter Dropdown */}
        {allUniqueInstructors.length > 0 && (
          <div className="space-y-1.5 lg:min-w-[240px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>Tác Giả / Giảng Viên:</span>
            </span>

            <div className="relative">
              <select
                value={selectedInstructor}
                onChange={(e) => onSelectInstructor(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-emerald-500/60 cursor-pointer"
              >
                <option value="Tất cả">Tất cả giảng viên ({courses.length})</option>
                {allUniqueInstructors.map((inst) => {
                  const count = courses.filter(c => c.instructor?.trim().toLowerCase() === inst.toLowerCase()).length;
                  return (
                    <option key={inst} value={inst}>
                      {inst} ({count} khóa)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
