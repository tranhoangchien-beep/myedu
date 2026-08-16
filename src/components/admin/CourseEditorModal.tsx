import React, { useState, useEffect } from 'react';
import { Course, Chapter, Lesson } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  FolderPlus, 
  BookOpen, 
  User, 
  Globe, 
  Tag, 
  Image, 
  FileText,
  ChevronDown,
  ChevronRight,
  Video
} from 'lucide-react';
import { extractAbyssId } from '../../lib/abyss';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit: Course | null; // null if creating a new course
  categories: string[];
  sources: string[];
  onSaveCourse: (course: Course) => void;
  onOpenCategoryManager: () => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  categories,
  sources,
  onSaveCourse,
  onOpenCategoryManager,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'AI & Machine Learning');
  const [instructor, setInstructor] = useState<string>('');
  const [sourcePlatform, setSourcePlatform] = useState<string>(sources[0] || 'Udemy');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Expanded chapter IDs
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setDescription(courseToEdit.description || '');
      setCategory(courseToEdit.category || categories[0] || 'Chung');
      setInstructor(courseToEdit.instructor || '');
      setSourcePlatform(courseToEdit.sourcePlatform || sources[0] || 'Khác');
      setThumbnailUrl(courseToEdit.thumbnailUrl || '');
      setTagsInput(courseToEdit.tags?.join(', ') || '');
      setChapters(courseToEdit.chapters || []);

      // Auto expand all chapters
      const expanded: Record<string, boolean> = {};
      courseToEdit.chapters.forEach(ch => { expanded[ch.id] = true; });
      setExpandedChapterIds(expanded);
    } else {
      // New course defaults
      setTitle('');
      setDescription('');
      setCategory(categories[0] || 'AI & Machine Learning');
      setInstructor('');
      setSourcePlatform(sources[0] || 'Udemy');
      setThumbnailUrl('');
      setTagsInput('');
      const defaultChId = `ch_${Date.now()}`;
      setChapters([
        {
          id: defaultChId,
          title: 'Chương 1: Danh sách bài học',
          order: 1,
          lessons: [
            {
              id: `les_${Date.now()}_1`,
              title: 'Bài 1: Giới thiệu khóa học',
              videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
              durationMinutes: 15,
              isCompleted: false,
              isStarred: false,
            }
          ]
        }
      ]);
      setExpandedChapterIds({ [defaultChId]: true });
    }
  }, [courseToEdit, isOpen, categories, sources]);

  if (!isOpen) return null;

  const toggleChapterExpand = (chId: string) => {
    setExpandedChapterIds(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  // Chapter CRUD
  const handleAddChapter = () => {
    const newId = `ch_${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      title: `Chương ${chapters.length + 1}: Chủ đề mới`,
      order: chapters.length + 1,
      lessons: [],
    };
    setChapters([...chapters, newChapter]);
    setExpandedChapterIds(prev => ({ ...prev, [newId]: true }));
  };

  const handleUpdateChapterTitle = (chId: string, newTitle: string) => {
    setChapters(chapters.map(ch => ch.id === chId ? { ...ch, title: newTitle } : ch));
  };

  const handleDeleteChapter = (chId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chương này cùng tất cả bài học bên trong?')) {
      setChapters(chapters.filter(ch => ch.id !== chId));
    }
  };

  // Lesson CRUD
  const handleAddLesson = (chId: string) => {
    const newLesson: Lesson = {
      id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `Bài học mới`,
      videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
      durationMinutes: 20,
      isCompleted: false,
      isStarred: false,
    };

    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return { ...ch, lessons: [...ch.lessons, newLesson] };
      }
      return ch;
    }));
  };

  const handleUpdateLesson = (chId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
        };
      }
      return ch;
    }));
  };

  const handleDeleteLesson = (chId: string, lessonId: string) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lessonId)
        };
      }
      return ch;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên khóa học!');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const savedCourse: Course = {
      id: courseToEdit ? courseToEdit.id : `course_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Chung',
      instructor: instructor.trim() || undefined,
      sourcePlatform: sourcePlatform || 'Khác',
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      tags,
      chapters,
      createdAt: courseToEdit ? courseToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCourse(savedCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                {courseToEdit ? 'Chỉnh Sửa Khóa Học & Mục Lục' : 'Tạo Khóa Học Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Quản lý tiêu đề, tác giả/giảng viên, nguồn mua và danh sách video Abyss
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Thông Tin Cơ Bản</span>
            </h3>

            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tên Khóa Học *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Làm Chủ Trí Tuệ Nhân Tạo & AI Generative..."
                className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                required
              />
            </div>

            {/* Category & Instructor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">Danh Mục / Chủ Đề</label>
                  <button
                    type="button"
                    onClick={onOpenCategoryManager}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    + Quản lý danh mục
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500/60"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tác Giả / Giảng Viên</span>
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh, Alex Đặng, VietJack..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Source Platform & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  <span>Nguồn Mua / Nền Tảng</span>
                </label>
                <select
                  value={sourcePlatform}
                  onChange={(e) => setSourcePlatform(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500/60"
                >
                  {sources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thẻ Tags (cách nhau bởi dấu phẩy)</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="AI, Lập trình, Khóa học hay"
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Cover Image & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ảnh Bìa (Thumbnail URL)</span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả Ngắn</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung chính..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Chapters & Lessons Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <span>Mục Lục Chương & Danh Sách Bài Học ({chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddChapter}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Chương Mới</span>
              </button>
            </div>

            <div className="space-y-3">
              {chapters.map((chapter, chIdx) => {
                const isExpanded = expandedChapterIds[chapter.id];

                return (
                  <div
                    key={chapter.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3"
                  >
                    {/* Chapter Header */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleChapterExpand(chapter.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => handleUpdateChapterTitle(chapter.id, e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs font-bold bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-emerald-500/60"
                      />

                      <span className="text-[11px] text-slate-500 font-mono">
                        {chapter.lessons.length} bài
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddLesson(chapter.id)}
                        title="Thêm bài học vào chương này"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        title="Xóa chương này"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Lessons inside Chapter */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/60 pl-6">
                        {chapter.lessons.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-1">
                            Chương này chưa có bài học nào. Bấm nút (+) để thêm bài học.
                          </p>
                        ) : (
                          chapter.lessons.map((lesson, lIdx) => {
                            const rawId = extractAbyssId(lesson.videoSource);

                            return (
                              <div
                                key={lesson.id}
                                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-slate-500 text-[10px] w-5">
                                      #{lIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                                      placeholder="Tên bài học..."
                                      className="flex-1 px-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500/60"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2 pl-7">
                                    <Video className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    <input
                                      type="text"
                                      value={lesson.videoSource}
                                      onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'videoSource', e.target.value)}
                                      placeholder="Link Abyss / Iframe (https://abyssplayer.com/ID)..."
                                      className="flex-1 px-2.5 py-1 text-[11px] font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:border-emerald-500/60"
                                    />
                                    {rawId && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono whitespace-nowrap">
                                        ID: {rawId}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 self-end sm:self-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{courseToEdit ? 'Lưu Thay Đổi' : 'Tạo Khóa Học Ngay'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
