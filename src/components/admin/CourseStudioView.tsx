import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Course } from '../../types';
import { 
  ArrowLeft, 
  Settings, 
  BookOpen, 
  Tags, 
  Database, 
  Plus, 
  UploadCloud, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Globe, 
  User, 
  PlusCircle,
  FolderOpen,
  CheckCircle2,
  Clock,
  Video,
  FileText,
  Layers,
  ArrowUpDown,
  Filter,
  Sparkles,
  Code,
  Palette,
  TrendingUp,
  Award,
  AlertTriangle,
  X,
  CheckSquare,
  Square,
  Copy,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_SAMPLE_COURSES } from '../../lib/storage';

interface CourseStudioViewProps {
  courses: Course[];
  categories: string[];
  sources: string[];
  instructors?: string[];
  onBackToLearning: () => void;
  onAddNewCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onDuplicateCourse?: (course: Course) => void;
  onOpenBulkImport: (courseId?: string) => void;
  onAddCategory: (cat: string) => void;
  onRenameCategory: (oldCat: string, newCat: string) => void;
  onDeleteCategory: (cat: string) => void;
  onAddSource: (source: string) => void;
  onRenameSource: (oldSource: string, newSource: string) => void;
  onDeleteSource: (source: string) => void;
  onAddInstructor?: (inst: string) => void;
  onRenameInstructor?: (oldInst: string, newInst: string) => void;
  onDeleteInstructor?: (inst: string) => void;
  onRestoreCourses: (courses: Course[]) => void;
  onSelectCourseAndLesson: (courseId: string, lessonId?: string) => void;
  onBatchDeleteCourses?: (courseIds: string[]) => void;
  onBatchUpdateCategory?: (courseIds: string[], newCat: string) => void;
}

type SortOption = 'updated-desc' | 'title-asc' | 'progress-desc' | 'progress-asc' | 'lessons-desc';
type StatusFilter = 'all' | 'in-progress' | 'not-started' | 'completed';

export const CourseStudioView: React.FC<CourseStudioViewProps> = ({
  courses,
  categories,
  sources,
  instructors = [],
  onBackToLearning,
  onAddNewCourse,
  onEditCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onOpenBulkImport,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddSource,
  onRenameSource,
  onDeleteSource,
  onAddInstructor,
  onRenameInstructor,
  onDeleteInstructor,
  onRestoreCourses,
  onSelectCourseAndLesson,
  onBatchDeleteCourses,
  onBatchUpdateCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'taxonomies' | 'backup'>('courses');
  
  // Table Search, Filter & Sort states
  const [searchStudio, setSearchStudio] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(20);

  // Search input ref for keyboard shortcut (/)
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Batch Selection State
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState<boolean>(false);
  const [batchTargetCategory, setBatchTargetCategory] = useState<string>(categories[0] || 'Chung');

  // Custom Delete Confirmation Modal State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState<boolean>(false);

  // Failed image URLs cache for robust fallback
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});

  // Taxonomies Sub-tab state
  const [taxonomySubTab, setTaxonomySubTab] = useState<'categories' | 'sources' | 'instructors'>('categories');
  
  // Category state
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState<string>('');

  // Source state
  const [newSourceInput, setNewSourceInput] = useState<string>('');
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceValue, setEditingSourceValue] = useState<string>('');

  // Instructor state
  const [newInstInput, setNewInstInput] = useState<string>('');
  const [editingInstIndex, setEditingInstIndex] = useState<number | null>(null);
  const [editingInstValue, setEditingInstValue] = useState<string>('');

  // Backup states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupSuccess, setBackupSuccess] = useState<string>('');
  const [backupError, setBackupError] = useState<string>('');

  // Keyboard shortcut listener for Studio: '/' to search, 'Esc' to clear selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedCourseIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. CALCULATE KPI METRICS
  const kpiMetrics = useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;
    let videoLessons = 0;
    let articleLessons = 0;
    let totalMinutes = 0;

    courses.forEach(c => {
      c.chapters.forEach(ch => {
        ch.lessons.forEach(l => {
          totalLessons++;
          if (l.isCompleted) completedLessons++;
          if (l.type === 'article') articleLessons++;
          else videoLessons++;
          totalMinutes += (l.durationMinutes || 15);
        });
      });
    });

    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      totalCourses: courses.length,
      totalLessons,
      completedLessons,
      videoLessons,
      articleLessons,
      overallProgress,
      totalHours,
      totalTaxonomies: categories.length + sources.length + instructors.length
    };
  }, [courses, categories, sources, instructors]);

  // 2. STORAGE HEALTH & USAGE CALCULATION
  const storageMetrics = useMemo(() => {
    try {
      let totalBytes = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalBytes += (localStorage[key].length + key.length) * 2; // UTF-16 approximation
        }
      }
      const usedKB = (totalBytes / 1024).toFixed(1);
      const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
      const quotaMB = 5; // Standard 5MB local storage quota
      const percentUsed = Math.min(100, parseFloat(((totalBytes / (quotaMB * 1024 * 1024)) * 100).toFixed(1)));
      return { usedKB, usedMB, quotaMB, percentUsed };
    } catch {
      return { usedKB: '0', usedMB: '0', quotaMB: 5, percentUsed: 0 };
    }
  }, [courses, categories, sources, instructors]);

  // 3. FILTER & SORT COURSES
  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter((c) => {
        // Text Search
        if (searchStudio.trim()) {
          const q = searchStudio.toLowerCase();
          const match = 
            c.title.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            (c.instructor && c.instructor.toLowerCase().includes(q)) ||
            (c.sourcePlatform && c.sourcePlatform.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Category Filter
        if (categoryFilter !== 'all' && c.category !== categoryFilter) {
          return false;
        }

        // Source Filter
        if (sourceFilter !== 'all' && c.sourcePlatform !== sourceFilter) {
          return false;
        }

        // Status Filter
        const total = c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
        const completed = c.chapters.reduce(
          (acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length,
          0
        );
        const pct = total > 0 ? (completed / total) * 100 : 0;

        if (statusFilter === 'completed' && pct < 100) return false;
        if (statusFilter === 'not-started' && completed > 0) return false;
        if (statusFilter === 'in-progress' && (completed === 0 || pct === 100)) return false;

        return true;
      })
      .sort((a, b) => {
        const getPct = (c: Course) => {
          const total = c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
          const comp = c.chapters.reduce((acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length, 0);
          return total > 0 ? comp / total : 0;
        };

        const getTotalLessons = (c: Course) => {
          return c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
        };

        switch (sortBy) {
          case 'title-asc':
            return a.title.localeCompare(b.title, 'vi');
          case 'progress-desc':
            return getPct(b) - getPct(a);
          case 'progress-asc':
            return getPct(a) - getPct(b);
          case 'lessons-desc':
            return getTotalLessons(b) - getTotalLessons(a);
          case 'updated-desc':
          default:
            return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        }
      });
  }, [courses, searchStudio, categoryFilter, sourceFilter, statusFilter, sortBy]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchStudio, statusFilter, categoryFilter, sourceFilter, sortBy, pageSize]);

  // 4. PAGINATED COURSES
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredAndSortedCourses.length / pageSize));
  const paginatedCourses = useMemo(() => {
    if (pageSize === 'all') return filteredAndSortedCourses;
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAndSortedCourses.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSortedCourses, currentPage, pageSize]);

  // Batch Selection Handlers
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

  // Execute Batch Delete
  const handleExecuteBulkDelete = () => {
    if (onBatchDeleteCourses) {
      onBatchDeleteCourses(selectedCourseIds);
    } else {
      selectedCourseIds.forEach(id => onDeleteCourse(id));
    }
    setSelectedCourseIds([]);
    setIsBulkDeleteConfirmOpen(false);
    setBackupSuccess(`Đã xóa thành công ${selectedCourseIds.length} khóa học!`);
    setTimeout(() => setBackupSuccess(''), 3000);
  };

  // Execute Batch Category Update
  const handleExecuteBatchCategory = () => {
    if (onBatchUpdateCategory) {
      onBatchUpdateCategory(selectedCourseIds, batchTargetCategory);
    } else {
      const updated = courses.map(c => 
        selectedCourseIds.includes(c.id) ? { ...c, category: batchTargetCategory } : c
      );
      onRestoreCourses(updated);
    }
    setIsBatchCategoryModalOpen(false);
    setSelectedCourseIds([]);
    setBackupSuccess(`Đã chuyển ${selectedCourseIds.length} khóa học sang danh mục "${batchTargetCategory}"!`);
    setTimeout(() => setBackupSuccess(''), 3000);
  };

  // Export Selected Courses to JSON
  const handleExportSelectedCourses = () => {
    const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedCourses, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `myedu_selected_${selectedCourses.length}_courses_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(`Đã xuất ${selectedCourses.length} khóa học được chọn!`);
    setTimeout(() => setBackupSuccess(''), 3000);
  };

  // Category Handlers
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }
    onAddCategory(trimmed);
    setNewCatInput('');
  };

  const handleSaveEditCategory = (oldCat: string) => {
    const trimmed = editingCatValue.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCatIndex(null);
      return;
    }
    onRenameCategory(oldCat, trimmed);
    setEditingCatIndex(null);
  };

  const handleDeleteCategoryPrompt = (cat: string) => {
    const count = courses.filter(c => c.category === cat).length;
    const msg = count > 0
      ? `Danh mục "${cat}" đang có ${count} khóa học. Nếu xóa, các khóa học này sẽ được chuyển về danh mục khác. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa danh mục "${cat}"?`;
    if (confirm(msg)) {
      onDeleteCategory(cat);
    }
  };

  // Source Handlers
  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSourceInput.trim();
    if (!trimmed) return;
    if (sources.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      alert('Nguồn này đã tồn tại!');
      return;
    }
    onAddSource(trimmed);
    setNewSourceInput('');
  };

  const handleSaveEditSource = (oldSource: string) => {
    const trimmed = editingSourceValue.trim();
    if (!trimmed || trimmed === oldSource) {
      setEditingSourceIndex(null);
      return;
    }
    onRenameSource(oldSource, trimmed);
    setEditingSourceIndex(null);
  };

  const handleDeleteSourcePrompt = (source: string) => {
    const count = courses.filter(c => c.sourcePlatform === source).length;
    const msg = count > 0
      ? `Nguồn "${source}" đang gắn với ${count} khóa học. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa nguồn "${source}"?`;
    if (confirm(msg)) {
      onDeleteSource(source);
    }
  };

  // Instructor Handlers
  const handleAddInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newInstInput.trim();
    if (!trimmed) return;
    if (instructors.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      alert('Tác giả / Giảng viên này đã tồn tại!');
      return;
    }
    if (onAddInstructor) onAddInstructor(trimmed);
    setNewInstInput('');
  };

  const handleSaveEditInstructor = (oldInst: string) => {
    const trimmed = editingInstValue.trim();
    if (!trimmed || trimmed === oldInst) {
      setEditingInstIndex(null);
      return;
    }
    if (onRenameInstructor) onRenameInstructor(oldInst, trimmed);
    setEditingInstIndex(null);
  };

  const handleDeleteInstructorPrompt = (inst: string) => {
    const count = courses.filter(c => c.instructor === inst).length;
    const msg = count > 0
      ? `Giảng viên "${inst}" đang có ${count} khóa học. Bạn có chắc muốn xóa tên giảng viên này khỏi danh mục quản lý?`
      : `Bạn có chắc muốn xóa giảng viên "${inst}"?`;
    if (confirm(msg)) {
      if (onDeleteInstructor) onDeleteInstructor(inst);
    }
  };

  // Backup Export
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(courses, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `myedu_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(`Đã xuất file sao lưu toàn bộ: ${filename}`);
    setTimeout(() => setBackupSuccess(''), 3000);
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onRestoreCourses(parsed);
          setBackupSuccess(`Khôi phục thành công ${parsed.length} khóa học!`);
          setTimeout(() => setBackupSuccess(''), 3000);
        } else {
          setBackupError('Định dạng tệp JSON không hợp lệ.');
          setTimeout(() => setBackupError(''), 3000);
        }
      } catch {
        setBackupError('Không thể đọc tệp sao lưu. Vui lòng kiểm tra lại!');
        setTimeout(() => setBackupError(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Reset Sample Data
  const handleResetToSample = () => {
    if (confirm('Khôi phục lại toàn bộ dữ liệu mẫu ban đầu? (Dữ liệu hiện tại sẽ được thay thế bằng 20 khóa học mẫu chuẩn)')) {
      onRestoreCourses(INITIAL_SAMPLE_COURSES);
      setBackupSuccess('Đã khôi phục 20 khóa học mẫu đa ngành thành công!');
      setTimeout(() => setBackupSuccess(''), 3000);
    }
  };

  // Helper for Category Fallback Icon
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in relative pb-28">
      
      {/* Studio Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLearning}
            className="p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Học Tập</span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Trung Tâm Quản Trị Khóa Học
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                COURSE STUDIO 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Không gian quản trị toàn diện: Tạo khóa học, nạp bài hàng loạt, phân loại & sao lưu
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onOpenBulkImport()}
            className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-teal-300 hover:text-teal-200 border border-teal-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-teal-400" />
            <span>Nạp Hàng Loạt (Bulk Abyss)</span>
          </button>

          <button
            onClick={onAddNewCourse}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Khóa Học Mới</span>
          </button>
        </div>
      </div>

      {/* FEATURE 1: MINI KPI METRICS BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Courses */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Tổng Khóa Học</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">{kpiMetrics.totalCourses} <span className="text-xs font-normal text-slate-400">khóa</span></p>
          </div>
        </div>

        {/* Metric 2: Total Lessons */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Tổng Bài Giảng</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">
              {kpiMetrics.totalLessons} <span className="text-xs font-normal text-slate-400">bài</span>
              <span className="text-[10px] text-teal-400 font-medium ml-1.5 hidden sm:inline">
                ({kpiMetrics.videoLessons} video • {kpiMetrics.articleLessons} bài đọc)
              </span>
            </p>
          </div>
        </div>

        {/* Metric 3: Overall Progress */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Tiến Độ Chung</p>
              <span className="text-xs font-extrabold text-purple-400">{kpiMetrics.overallProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full" style={{ width: `${kpiMetrics.overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Metric 4: Taxonomies Summary */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold flex-shrink-0">
            <Tags className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Phân Loại & Giảng Viên</p>
            <p className="text-lg sm:text-xl font-extrabold text-white">
              {kpiMetrics.totalTaxonomies} <span className="text-xs font-normal text-slate-400">mục</span>
              <span className="text-[10px] text-amber-400 font-medium ml-1.5 hidden sm:inline">
                ({categories.length} chủ đề • {instructors.length} GV)
              </span>
            </p>
          </div>
        </div>

      </div>

      {/* Main Studio Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'courses'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Danh Sách Khóa Học</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-inherit font-bold">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('taxonomies')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'taxonomies'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Phân Loại & Giảng Viên</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-inherit font-bold">
              {kpiMetrics.totalTaxonomies}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'backup'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dữ Liệu & Sao Lưu JSON</span>
          </button>
        </div>

        {/* TAB 1: COURSES MANAGEMENT TABLE WITH ADVANCED CONTROLS */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            
            {/* FEATURE 2: ADVANCED TABLE FILTER & SORT CONTROLS BAR */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl space-y-3.5 shadow-md">
              
              {/* Row 1: Search & Quick Status Filters */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Input with Shortcut (/) hint */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchStudio}
                    onChange={(e) => setSearchStudio(e.target.value)}
                    placeholder="Tìm kiếm khóa học theo tên, giảng viên, nguồn... (Nhấn / để tìm nhanh)"
                    className="w-full pl-10 pr-12 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchStudio ? (
                      <button 
                        onClick={() => setSearchStudio('')} 
                        className="text-slate-500 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded">
                        /
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Quick Status Filter Tabs */}
                <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tất cả ({courses.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('in-progress')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === 'in-progress' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Đang học
                  </button>
                  <button
                    onClick={() => setStatusFilter('not-started')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === 'not-started' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Chưa học
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Đã xong (100%)
                  </button>
                </div>

              </div>

              {/* Row 2: Secondary Filters, Sort & Page Size */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Category Dropdown Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold rounded-xl px-3 py-1.5 focus:border-emerald-500"
                  >
                    <option value="all">Tất cả chủ đề ({categories.length})</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Source Dropdown Filter */}
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold rounded-xl px-3 py-1.5 focus:border-emerald-500"
                  >
                    <option value="all">Tất cả nguồn ({sources.length})</option>
                    {sources.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>

                  {(categoryFilter !== 'all' || sourceFilter !== 'all' || statusFilter !== 'all' || searchStudio) && (
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setSourceFilter('all');
                        setStatusFilter('all');
                        setSearchStudio('');
                      }}
                      className="text-amber-400 hover:text-amber-300 text-xs font-semibold px-2 py-1"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>

                {/* Sort By Dropdown & Page Size */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
                      <span>Sắp xếp:</span>
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-slate-950 border border-slate-800 text-xs text-white font-bold rounded-xl px-3 py-1.5 focus:border-emerald-500"
                    >
                      <option value="updated-desc">Mới cập nhật</option>
                      <option value="title-asc">Tên (A ➔ Z)</option>
                      <option value="progress-desc">Tiến độ (Cao ➔ Thấp)</option>
                      <option value="progress-asc">Tiến độ (Thấp ➔ Cao)</option>
                      <option value="lessons-desc">Nhiều bài học nhất</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                    <span className="text-slate-500 text-[11px]">Xem:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2 py-1 focus:border-emerald-500 font-semibold"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value="all">Tất cả</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Courses Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      {/* Checkbox Select All Column */}
                      <th className="py-3.5 px-4 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleSelectAll}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400"
                          title="Chọn tất cả khóa học trên trang này"
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
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedCourses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          Không tìm thấy khóa học nào khớp với điều kiện lọc.
                        </td>
                      </tr>
                    ) : (
                      paginatedCourses.map((c) => {
                        const total = c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
                        const completed = c.chapters.reduce(
                          (acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length,
                          0
                        );
                        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                        const isSelected = selectedCourseIds.includes(c.id);
                        const hasImgFailed = failedImageUrls[c.id] || !c.thumbnailUrl;

                        return (
                          <tr 
                            key={c.id} 
                            className={`transition-colors group ${
                              isSelected ? 'bg-emerald-950/25 hover:bg-emerald-950/40' : 'hover:bg-slate-850/50'
                            }`}
                          >
                            {/* Checkbox Single Column */}
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

                            {/* FEATURE 3: OPTIMIZED 16:9 THUMBNAIL WITH THEMATIC GRADIENT FALLBACK */}
                            <td className="py-4 px-4 max-w-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 shadow-sm relative flex items-center justify-center">
                                  {!hasImgFailed ? (
                                    <img 
                                      src={c.thumbnailUrl} 
                                      alt={c.title} 
                                      className="w-full h-full object-cover" 
                                      onError={() => setFailedImageUrls(prev => ({ ...prev, [c.id]: true }))}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
                                      {getCategoryIcon(c.category)}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p 
                                    onClick={() => onSelectCourseAndLesson(c.id)}
                                    className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
                                  >
                                    {c.title}
                                  </p>
                                  {c.instructor && (
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <User className="w-3 h-3 text-emerald-400" />
                                      <span>{c.instructor}</span>
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

                            {/* Source Platform */}
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

                            {/* Action Buttons with 1-Click Duplicate */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onSelectCourseAndLesson(c.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
                                >
                                  Vào Học
                                </button>

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
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* SMART PAGINATION CONTROLS */}
              {pageSize !== 'all' && totalPages > 1 && (
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400">
                    Hiển thị <span className="text-white font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredAndSortedCourses.length)}</span> trên <span className="text-white font-bold">{filteredAndSortedCourses.length}</span> khóa học
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Trước</span>
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-xl font-bold text-xs transition-all ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-850'
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
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 flex items-center gap-1 font-semibold"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TAXONOMIES (CATEGORIES, SOURCES & INSTRUCTORS) */}
        {activeTab === 'taxonomies' && (
          <div className="space-y-6">
            
            {/* Sub-tabs for taxonomies */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
              <button
                onClick={() => setTaxonomySubTab('categories')}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                  taxonomySubTab === 'categories'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tags className="w-4 h-4" />
                <span>Danh Mục Chủ Đề ({categories.length})</span>
              </button>

              <button
                onClick={() => setTaxonomySubTab('sources')}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                  taxonomySubTab === 'sources'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Nền Tảng / Nguồn Mua ({sources.length})</span>
              </button>

              <button
                onClick={() => setTaxonomySubTab('instructors')}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                  taxonomySubTab === 'instructors'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Tác Giả / Giảng Viên ({instructors.length})</span>
              </button>
            </div>

            {/* Subtab 1: Categories */}
            {taxonomySubTab === 'categories' && (
              <div className="space-y-4">
                <form onSubmit={handleAddCategorySubmit} className="flex gap-2.5 max-w-xl">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Nhập tên danh mục mới (ví dụ: An ninh mạng, DevOps...)"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/60"
                  />
                  <button
                    type="submit"
                    disabled={!newCatInput.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Danh Mục</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {categories.map((cat, idx) => {
                    const count = courses.filter(c => c.category === cat).length;
                    const isEditing = editingCatIndex === idx;

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-md"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingCatValue}
                              onChange={(e) => setEditingCatValue(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-emerald-500 rounded-xl text-xs text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditCategory(cat);
                                if (e.key === 'Escape') setEditingCatIndex(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveEditCategory(cat)}
                              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Tags className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span className="font-bold text-slate-200 truncate">{cat}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">{count} khóa</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingCatIndex(idx);
                                setEditingCatValue(cat);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCategoryPrompt(cat)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subtab 2: Sources */}
            {taxonomySubTab === 'sources' && (
              <div className="space-y-4">
                <form onSubmit={handleAddSourceSubmit} className="flex gap-2.5 max-w-xl">
                  <input
                    type="text"
                    value={newSourceInput}
                    onChange={(e) => setNewSourceInput(e.target.value)}
                    placeholder="Nhập tên nguồn / nền tảng mới (ví dụ: YouTube, Khóa học VIP...)"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:border-teal-500/60"
                  />
                  <button
                    type="submit"
                    disabled={!newSourceInput.trim()}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nguồn</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {sources.map((src, idx) => {
                    const count = courses.filter(c => c.sourcePlatform === src).length;
                    const isEditing = editingSourceIndex === idx;

                    return (
                      <div
                        key={src}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-md"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingSourceValue}
                              onChange={(e) => setEditingSourceValue(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-teal-500 rounded-xl text-xs text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditSource(src);
                                if (e.key === 'Escape') setEditingSourceIndex(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveEditSource(src)}
                              className="p-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-500"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Globe className="w-4 h-4 text-teal-400 flex-shrink-0" />
                            <span className="font-bold text-slate-200 truncate">{src}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">{count} khóa</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingSourceIndex(idx);
                                setEditingSourceValue(src);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSourcePrompt(src)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subtab 3: Instructors / Authors */}
            {taxonomySubTab === 'instructors' && (
              <div className="space-y-4">
                <form onSubmit={handleAddInstructorSubmit} className="flex gap-2.5 max-w-xl">
                  <input
                    type="text"
                    value={newInstInput}
                    onChange={(e) => setNewInstInput(e.target.value)}
                    placeholder="Nhập tên giảng viên / chuyên gia mới..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500/60"
                  />
                  <button
                    type="submit"
                    disabled={!newInstInput.trim()}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Giảng Viên</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {instructors.map((inst, idx) => {
                    const count = courses.filter(c => c.instructor === inst).length;
                    const isEditing = editingInstIndex === idx;

                    return (
                      <div
                        key={inst}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-md"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingInstValue}
                              onChange={(e) => setEditingInstValue(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-amber-500 rounded-xl text-xs text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditInstructor(inst);
                                if (e.key === 'Escape') setEditingInstIndex(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveEditInstructor(inst)}
                              className="p-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 min-w-0">
                            <User className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="font-bold text-slate-200 truncate">{inst}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">{count} khóa</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingInstIndex(idx);
                                setEditingInstValue(inst);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInstructorPrompt(inst)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: BACKUP & STORAGE HEALTH METERS */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            
            {/* FEATURE 3: STORAGE USAGE & HEALTH STATUS METER */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Dung Lượng Bộ Nhớ Thiết Bị (Offline Storage Health)</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Offline Ready & An Toàn</span>
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dữ liệu được lưu trữ trực tiếp trên trình duyệt thiết bị của bạn, bảo mật tuyệt đối và không phụ thuộc server.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Đang dùng: </span>
                  <span className="text-sm font-extrabold text-teal-400">{storageMetrics.usedKB} KB</span>
                  <span className="text-xs text-slate-500"> / {storageMetrics.quotaMB} MB (~{storageMetrics.percentUsed}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(2, storageMetrics.percentUsed)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0 MB</span>
                  <span>{storageMetrics.usedMB} MB / {storageMetrics.quotaMB} MB</span>
                  <span>5.0 MB (Giới hạn LocalStorage)</span>
                </div>
              </div>
            </div>

            {backupSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 font-medium animate-fade-in">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{backupSuccess}</span>
              </div>
            )}

            {backupError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{backupError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Export Backup JSON */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Xuất Bản Sao Lưu Toàn Bộ (Backup JSON)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Tải về toàn bộ {courses.length} khóa học, mục lục bài giảng, ghi chú và tiến độ thành 1 tệp tin JSON an toàn.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Xuống Tệp Sao Lưu (.json)</span>
                </button>
              </div>

              {/* Card 2: Restore / Import JSON */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Khôi Phục Dữ Liệu Từ File JSON</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Nạp tệp JSON sao lưu đã xuất trước đó để phục hồi lại toàn bộ danh sách khóa học và tiến độ trên máy mới.
                  </p>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json,application/json"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn Tệp JSON Để Khôi Phục</span>
                </button>
              </div>

            </div>

            {/* Reset Factory Sample Data */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Khôi Phục Bộ Khóa Học Mẫu Chuẩn (20 Khóa Học Đa Ngành)</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Đặt lại toàn bộ dữ liệu mẫu ban đầu gồm 20 khóa học hoàn chỉnh video Abyss và bài viết.
                </p>
              </div>

              <button
                onClick={handleResetToSample}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-amber-950/40 text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors whitespace-nowrap"
              >
                Khôi Phục Mẫu
              </button>
            </div>

          </div>
        )}

      </div>

      {/* FEATURE 4: FLOATING BATCH ACTION TOOLBAR (When 1+ courses selected) */}
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
              title="Bỏ chọn tất cả (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FEATURE 5: CUSTOM DARK DELETE MODAL (SINGLE COURSE) */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-rose-950/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
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

      {/* FEATURE 5: CUSTOM DARK DELETE MODAL (BULK COURSES) */}
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
