import React, { useMemo } from 'react';
import { Course } from '../../types';
import { 
  Sparkles, 
  Globe, 
  User, 
  RotateCcw, 
  Tags,
  Check,
  ChevronDown
} from 'lucide-react';

interface FilterHubProps {
  courses: Course[];
  categories: string[];
  sources: string[];
  instructors?: string[];
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
  instructors = [],
  selectedCategory,
  selectedSource,
  selectedInstructor,
  onSelectCategory,
  onSelectSource,
  onSelectInstructor,
  onResetFilters,
}) => {
  // 1. CASCADING LINKED FILTERING LOGIC
  
  // Courses filtered only by Source & Instructor (to calculate available Categories)
  const coursesForCategoryScope = useMemo(() => {
    return courses.filter(c => {
      const matchSource = selectedSource === 'Tất cả' || c.sourcePlatform?.trim().toLowerCase() === selectedSource.trim().toLowerCase();
      const matchInstructor = selectedInstructor === 'Tất cả' || c.instructor?.trim().toLowerCase() === selectedInstructor.trim().toLowerCase();
      return matchSource && matchInstructor;
    });
  }, [courses, selectedSource, selectedInstructor]);

  // Courses filtered only by Category & Instructor (to calculate available Sources)
  const coursesForSourceScope = useMemo(() => {
    return courses.filter(c => {
      const matchCategory = selectedCategory === 'Tất cả' || c.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      const matchInstructor = selectedInstructor === 'Tất cả' || c.instructor?.trim().toLowerCase() === selectedInstructor.trim().toLowerCase();
      return matchCategory && matchInstructor;
    });
  }, [courses, selectedCategory, selectedInstructor]);

  // Courses filtered only by Category & Source (to calculate available Instructors)
  const coursesForInstructorScope = useMemo(() => {
    return courses.filter(c => {
      const matchCategory = selectedCategory === 'Tất cả' || c.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
      const matchSource = selectedSource === 'Tất cả' || c.sourcePlatform?.trim().toLowerCase() === selectedSource.trim().toLowerCase();
      return matchCategory && matchSource;
    });
  }, [courses, selectedCategory, selectedSource]);

  // 2. COMPUTE DYNAMIC LISTS WITH REAL-TIME COUNTS

  // Dynamic Categories available under active Source/Instructor filter
  const dynamicCategories = useMemo(() => {
    // Collect all categories that actually have courses in this scope
    const map = new Map<string, number>();
    coursesForCategoryScope.forEach(c => {
      if (c.category && c.category.trim()) {
        const cat = c.category.trim();
        map.set(cat, (map.get(cat) || 0) + 1);
      }
    });

    // Also ensure global categories that have count > 0 or are currently selected appear
    const list: { name: string; count: number }[] = [];
    
    // Total matching courses count
    list.push({ name: 'Tất cả', count: coursesForCategoryScope.length });

    // Add categories present in current scope
    categories.forEach(cat => {
      const count = map.get(cat) || 0;
      if (count > 0 || (selectedCategory === cat && courses.some(c => c.category === cat))) {
        list.push({ name: cat, count });
        map.delete(cat);
      }
    });

    // Add any remaining categories found in courses but not in preset list
    map.forEach((count, cat) => {
      list.push({ name: cat, count });
    });

    return list;
  }, [categories, coursesForCategoryScope, selectedCategory, courses]);

  // Dynamic Sources available under active Category/Instructor filter
  const dynamicSources = useMemo(() => {
    const map = new Map<string, number>();
    coursesForSourceScope.forEach(c => {
      if (c.sourcePlatform && c.sourcePlatform.trim()) {
        const src = c.sourcePlatform.trim();
        map.set(src, (map.get(src) || 0) + 1);
      }
    });

    const list: { name: string; count: number }[] = [];
    list.push({ name: 'Tất cả', count: coursesForSourceScope.length });

    sources.forEach(src => {
      const count = map.get(src) || 0;
      if (count > 0 || (selectedSource === src && courses.some(c => c.sourcePlatform === src))) {
        list.push({ name: src, count });
        map.delete(src);
      }
    });

    map.forEach((count, src) => {
      list.push({ name: src, count });
    });

    return list;
  }, [sources, coursesForSourceScope, selectedSource, courses]);

  // Dynamic Instructors available under active Category/Source filter
  const dynamicInstructors = useMemo(() => {
    const map = new Map<string, number>();
    coursesForInstructorScope.forEach(c => {
      if (c.instructor && c.instructor.trim()) {
        const inst = c.instructor.trim();
        map.set(inst, (map.get(inst) || 0) + 1);
      }
    });

    const list: { name: string; count: number }[] = [];
    list.push({ name: 'Tất cả', count: coursesForInstructorScope.length });

    // Combine all known instructors from global list + instructors found in courses
    const allKnown = new Set<string>();
    instructors.forEach(i => {
      if (i && i.trim()) allKnown.add(i.trim());
    });
    map.forEach((_, inst) => allKnown.add(inst));

    // Convert to list with counts in this scope
    const sorted = Array.from(allKnown).map(inst => ({
      name: inst,
      count: map.get(inst) || 0
    })).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, 'vi');
    });

    sorted.forEach(item => {
      if (
        item.count > 0 || 
        selectedInstructor === item.name || 
        (selectedCategory === 'Tất cả' && selectedSource === 'Tất cả')
      ) {
        list.push(item);
      }
    });

    return list;
  }, [coursesForInstructorScope, instructors, selectedInstructor, selectedCategory, selectedSource]);

  // Check if any filter is active
  const isFiltered = 
    selectedCategory !== 'Tất cả' || 
    selectedSource !== 'Tất cả' || 
    selectedInstructor !== 'Tất cả';

  return (
    <div className="bg-[#0a0f24]/85 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
      
      {/* 1. Category Filter Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Tags className="w-4 h-4 text-cyan-400" />
            <span>Chủ Đề / Danh Mục:</span>
            {selectedCategory !== 'Tất cả' && (
              <span className="text-[11px] font-mono text-cyan-400 lowercase">
                (đang lọc: {selectedCategory})
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-mono font-bold transition-all px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        {/* Dynamic Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {dynamicCategories.map((item) => {
            const isSelected = selectedCategory.trim().toLowerCase() === item.name.trim().toLowerCase();

            return (
              <button
                key={item.name}
                onClick={() => onSelectCategory(item.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] font-bold scale-[1.02]'
                    : 'bg-[#060813] text-slate-400 border-cyan-500/15 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-[#0d1430]'
                }`}
              >
                {item.name === 'Tất cả' && <Sparkles className="w-3 h-3" />}
                <span>{item.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-slate-950/40 text-slate-950' : 'bg-[#0a0f24] text-cyan-400 border border-cyan-500/20'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Linked Secondary Filters: Source Platform & Instructors */}
      <div className="pt-3 border-t border-cyan-500/15 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Linked Source Platform Filter */}
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Nền Tảng / Nguồn Mua:</span>
            {selectedCategory !== 'Tất cả' && (
              <span className="text-[10px] font-mono text-slate-500">
                (thuộc "{selectedCategory}")
              </span>
            )}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {dynamicSources.map((item) => {
              const isSelected = selectedSource.trim().toLowerCase() === item.name.trim().toLowerCase();

              return (
                <button
                  key={item.name}
                  onClick={() => onSelectSource(item.name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-teal-400 text-slate-950 border-teal-300 font-bold shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                      : 'bg-[#060813] text-slate-400 border-cyan-500/15 hover:text-slate-200 hover:border-cyan-500/30'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-950/40 text-slate-950 font-bold' : 'text-teal-400 bg-[#0a0f24] border border-teal-500/20'
                  }`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linked Instructor Filter Dropdown */}
        <div className="space-y-2 lg:min-w-[280px]">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tác Giả / Giảng Viên:</span>
            {dynamicInstructors.length > 1 && (
              <span className="text-[10px] font-mono text-cyan-400">
                ({dynamicInstructors.length - 1} giảng viên)
              </span>
            )}
          </span>

          <div className="relative">
            <select
              value={selectedInstructor}
              onChange={(e) => onSelectInstructor(e.target.value)}
              className="w-full appearance-none bg-[#060813] border border-cyan-500/20 text-xs font-mono text-slate-200 font-semibold rounded-2xl px-3.5 py-2 pr-8 focus:outline-none focus:border-cyan-400 hover:border-cyan-500/40 transition-colors shadow-inner"
            >
              {dynamicInstructors.map((item) => (
                <option key={item.name} value={item.name} className="bg-[#060813]">
                  {item.name === 'Tất cả' 
                    ? `Tất cả giảng viên (${item.count} khóa)` 
                    : `${item.name} (${item.count} khóa)`}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
