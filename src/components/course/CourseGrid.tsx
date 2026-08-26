import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../../types';
import { matchCourseByQuery } from '../../lib/storage';
import { CourseCard } from './CourseCard';
import { FilterHub } from './FilterHub';
import { 
  PlusCircle, 
  Search, 
  LayoutGrid, 
  List, 
  Edit3, 
  Copy, 
  Trash2, 
  Globe, 
  User, 
  Sparkles, 
  Code, 
  Palette, 
  TrendingUp, 
  Award, 
  BookOpen,
  CheckSquare,
  Square,
  X,
  Tags,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CourseGridProps {
  courses: Course[];
  searchQuery: string;
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
  onSelectCourse: (courseId: string) => void;
  onOpenBulkImport: (courseId?: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onDuplicateCourse?: (course: Course) => void;
  onAddNewCourse: () => void;
  onBatchDeleteCourses?: (courseIds: string[]) => void;
  onBatchUpdateCategory?: (courseIds: string[], newCat: string) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  searchQuery,
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
  onSelectCourse,
  onOpenBulkImport,
  onEditCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onAddNewCourse,
  onBatchDeleteCourses,
  onBatchUpdateCategory,
}) => {
  // View Mode: 'grid' (Card Gallery) vs 'table' (Compact Management List)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('myedu_layout_mode_v1') as 'grid' | 'table') || 'grid';
  });

  const handleToggleLayoutMode = (mode: 'grid' | 'table') => {
    setLayoutMode(mode);
    localStorage.setItem('myedu_layout_mode_v1', mode);
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(12);

  // Batch selection states for Table view
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [batchTargetCategory, setBatchTargetCategory] = useState<string>(categories[0] || 'Chung');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState<boolean>(false);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});

  // Triple-dimension multi-filter
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Filter by category
      if (selectedCategory && selectedCategory !== 'Tất cả') {
        const selectedNorm = selectedCategory.trim().toLowerCase();
        const courseNorm = (course.category || '').trim().toLowerCase();
        if (courseNorm !== selectedNorm) {
          return false;
        }
      }

      // 2. Filter by source platform
      if (selectedSource && selectedSource !== 'Tất cả') {
        const selectedSrcNorm = selectedSource.trim().toLowerCase();
        const courseSrcNorm = (course.sourcePlatform || '').trim().toLowerCase();
        if (courseSrcNorm !== selectedSrcNorm) {
          return false;
        }
      }

      // 3. Filter by instructor / author
      if (selectedInstructor && selectedInstructor !== 'Tất cả') {
        const selectedInstNorm = selectedInstructor.trim().toLowerCase();
        const courseInstNorm = (course.instructor || '').trim().toLowerCase();
        if (courseInstNorm !== selectedInstNorm) {
          return false;
        }
      }

      // 4. Filter by search query (Title, Description, Tags, Instructor, Source, Lessons, with Vietnamese accent-insensitivity)
      if (searchQuery.trim()) {
        return matchCourseByQuery(course, searchQuery);
      }

      return true;
    });
  }, [courses, selectedCategory, selectedSource, selectedInstructor, searchQuery]);

  // Reset page to 1 whenever filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSource, selectedInstructor, searchQuery, pageSize]);

  // Calculate Paginated subset of courses
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  
  const paginatedCourses = useMemo(() => {
    if (pageSize === 'all') return filteredCourses;
    const startIdx = (currentPage - 1) * pageSize;
    return filteredCourses.slice(startIdx, startIdx + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Batch Handlers
  const handleToggleSelectAll = () => {
    if (selectedCourseIds.length === paginatedCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(paginatedCourses.map(c => c.id));
    }
  };

  const handleToggleSelectCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleExecuteBulkDelete = () => {
    if (onBatchDeleteCourses) {
      onBatchDeleteCourses(selectedCourseIds);
    } else {
      selectedCourseIds.forEach(id => onDeleteCourse(id));
    }
    setSelectedCourseIds([]);
    setIsBulkDeleteConfirmOpen(false);
  };

  const handleExecuteBatchCategory = () => {
    if (onBatchUpdateCategory) {
      onBatchUpdateCategory(selectedCourseIds, batchTargetCategory);
    }
    setIsBatchCategoryModalOpen(false);
    setSelectedCourseIds([]);
  };

  const handleExportSelectedCourses = () => {
    const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedCourses, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `myedu_selected_${selectedCourses.length}_courses.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryIcon = (cat: string) => {
    const norm = (cat || '').toLowerCase();
    if (norm.includes('ai') || norm.includes('machine')) return <Sparkles className="w-4 h-4 text-emerald-400" />;
    if (norm.includes('lập trình') || norm.includes('code')) return <Code className="w-4 h-4 text-teal-400" />;
    if (norm.includes('thiết kế') || norm.includes('ui/ux') || norm.includes('đồ họa')) return <Palette className="w-4 h-4 text-purple-400" />;
    if (norm.includes('marketing') || norm.includes('growth')) return <TrendingUp className="w-4 h-4 text-rose-400" />;
    if (norm.includes('kinh doanh') || norm.includes('tài chính')) return <Award className="w-4 h-4 text-amber-400" />;
    return <BookOpen className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-6 relative pb-12">
      
      {/* 1. Integrated Cascading Filter Hub */}
      <FilterHub
        courses={courses}
        categories={categories}
        sources={sources}
        instructors={instructors}
        selectedCategory={selectedCategory}
        selectedSource={selectedSource}
        selectedInstructor={selectedInstructor}
        onSelectCategory={onSelectCategory}
        onSelectSource={onSelectSource}
        onSelectInstructor={onSelectInstructor}
        onResetFilters={onResetFilters}
      />

      {/* 2. Course Section Header with View Mode Switcher & Page Size Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {selectedCategory === 'Tất cả' ? 'Toàn Bộ Khóa Học' : selectedCategory}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
            {filteredCourses.length} khóa
          </span>
        </div>

        {/* Right Toolbar: Page Size + View Switcher + Quick Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-2xl border border-slate-800 text-xs">
            <label htmlFor="course-page-size" className="text-slate-400 text-[11px]">Xem:</label>
            <select
              id="course-page-size"
              aria-label="Số lượng khóa học hiển thị mỗi trang"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-transparent border-0 text-xs text-white font-bold focus:ring-0 cursor-pointer p-0"
            >
              <option value={8} className="bg-slate-950">8</option>
              <option value={12} className="bg-slate-950">12</option>
              <option value={24} className="bg-slate-950">24</option>
              <option value={48} className="bg-slate-950">48</option>
              <option value="all" className="bg-slate-950">Tất cả</option>
            </select>
          </div>

          {/* VIEW SWITCHER: GRID VS TABLE */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-sm" role="group" aria-label="Chế độ xem khóa học">
            <button
              onClick={() => handleToggleLayoutMode('grid')}
              aria-label="Chuyển sang chế độ xem dạng thẻ"
              title="Chế độ Thẻ (Trực quan & Cảm hứng học tập)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                layoutMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dạng Thẻ</span>
            </button>

            <button
              onClick={() => handleToggleLayoutMode('table')}
              aria-label="Chuyển sang chế độ xem dạng bảng"
              title="Chế độ Bảng (Quản trị, lọc nhanh & thao tác hàng loạt)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                layoutMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dạng Bảng</span>
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onAddNewCourse}
            aria-label="Tạo khóa học mới"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo Khóa Mới</span>
          </button>
        </div>
      </div>

      {/* 3. Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">Không tìm thấy khóa học phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có khóa học nào khớp với các tiêu chí lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        
        /* 4A. GRID CARD GALLERY VIEW (Learner Focus) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {paginatedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectCourse={onSelectCourse}
                onOpenBulkImport={onOpenBulkImport}
                onEditCourse={onEditCourse}
                onDeleteCourse={onDeleteCourse}
              />
            ))}
          </div>

          {/* GRID PAGINATION CONTROLS */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
              <div className="text-slate-400">
                Hiển thị <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredCourses.length)}</span> trên <span className="text-white font-bold">{filteredCourses.length}</span> khóa học
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-xl font-bold text-xs transition-all ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      ) : (

        /* 4B. COMPACT TABLE VIEW (Editor / Admin Focus) */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400"
                        title="Chọn tất cả"
                      >
                        {selectedCourseIds.length > 0 && selectedCourseIds.length === paginatedCourses.length ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Khóa Học & Giảng Viên</th>
                    <th className="py-3.5 px-4">Chủ Đề</th>
                    <th className="py-3.5 px-4">Nguồn</th>
                    <th className="py-3.5 px-4">Cấu Trúc</th>
                    <th className="py-3.5 px-4">Tiến Độ</th>
                    <th className="py-3.5 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {paginatedCourses.map((c, index) => {
                    const total = (c.chapters || []).reduce((acc, ch) => acc + (ch.lessons || []).length, 0);
                    const completed = (c.chapters || []).reduce(
                      (acc, ch) => acc + (ch.lessons || []).filter(l => l.isCompleted).length,
                      0
                    );
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const isSelected = selectedCourseIds.includes(c.id);
                    const hasImgFailed = failedImageUrls[c.id] || !c.thumbnailUrl;
                    const isEven = index % 2 === 1;

                    return (
                      <tr 
                        key={c.id} 
                        className={`transition-colors group ${
                          isSelected 
                            ? 'bg-cyan-950/45 hover:bg-cyan-950/60' 
                            : isEven 
                              ? 'bg-[#0d1430]/70 hover:bg-[#131f47]/80' 
                              : 'bg-[#060813]/40 hover:bg-[#0c122e]/70'
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectCourse(c.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* 16:9 Thumbnail & Title with Multi-Tab Link */}
                        <td className="py-4 px-4 max-w-md lg:max-w-xl">
                          <div className="flex items-center gap-3">
                            <a
                              href={`#/course/${c.id}`}
                              title={c.title}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                  e.preventDefault();
                                  onSelectCourse(c.id);
                                }
                              }}
                              className="w-14 h-9 sm:w-16 sm:h-10 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 shadow-sm relative flex items-center justify-center block cursor-pointer group/thumb"
                            >
                              {!hasImgFailed ? (
                                <img 
                                  src={c.thumbnailUrl} 
                                  alt={c.title} 
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" 
                                  onError={() => setFailedImageUrls(prev => ({ ...prev, [c.id]: true }))}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
                                  {getCategoryIcon(c.category)}
                                </div>
                              )}
                            </a>

                            <div className="min-w-0 flex-1">
                              <a 
                                href={`#/course/${c.id}`}
                                title={c.title}
                                onClick={(e) => {
                                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                    e.preventDefault();
                                    onSelectCourse(c.id);
                                  }
                                }}
                                className="font-bold text-sm text-white hover:text-emerald-400 transition-colors line-clamp-2 hover:underline leading-snug block cursor-pointer"
                              >
                                {c.title}
                              </a>
                              {c.instructor && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5" title={`Giảng viên: ${c.instructor}`}>
                                  <User className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                  <span className="truncate">{c.instructor}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            {c.category}
                          </span>
                        </td>

                        {/* Source */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                            <Globe className="w-3.5 h-3.5 text-teal-400" />
                            <span>{c.sourcePlatform || 'Chưa đặt'}</span>
                          </span>
                        </td>

                        {/* Structure */}
                        <td className="py-4 px-4">
                          <div className="text-xs text-slate-300 font-medium whitespace-nowrap">
                            <span className="text-white font-bold">{c.chapters.length}</span> chương &bull; <span className="text-white font-bold">{total}</span> bài
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="py-4 px-4">
                          <div className="w-28 space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">{completed}/{total}</span>
                              <span className="text-emerald-400 font-bold">{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`#/course/${c.id}`}
                              title={`Vào học: ${c.title}`}
                              onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                  e.preventDefault();
                                  onSelectCourse(c.id);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm block text-center cursor-pointer"
                            >
                              Vào Học
                            </a>

                            <button
                              onClick={() => onEditCourse(c)}
                              title="Chỉnh sửa thông tin & giáo trình"
                              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {onDuplicateCourse && (
                              <button
                                onClick={() => onDuplicateCourse(c)}
                                title="Nhân bản (Tạo bản sao khóa học này)"
                                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-purple-400 border border-slate-800 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => onOpenBulkImport(c.id)}
                              title="Nạp thêm bài học vào khóa này"
                              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setCourseToDelete(c)}
                              title="Xóa khóa học này"
                              className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE PAGINATION CONTROLS */}
          {pageSize !== 'all' && totalPages > 1 && (
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
              <div className="text-slate-400">
                Hiển thị <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredCourses.length)}</span> trên <span className="text-white font-bold">{filteredCourses.length}</span> khóa học
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-xl font-bold text-xs transition-all ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLOATING BATCH ACTIONS (When items selected in Table View) */}
      {selectedCourseIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-emerald-500/50 rounded-3xl p-3 sm:px-6 shadow-2xl shadow-emerald-950/50 backdrop-blur-md flex items-center gap-3 sm:gap-5 animate-slide-up flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              Đã chọn <span className="text-emerald-400 font-extrabold">{selectedCourseIds.length}</span> khóa học
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsBatchCategoryModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Tags className="w-3.5 h-3.5 text-teal-400" />
              <span>Đổi Danh Mục</span>
            </button>

            <button
              onClick={handleExportSelectedCourses}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất JSON</span>
            </button>

            <button
              onClick={() => setIsBulkDeleteConfirmOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Đã Chọn</span>
            </button>

            <button
              onClick={() => setSelectedCourseIds([])}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SINGLE COURSE DELETE MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-rose-950/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Xác Nhận Xóa Khóa Học?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hành động này không thể hoàn tác sau khi thực hiện.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="font-bold text-sm text-white line-clamp-1">{courseToDelete.title}</p>
              <p className="text-xs text-slate-400">
                Chứa <span className="text-emerald-400 font-bold">{courseToDelete.chapters.length} chương</span> và <span className="text-emerald-400 font-bold">{courseToDelete.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài giảng</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteCourse(courseToDelete.id);
                  setCourseToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
              >
                Xóa Khóa Học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE MODAL */}
      {isBulkDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-rose-950/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Xác Nhận Xóa Hàng Loạt?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bạn đang chuẩn bị xóa cùng lúc nhiều khóa học.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn <strong className="text-rose-400">{selectedCourseIds.length} khóa học</strong> đã chọn khỏi thư viện học tập cá nhân không?
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
              >
                Xóa {selectedCourseIds.length} Khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH MOVE CATEGORY MODAL */}
      {isBatchCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-teal-500/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-teal-950/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold flex-shrink-0">
                <Tags className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Chuyển Danh Mục Hàng Loạt
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Áp dụng danh mục mới cho {selectedCourseIds.length} khóa học đã chọn.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Chọn Danh Mục Đích:
              </label>
              <select
                value={batchTargetCategory}
                onChange={(e) => setBatchTargetCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white font-bold rounded-2xl p-3 focus:border-teal-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={handleExecuteBatchCategory}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-md shadow-teal-600/20"
              >
                Áp Dụng Chuyển
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
