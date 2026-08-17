import React, { useState, useEffect, useMemo } from 'react';
import { Course, CategoryType, Chapter } from '../../types';
import { parseBulkLessonInput, createLessonsFromParsed, ParsedLessonItem } from '../../lib/bulkParser';
import { 
  X, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  User, 
  Globe,
  Tags
} from 'lucide-react';
import { SearchableSelect } from '../common/SearchableSelect';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  categories: string[];
  sources: string[];
  instructors?: string[];
  preselectedCourseId?: string;
  onSaveNewCourse: (course: Course) => void;
  onAddChapterToCourse: (courseId: string, chapter: Chapter) => void;
  onAddInstructor?: (inst: string) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  courses,
  categories,
  sources,
  instructors = [],
  preselectedCourseId,
  onSaveNewCourse,
  onAddChapterToCourse,
  onAddInstructor,
}) => {
  const [mode, setMode] = useState<'existing' | 'new'>(preselectedCourseId ? 'existing' : 'new');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId || (courses[0]?.id || ''));

  // New Course fields
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>(categories[0] || 'AI & Machine Learning');
  const [newInstructor, setNewInstructor] = useState<string>('');
  const [newSourcePlatform, setNewSourcePlatform] = useState<string>(sources[0] || 'Udemy');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('AI, KhoaHoc, Abyss');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState<string>('');

  // Chapter & Bulk input
  const [chapterTitle, setChapterTitle] = useState<string>('Chương 1: Danh sách bài giảng');
  const [rawText, setRawText] = useState<string>(
    `<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>\n<iframe width="640" height="360" src="https://abyssplayer.com/bGOgQoLE0" allowfullscreen></iframe>`
  );
  const [parsedItems, setParsedItems] = useState<ParsedLessonItem[]>([]);

  // Update parsed items on rawText change
  useEffect(() => {
    const items = parseBulkLessonInput(rawText);
    setParsedItems(items);
  }, [rawText]);

  // Update selected course if preselectedCourseId changes
  useEffect(() => {
    if (preselectedCourseId) {
      setSelectedCourseId(preselectedCourseId);
      setMode('existing');
    }
  }, [preselectedCourseId]);

  // Auto-collect unique instructors across global list and courses
  const existingInstructors = useMemo(() => {
    const set = new Set<string>();
    instructors.forEach(i => {
      if (i && i.trim()) set.add(i.trim());
    });
    courses.forEach(c => {
      if (c.instructor && c.instructor.trim()) {
        set.add(c.instructor.trim());
      }
    });
    return Array.from(set);
  }, [courses, instructors]);

  if (!isOpen) return null;

  const validCount = parsedItems.filter((item) => item.isValid).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validCount === 0) {
      alert('Chưa có link video hợp lệ nào được nhận diện!');
      return;
    }

    const lessons = createLessonsFromParsed(parsedItems);

    if (mode === 'new') {
      if (!newTitle.trim()) {
        alert('Vui lòng nhập tên khóa học mới!');
        return;
      }

      if (newInstructor.trim() && onAddInstructor) {
        onAddInstructor(newInstructor.trim());
      }

      const initialChapter: Chapter = {
        id: `ch-${Date.now()}`,
        title: chapterTitle.trim() || 'Chương 1: Bài giảng mở đầu',
        order: 1,
        lessons,
      };

      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Khóa học được nạp hàng loạt từ Abyss Player',
        category: newCategory,
        instructor: newInstructor.trim() || undefined,
        sourcePlatform: newSourcePlatform || undefined,
        thumbnailUrl: newThumbnailUrl.trim() || undefined,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        chapters: [initialChapter],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveNewCourse(newCourse);
    } else {
      if (!selectedCourseId) {
        alert('Vui lòng chọn khóa học cần nạp thêm!');
        return;
      }

      const targetCourse = courses.find(c => c.id === selectedCourseId);
      const nextOrder = (targetCourse?.chapters.length || 0) + 1;

      const newChapter: Chapter = {
        id: `ch-${Date.now()}`,
        title: chapterTitle.trim() || `Chương ${nextOrder}: Bài giảng mới`,
        order: nextOrder,
        lessons,
      };

      onAddChapterToCourse(selectedCourseId, newChapter);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base sm:text-lg">
            <Sparkles className="w-5 h-5" />
            <span>Nạp Bài Giảng Hàng Loạt (Bulk Abyss Parser)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'new'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              + Tạo Khóa Học Mới
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'existing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📥 Nạp Thêm Vào Khóa Đang Có
            </button>
          </div>

          {/* New Course Details */}
          {mode === 'new' ? (
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Thông Tin Khóa Học Mới</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Khóa Học *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Lập Trình Python Căn Bản Từ Zero..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Danh Mục / Chủ Đề"
                  value={newCategory}
                  onChange={setNewCategory}
                  options={categories}
                  placeholder="Chọn danh mục..."
                  allowCustom={true}
                />

                <SearchableSelect
                  label="Tác Giả / Giảng Viên"
                  icon={<User className="w-3.5 h-3.5 text-emerald-400" />}
                  value={newInstructor}
                  onChange={setNewInstructor}
                  options={existingInstructors}
                  placeholder="Chọn hoặc gõ tên tác giả..."
                  allowCustom={true}
                  onAddNewOption={(newInst) => onAddInstructor && onAddInstructor(newInst)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Nguồn Mua / Nền Tảng"
                  icon={<Globe className="w-3.5 h-3.5 text-teal-400" />}
                  value={newSourcePlatform}
                  onChange={setNewSourcePlatform}
                  options={sources}
                  placeholder="Chọn nền tảng..."
                  allowCustom={true}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Thẻ Tags (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="AI, Python, Data"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả ngắn (Tùy chọn)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung kiến thức của khóa..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
              <label className="block text-xs font-bold text-slate-300">Chọn Khóa Học Tiếp Nhận</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500/60"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.category}] {c.title} {c.instructor ? `(GV: ${c.instructor})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chapter Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Chương Học Tiếp Nhận</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Chương 1: Danh sách bài giảng..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
            />
          </div>

          {/* Raw Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Dán danh sách Video (Iframe, URL Abyss, hoặc Short ID)</label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Đã nhận diện: {validCount}/{parsedItems.length} bài
              </span>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Dán văn bản hỗn hợp chứa các link Abyss, ví dụ:\n<iframe src="https://abyssplayer.com/Ld3tfGRGA"></iframe>\nhttps://abyssplayer.com/bGOgQoLE0`}
              className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:border-emerald-500/60 custom-scrollbar resize-none"
            />
          </div>

          {/* Real-time Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xem Trước Danh Sách Bài Học</h5>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-800/60 text-xs custom-scrollbar">
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-900/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="text-slate-300 font-medium truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 max-w-[150px] truncate">
                        {item.videoSource || 'Không hợp lệ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={validCount === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nạp {validCount} Bài Học</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
