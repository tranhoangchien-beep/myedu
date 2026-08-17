import React, { useState, useRef } from 'react';
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
  FolderOpen
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
}

export const CourseStudioView: React.FC<CourseStudioViewProps> = ({
  courses,
  categories,
  sources,
  instructors = [],
  onBackToLearning,
  onAddNewCourse,
  onEditCourse,
  onDeleteCourse,
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
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'taxonomies' | 'backup'>('courses');
  const [searchStudio, setSearchStudio] = useState<string>('');

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

  // Filtered courses in studio table
  const studioCourses = courses.filter((c) => {
    if (!searchStudio.trim()) return true;
    const q = searchStudio.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.sourcePlatform && c.sourcePlatform.toLowerCase().includes(q))
    );
  });

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
    const filename = `myedu_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccess(`Đã xuất file sao lưu: ${filename}`);
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

  const totalTaxonomiesCount = categories.length + sources.length + instructors.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      
      {/* Studio Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl backdrop-blur-md">
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
                COURSE STUDIO
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

      {/* Main Studio Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
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
              {totalTaxonomiesCount}
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

        {/* TAB 1: COURSES MANAGEMENT TABLE */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchStudio}
                  onChange={(e) => setSearchStudio(e.target.value)}
                  placeholder="Tìm kiếm khóa học theo tên, giảng viên, nguồn..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Hiển thị <span className="text-emerald-400 font-bold">{studioCourses.length}</span> / {courses.length} khóa học
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Khóa Học & Giảng Viên</th>
                      <th className="py-3.5 px-4">Chủ Đề</th>
                      <th className="py-3.5 px-4">Nguồn</th>
                      <th className="py-3.5 px-4">Cấu Trúc</th>
                      <th className="py-3.5 px-4">Tiến Độ</th>
                      <th className="py-3.5 px-5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {studioCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          Không tìm thấy khóa học nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      studioCourses.map((c) => {
                        const total = c.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
                        const completed = c.chapters.reduce(
                          (acc, ch) => acc + ch.lessons.filter(l => l.isCompleted).length,
                          0
                        );
                        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                        return (
                          <tr key={c.id} className="hover:bg-slate-850/50 transition-colors group">
                            
                            {/* Title & Instructor */}
                            <td className="py-4 px-5 max-w-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                                  {c.thumbnailUrl ? (
                                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <BookOpen className="w-4 h-4" />
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
                                      {c.instructor}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
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
                              <div className="text-xs text-slate-300 font-medium">
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

                            {/* Action Buttons */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onSelectCourseAndLesson(c.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
                                >
                                  Vào Học
                                </button>

                                <button
                                  onClick={() => onEditCourse(c)}
                                  title="Chỉnh sửa thông tin & mục lục khóa học"
                                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-slate-800 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => onOpenBulkImport(c.id)}
                                  title="Nạp thêm bài học vào khóa này"
                                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa khóa học "${c.title}"?`)) {
                                      onDeleteCourse(c.id);
                                    }
                                  }}
                                  title="Xóa khóa học"
                                  className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
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

        {/* TAB 3: BACKUP & DATA */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            {backupSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5 font-medium">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{backupSuccess}</span>
              </div>
            )}

            {backupError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5 font-medium">
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
                  <h3 className="text-sm font-bold text-white">Xuất Bản Sao Lưu (Backup JSON)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Tải về toàn bộ dữ liệu {courses.length} khóa học, danh mục, nguồn và tiến độ học tập thành 1 tệp tin JSON độc lập.
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

    </div>
  );
};
