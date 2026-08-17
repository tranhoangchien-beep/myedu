import React, { useState, useRef } from 'react';
import { Course } from '../../types';
import { 
  X, 
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
  ExternalLink,
  Layers,
  Globe,
  User,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { INITIAL_SAMPLE_COURSES } from '../../lib/storage';

interface CourseStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  categories: string[];
  sources: string[];
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
  onRestoreCourses: (courses: Course[]) => void;
}

export const CourseStudioModal: React.FC<CourseStudioModalProps> = ({
  isOpen,
  onClose,
  courses,
  categories,
  sources,
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
  onRestoreCourses,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'taxonomies' | 'backup'>('courses');
  const [searchStudio, setSearchStudio] = useState<string>('');

  // Category & Source Sub-tab state
  const [taxonomySubTab, setTaxonomySubTab] = useState<'categories' | 'sources'>('categories');
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState<string>('');

  const [newSourceInput, setNewSourceInput] = useState<string>('');
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceValue, setEditingSourceValue] = useState<string>('');

  // Backup states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupSuccess, setBackupSuccess] = useState<string>('');
  const [backupError, setBackupError] = useState<string>('');

  if (!isOpen) return null;

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
  const handleResetSampleData = () => {
    if (confirm('Khôi phục lại dữ liệu mẫu gốc? Toàn bộ các khóa học tùy chỉnh hiện tại sẽ được làm mới.')) {
      onRestoreCourses(INITIAL_SAMPLE_COURSES);
      setBackupSuccess('Đã khôi phục dữ liệu mẫu gốc thành công.');
      setTimeout(() => setBackupSuccess(''), 3000);
    }
  };

  // Compute total stats
  let totalLessonsAll = 0;
  let completedLessonsAll = 0;
  let starredLessonsAll = 0;
  courses.forEach(c => {
    c.chapters.forEach(ch => {
      ch.lessons.forEach(l => {
        totalLessonsAll += 1;
        if (l.isCompleted) completedLessonsAll += 1;
        if (l.isStarred) starredLessonsAll += 1;
      });
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Trung Tâm Quản Trị Khóa Học</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">Quản lý toàn diện khóa học, nạp bài giảng hàng loạt, danh mục & dữ liệu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'courses'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khóa Học & Bài Giảng</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-300 font-semibold">{courses.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('taxonomies')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'taxonomies'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Danh Mục & Nền Tảng</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-300 font-semibold">{categories.length + sources.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'backup'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sao Lưu & Dữ Liệu</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* TAB 1: COURSES & LESSONS MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="space-y-5">
              {/* Action Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
                <div>
                  <h3 className="font-bold text-sm text-white">Thêm Khóa Học Mới</h3>
                  <p className="text-xs text-slate-400">Tạo khóa học tùy chỉnh hoặc nạp danh sách link Abyss siêu tốc</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBulkImport();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Nạp Hàng Loạt (Bulk Abyss)</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onAddNewCourse();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tạo Khóa Học Mới</span>
                  </button>
                </div>
              </div>

              {/* Search Bar for studio table */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchStudio}
                    onChange={(e) => setSearchStudio(e.target.value)}
                    placeholder="Tìm theo tên khóa học, danh mục, giảng viên..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500/60"
                  />
                </div>

                <div className="text-xs text-slate-400">
                  Tổng cộng: <strong className="text-emerald-400">{courses.length}</strong> khóa học &bull; <strong className="text-slate-200">{totalLessonsAll}</strong> bài giảng
                </div>
              </div>

              {/* Courses Table / List */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="py-3 px-4">Khóa Học</th>
                        <th className="py-3 px-3">Danh Mục / Nguồn</th>
                        <th className="py-3 px-3">Nội Dung</th>
                        <th className="py-3 px-3">Tiến Độ</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {studioCourses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                            Không tìm thấy khóa học nào khớp với từ khóa.
                          </td>
                        </tr>
                      ) : (
                        studioCourses.map((c) => {
                          const courseLessons = c.chapters.flatMap(ch => ch.lessons);
                          const completed = courseLessons.filter(l => l.isCompleted).length;
                          const total = courseLessons.length;
                          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                          return (
                            <tr key={c.id} className="hover:bg-slate-900/60 transition-colors group">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-8 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                                    {c.thumbnailUrl ? (
                                      <img src={c.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                                      {c.title}
                                    </p>
                                    {c.instructor && (
                                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <User className="w-3 h-3 text-emerald-400" />
                                        {c.instructor}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex flex-col gap-1">
                                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold w-max">
                                    {c.category}
                                  </span>
                                  {c.sourcePlatform && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Globe className="w-3 h-3 text-slate-500" />
                                      {c.sourcePlatform}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="text-slate-300 font-medium">
                                  {c.chapters.length} chương &bull; {total} bài
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="w-24 space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400">{completed}/{total}</span>
                                    <span className="text-emerald-400 font-bold">{pct}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onEditCourse(c);
                                    }}
                                    title="Chỉnh sửa thông tin & chương bài"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenBulkImport(c.id);
                                    }}
                                    title="Nạp thêm bài học vào khóa này"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc muốn xóa khóa học "${c.title}"?`)) {
                                        onDeleteCourse(c.id);
                                      }
                                    }}
                                    title="Xóa khóa học"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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

          {/* TAB 2: TAXONOMIES (CATEGORIES & SOURCES) */}
          {activeTab === 'taxonomies' && (
            <div className="space-y-6">
              {/* Sub tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setTaxonomySubTab('categories')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    taxonomySubTab === 'categories'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tags className="w-3.5 h-3.5" />
                  <span>Danh Mục Chủ Đề ({categories.length})</span>
                </button>

                <button
                  onClick={() => setTaxonomySubTab('sources')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    taxonomySubTab === 'sources'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Nền Tảng / Nguồn Mua ({sources.length})</span>
                </button>
              </div>

              {/* Subtab 1: Categories */}
              {taxonomySubTab === 'categories' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="Nhập tên danh mục mới (ví dụ: An ninh mạng, DevOps...)"
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/60"
                    />
                    <button
                      type="submit"
                      disabled={!newCatInput.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Danh Mục</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat, idx) => {
                      const count = courses.filter(c => c.category === cat).length;
                      const isEditing = editingCatIndex === idx;

                      return (
                        <div
                          key={cat}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 flex-1 mr-2">
                              <input
                                type="text"
                                value={editingCatValue}
                                onChange={(e) => setEditingCatValue(e.target.value)}
                                className="flex-1 px-2 py-1 bg-slate-900 border border-emerald-500 rounded text-xs text-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditCategory(cat);
                                  if (e.key === 'Escape') setEditingCatIndex(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveEditCategory(cat)}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <Tags className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="font-semibold text-slate-200 truncate">{cat}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-bold">{count}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingCatIndex(idx);
                                  setEditingCatValue(cat);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCategoryPrompt(cat)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <Trash2 className="w-3 h-3" />
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
                  <form onSubmit={handleAddSourceSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newSourceInput}
                      onChange={(e) => setNewSourceInput(e.target.value)}
                      placeholder="Nhập tên nguồn / nền tảng mới (ví dụ: YouTube, Khóa học VIP...)"
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-teal-500/60"
                    />
                    <button
                      type="submit"
                      disabled={!newSourceInput.trim()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Nguồn</span>
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sources.map((src, idx) => {
                      const count = courses.filter(c => c.sourcePlatform === src).length;
                      const isEditing = editingSourceIndex === idx;

                      return (
                        <div
                          key={src}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 flex-1 mr-2">
                              <input
                                type="text"
                                value={editingSourceValue}
                                onChange={(e) => setEditingSourceValue(e.target.value)}
                                className="flex-1 px-2 py-1 bg-slate-900 border border-teal-500 rounded text-xs text-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditSource(src);
                                  if (e.key === 'Escape') setEditingSourceIndex(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveEditSource(src)}
                                className="p-1 rounded bg-teal-600 text-white hover:bg-teal-500"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <Globe className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                              <span className="font-semibold text-slate-200 truncate">{src}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-bold">{count}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingSourceIndex(idx);
                                  setEditingSourceValue(src);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSourcePrompt(src)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* TAB 3: BACKUP & SYSTEM DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {backupSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{backupSuccess}</span>
                </div>
              )}

              {backupError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{backupError}</span>
                </div>
              )}

              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Tổng khóa học</p>
                  <p className="text-lg font-bold text-white mt-0.5">{courses.length}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Tổng bài học</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{totalLessonsAll}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Đã hoàn thành</p>
                  <p className="text-lg font-bold text-teal-300 mt-0.5">{completedLessonsAll}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <p className="text-[11px] text-slate-400">Bài đã ghim</p>
                  <p className="text-lg font-bold text-amber-400 mt-0.5">{starredLessonsAll}</p>
                </div>
              </div>

              {/* Backup Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Download className="w-4 h-4" />
                      <h4 className="font-bold text-sm text-white">Xuất File Sao Lưu (Export JSON)</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Tải toàn bộ dữ liệu khóa học, tiến độ và ghi chú về máy tính để lưu trữ an toàn.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Sao Lưu (.json)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                      <Upload className="w-4 h-4" />
                      <h4 className="font-bold text-sm text-white">Khôi Phục Dữ Liệu (Import JSON)</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Nạp dữ liệu từ file backup JSON đã lưu trước đó vào hệ thống.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportBackup}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <Upload className="w-4 h-4 text-teal-400" />
                    <span>Chọn File JSON Để Khôi Phục</span>
                  </button>
                </div>
              </div>

              {/* Reset Default */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Khôi phục về trạng thái khóa học mẫu ban đầu</span>
                <button
                  onClick={handleResetSampleData}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục mẫu gốc</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0 text-xs text-slate-500">
          <span>MyEdu Studio Hub &bull; Local-First Storage</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Đóng Studio
          </button>
        </div>

      </div>
    </div>
  );
};
