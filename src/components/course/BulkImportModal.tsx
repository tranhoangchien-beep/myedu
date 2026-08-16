import React, { useState, useEffect } from 'react';
import { Course, CategoryType, Chapter } from '../../types';
import { parseBulkLessonInput, createLessonsFromParsed, ParsedLessonItem } from '../../lib/bulkParser';
import { 
  X, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  User,
  Globe
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  categories: string[];
  sources: string[];
  preselectedCourseId?: string;
  onSaveNewCourse: (course: Course) => void;
  onAddChapterToCourse: (courseId: string, chapter: Chapter) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  courses,
  categories,
  sources,
  preselectedCourseId,
  onSaveNewCourse,
  onAddChapterToCourse,
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
      setMode('existing');
      setSelectedCourseId(preselectedCourseId);
    }
  }, [preselectedCourseId]);

  if (!isOpen) return null;

  const validCount = parsedItems.filter(i => i.isValid).length;

  const handleImport = () => {
    if (parsedItems.length === 0) {
      alert('Vui lòng dán ít nhất 1 đường link hoặc mã iframe Abyss!');
      return;
    }

    const lessons = createLessonsFromParsed(parsedItems);

    const newChapter: Chapter = {
      id: `ch_${Date.now()}`,
      title: chapterTitle || 'Chương 1: Danh sách bài học',
      order: 1,
      lessons,
    };

    if (mode === 'new') {
      if (!newTitle.trim()) {
        alert('Vui lòng nhập tên khóa học!');
        return;
      }

      const tagsArray = newTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const course: Course = {
        id: `course_${Date.now()}`,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        instructor: newInstructor.trim() || undefined,
        sourcePlatform: newSourcePlatform || 'Khác',
        tags: tagsArray,
        thumbnailUrl: newThumbnailUrl.trim() || undefined,
        chapters: [newChapter],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveNewCourse(course);
    } else {
      if (!selectedCourseId) {
        alert('Vui lòng chọn khóa học cần nạp!');
        return;
      }
      onAddChapterToCourse(selectedCourseId, newChapter);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nạp Hàng Loạt Link Video Abyss</h2>
              <p className="text-xs text-slate-400">Dán danh sách iframe hoặc link để tạo tự động toàn bộ bài học</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'new'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạo Khóa Học Mới
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'existing'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Thêm Vào Khóa Đang Có
          </button>
        </div>

        {/* Destination fields */}
        {mode === 'new' ? (
          <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tên Khóa Học *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Làm Chủ Phân Tích Dữ Liệu Với Python..."
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chủ Đề / Danh Mục</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500/60"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tác Giả / Giảng Viên</span>
                </label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="Ví dụ: Hoàng Long, Alex Đặng..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>Nguồn Mua / Nền Tảng</span>
                </label>
                <select
                  value={newSourcePlatform}
                  onChange={(e) => setNewSourcePlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500/60"
                >
                  {sources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

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

        {/* Chapter Name & Bulk Paste Area */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Chương / Phần Bài Học</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Chương 1: Kiến thức nền tảng"
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Dán danh sách mã Iframe / Link Abyss (mỗi bài một dòng)
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Đã phát hiện {validCount}/{parsedItems.length} video hợp lệ
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`<iframe width="640" height="360" src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>\n<iframe width="640" height="360" src="https://abyssplayer.com/bGOgQoLE0" allowfullscreen></iframe>\nHoặc:\nBài 1: Giới thiệu | https://abyssplayer.com/Ld3tfGRGA`}
              rows={6}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:border-emerald-500/60 resize-y"
            />
          </div>

          {/* Quick Preview of Parsed Items */}
          {parsedItems.length > 0 && (
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Xem trước danh sách bài học:</span>
              {parsedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-900/60 rounded border border-slate-800/40">
                  <span className="text-slate-300 truncate max-w-sm">{item.title}</span>
                  {item.isValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Abyss OK
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3" /> Link lạ
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleImport}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nạp {parsedItems.length} Bài Học Ngay</span>
          </button>
        </div>

      </div>
    </div>
  );
};
