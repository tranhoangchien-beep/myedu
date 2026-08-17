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

    // Sorted by number of courses descending
    const sortedInstructors = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    sortedInstructors.forEach(([inst, count]) => {
      list.push({ name: inst, count });
    });

    return list;
  }, [coursesForInstructorScope]);

  // Check if any filter is active
  const isFiltered = 
    selectedCategory !== 'Tất cả' || 
    selectedSource !== 'Tất cả' || 
    selectedInstructor !== 'Tất cả';

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-md">
      
      {/* 1. Category Filter Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Tags className="w-4 h-4 text-emerald-400" />
            <span>Chủ Đề / Danh Mục:</span>
            {selectedCategory !== 'Tất cả' && (
              <span className="text-[11px] font-normal text-emerald-400 lowercase">
                (đang lọc: {selectedCategory})
              </span>
            )}
          </span>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-bold transition-colors px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {item.name === 'Tất cả' && <Sparkles className="w-3 h-3" />}
                <span>{item.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Linked Secondary Filters: Source Platform & Instructors */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Linked Source Platform Filter */}
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Nền Tảng / Nguồn Mua:</span>
            {selectedCategory !== 'Tất cả' && (
              <span className="text-[10px] font-normal text-slate-500">
                (thuộc chủ đề "{selectedCategory}")
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
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'text-slate-500 bg-slate-900'
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
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tác Giả / Giảng Viên:</span>
            {dynamicInstructors.length > 1 && (
              <span className="text-[10px] font-normal text-emerald-400">
                ({dynamicInstructors.length - 1} giảng viên phù hợp)
              </span>
            )}
          </span>

          <div className="relative">
            <select
              value={selectedInstructor}
              onChange={(e) => onSelectInstructor(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-2xl px-3.5 py-2 pr-8 focus:outline-none focus:border-emerald-500 hover:border-slate-700 transition-colors shadow-inner"
            >
              {dynamicInstructors.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name === 'Tất cả' 
                    ? `Tất cả giảng viên (${item.count} khóa)` 
                    : `${item.name} (${item.count} khóa)`}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
