import React, { useState, useEffect, useMemo } from 'react';
import { Course, Chapter, Lesson, Attachment } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  BookOpen, 
  User, 
  Globe, 
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Video,
  Layers,
  Paperclip,
  FolderOpen,
  GripVertical
} from 'lucide-react';
import { extractAbyssId } from '../../lib/abyss';
import { SearchableSelect } from '../common/SearchableSelect';
import { RichTextEditor } from '../common/RichTextEditor';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit: Course | null; // null if creating a new course
  categories: string[];
  sources: string[];
  allCourses?: Course[];
  onSaveCourse: (course: Course) => void;
  onOpenCategoryManager?: () => void;
  onAddCategory?: (cat: string) => void;
  onAddSource?: (source: string) => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  categories,
  sources,
  allCourses = [],
  onSaveCourse,
  onOpenCategoryManager,
  onAddCategory,
  onAddSource,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'AI & Machine Learning');
  const [instructor, setInstructor] = useState<string>('');
  const [sourcePlatform, setSourcePlatform] = useState<string>(sources[0] || 'Udemy');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Expanded chapter & lesson attachment IDs
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({});
  const [expandedAttachmentLessonIds, setExpandedAttachmentLessonIds] = useState<Record<string, boolean>>({});

  // Drag and Drop state
  const [draggedChapterIdx, setDraggedChapterIdx] = useState<number | null>(null);
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ chIdx: number; lIdx: number } | null>(null);

  // Auto-collect unique instructors across existing courses
  const existingInstructors = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach(c => {
      if (c.instructor && c.instructor.trim()) {
        set.add(c.instructor.trim());
      }
    });
    if (set.size === 0) {
      ['Hoàng Minh', 'Alex Đặng', 'Nguyễn Tiến Dũng', 'VietJack', 'F8 Official'].forEach(i => set.add(i));
    }
    return Array.from(set);
  }, [allCourses]);

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
      const defaultChId = `ch-${Date.now()}`;
      setChapters([
        {
          id: defaultChId,
          title: 'Chương 1: Khởi động & Nền tảng',
          order: 1,
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: 'Bài 1: Giới thiệu tổng quan',
              type: 'video',
              videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
              durationMinutes: 15,
              isCompleted: false,
              isStarred: false,
              attachments: [],
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

  const toggleAttachmentExpand = (lessonId: string) => {
    setExpandedAttachmentLessonIds(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Chapter CRUD & Reorder
  const handleAddChapter = () => {
    const newId = `ch-${Date.now()}`;
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

  const moveChapter = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= chapters.length) return;
    const updated = [...chapters];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setChapters(updated);
  };

  // Lesson CRUD & Reorder
  const handleAddLesson = (chId: string) => {
    const newLesson: Lesson = {
      id: `les-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `Bài học mới`,
      type: 'video',
      videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
      content: '',
      durationMinutes: 20,
      isCompleted: false,
      isStarred: false,
      attachments: [],
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

  const moveLesson = (chIdx: number, fromLIdx: number, toLIdx: number) => {
    const targetChapter = chapters[chIdx];
    if (!targetChapter || toLIdx < 0 || toLIdx >= targetChapter.lessons.length) return;

    const updatedLessons = [...targetChapter.lessons];
    const [moved] = updatedLessons.splice(fromLIdx, 1);
    updatedLessons.splice(toLIdx, 0, moved);

    const updatedChapters = [...chapters];
    updatedChapters[chIdx] = { ...targetChapter, lessons: updatedLessons };
    setChapters(updatedChapters);
  };

  // Drag and drop handlers for Chapters
  const handleChapterDragStart = (idx: number) => {
    setDraggedChapterIdx(idx);
  };

  const handleChapterDrop = (targetIdx: number) => {
    if (draggedChapterIdx !== null && draggedChapterIdx !== targetIdx) {
      moveChapter(draggedChapterIdx, targetIdx);
    }
    setDraggedChapterIdx(null);
  };

  // Drag and drop handlers for Lessons
  const handleLessonDragStart = (chIdx: number, lIdx: number) => {
    setDraggedLessonInfo({ chIdx, lIdx });
  };

  const handleLessonDrop = (targetChIdx: number, targetLIdx: number) => {
    if (!draggedLessonInfo) return;
    const { chIdx: srcChIdx, lIdx: srcLIdx } = draggedLessonInfo;

    if (srcChIdx === targetChIdx) {
      if (srcLIdx !== targetLIdx) {
        moveLesson(srcChIdx, srcLIdx, targetLIdx);
      }
    } else {
      // Move lesson between different chapters
      const srcChapter = chapters[srcChIdx];
      const destChapter = chapters[targetChIdx];
      if (srcChapter && destChapter) {
        const srcLessons = [...srcChapter.lessons];
        const [movedLesson] = srcLessons.splice(srcLIdx, 1);

        const destLessons = [...destChapter.lessons];
        destLessons.splice(targetLIdx, 0, movedLesson);

        const updatedChapters = [...chapters];
        updatedChapters[srcChIdx] = { ...srcChapter, lessons: srcLessons };
        updatedChapters[targetChIdx] = { ...destChapter, lessons: destLessons };
        setChapters(updatedChapters);
      }
    }
    setDraggedLessonInfo(null);
  };

  // Attachment CRUD
  const handleAddAttachment = (chId: string, lessonId: string) => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'Tài liệu mới (Slide / Code)',
      url: 'https://drive.google.com',
      type: 'drive',
    };

    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return {
                ...l,
                attachments: [...(l.attachments || []), newAtt]
              };
            }
            return l;
          })
        };
      }
      return ch;
    }));
    setExpandedAttachmentLessonIds(prev => ({ ...prev, [lessonId]: true }));
  };

  const handleUpdateAttachment = (
    chId: string, 
    lessonId: string, 
    attId: string, 
    field: keyof Attachment, 
    value: string
  ) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return {
                ...l,
                attachments: (l.attachments || []).map(a => a.id === attId ? { ...a, [field]: value } : a)
              };
            }
            return l;
          })
        };
      }
      return ch;
    }));
  };

  const handleDeleteAttachment = (chId: string, lessonId: string, attId: string) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return {
                ...l,
                attachments: (l.attachments || []).filter(a => a.id !== attId)
              };
            }
            return l;
          })
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
      id: courseToEdit ? courseToEdit.id : `course-${Date.now()}`,
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
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                {courseToEdit ? 'Chỉnh Sửa Khóa Học & Giáo Trình' : 'Tạo Khóa Học Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Sắp xếp kéo thả bài học, soạn thảo bài viết Rich Text & quản lý tài liệu đính kèm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Section 1: Basic Info with Searchable Comboboxes */}
          <div className="space-y-4 p-5 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Thông Tin Cơ Bản</span>
            </h3>

            {/* Course Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tên Khóa Học <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Làm Chủ Trí Tuệ Nhân Tạo & AI Generative..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500/80"
                required
              />
            </div>

            {/* Row 1: Category & Instructor Searchable Comboboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableSelect
                label="Danh Mục / Chủ Đề"
                value={category}
                onChange={setCategory}
                options={categories}
                placeholder="Tìm hoặc gõ danh mục mới..."
                allowCustom={true}
                onAddNewOption={(newCat) => onAddCategory && onAddCategory(newCat)}
                required={true}
              />

              <SearchableSelect
                label="Tác Giả / Giảng Viên"
                icon={<User className="w-3.5 h-3.5 text-emerald-400" />}
                value={instructor}
                onChange={setInstructor}
                options={existingInstructors}
                placeholder="Chọn hoặc gõ tên tác giả mới..."
                allowCustom={true}
              />
            </div>

            {/* Row 2: Source Platform Searchable & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SearchableSelect
                label="Nguồn Mua / Nền Tảng"
                icon={<Globe className="w-3.5 h-3.5 text-teal-400" />}
                value={sourcePlatform}
                onChange={setSourcePlatform}
                options={sources}
                placeholder="Tìm hoặc gõ nguồn mới..."
                allowCustom={true}
                onAddNewOption={(newSrc) => onAddSource && onAddSource(newSrc)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Thẻ Tags (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="AI, Lập trình, NextJS, ChatGPT..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500/80"
                />
              </div>
            </div>

            {/* Row 3: Thumbnail & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ảnh Bìa (Thumbnail URL)</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500/80"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả Ngắn</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn nội dung và giá trị khóa học..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:border-emerald-500/80"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Curriculum Reordering & Multi-Format Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-teal-400" />
                  <span>Giáo Trình & Bài Học ({chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} bài)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  💡 Giữ và kéo biểu tượng <strong>⠿</strong> để sắp xếp lại thứ tự chương và bài học
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChapter}
                className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Chương Mới</span>
              </button>
            </div>

            {/* Chapters List (Reorderable) */}
            <div className="space-y-4">
              {chapters.map((chapter, chIdx) => {
                const isExpanded = expandedChapterIds[chapter.id] !== false;

                return (
                  <div 
                    key={chapter.id}
                    draggable
                    onDragStart={() => handleChapterDragStart(chIdx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleChapterDrop(chIdx)}
                    className={`border rounded-3xl bg-slate-950/60 overflow-hidden shadow-md transition-all ${
                      draggedChapterIdx === chIdx ? 'opacity-40 border-dashed border-teal-500' : 'border-slate-800'
                    }`}
                  >
                    {/* Chapter Header with Drag Handle */}
                    <div className="p-3.5 bg-slate-900/90 flex items-center justify-between gap-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        
                        {/* Chapter Drag Handle */}
                        <div 
                          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-200"
                          title="Kéo để đổi thứ tự chương"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleChapterExpand(chapter.id)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => handleUpdateChapterTitle(chapter.id, e.target.value)}
                          placeholder={`Chương ${chIdx + 1}: Tiêu đề chương...`}
                          className="font-bold text-xs sm:text-sm text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 px-1 py-0.5 flex-1 focus:outline-none"
                        />
                      </div>

                      {/* Chapter Reorder Buttons & Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800 mr-1">
                          {chapter.lessons.length} bài
                        </span>

                        {/* Move Up / Down Chapter */}
                        <button
                          type="button"
                          disabled={chIdx === 0}
                          onClick={() => moveChapter(chIdx, chIdx - 1)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                          title="Di chuyển chương lên trên"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={chIdx === chapters.length - 1}
                          onClick={() => moveChapter(chIdx, chIdx + 1)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                          title="Di chuyển chương xuống dưới"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                        <button
                          type="button"
                          onClick={() => handleAddLesson(chapter.id)}
                          title="Thêm bài học mới vào chương này"
                          className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chapter.id)}
                            title="Xóa chương này"
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chapter Lessons List (Reorderable) */}
                    {isExpanded && (
                      <div className="p-4 space-y-3.5">
                        {chapter.lessons.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-500">
                            Chưa có bài học nào trong chương này.{' '}
                            <button
                              type="button"
                              onClick={() => handleAddLesson(chapter.id)}
                              className="text-emerald-400 underline font-bold"
                            >
                              + Thêm bài đầu tiên
                            </button>
                          </div>
                        ) : (
                          chapter.lessons.map((lesson, lIdx) => {
                            const lessonType = lesson.type || 'video';
                            const abyssId = lesson.videoSource ? extractAbyssId(lesson.videoSource) : null;
                            const isAttExpanded = expandedAttachmentLessonIds[lesson.id] === true;
                            const attCount = lesson.attachments?.length || 0;
                            const isBeingDragged = draggedLessonInfo?.chIdx === chIdx && draggedLessonInfo?.lIdx === lIdx;

                            return (
                              <div
                                key={lesson.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleLessonDragStart(chIdx, lIdx);
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  handleLessonDrop(chIdx, lIdx);
                                }}
                                className={`p-4 rounded-2xl bg-slate-900/90 border space-y-3.5 shadow-sm transition-all ${
                                  isBeingDragged
                                    ? 'opacity-40 border-dashed border-emerald-500 bg-slate-950'
                                    : 'border-slate-800/90 hover:border-slate-700'
                                }`}
                              >
                                {/* Lesson Top Row: Drag Handle + Title + Format Switcher + Order Arrows + Delete */}
                                <div className="flex flex-wrap items-center justify-between gap-2.5">
                                  
                                  {/* Left: Drag Handle + Index + Lesson Title */}
                                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                                    <div 
                                      className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-emerald-400"
                                      title="Kéo để đổi thứ tự bài học"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>

                                    <span className="text-[11px] font-mono text-slate-500 font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                                      #{lIdx + 1}
                                    </span>

                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                                      placeholder={`Bài ${lIdx + 1}: Tên bài giảng...`}
                                      className="text-xs sm:text-sm font-bold text-white bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 flex-1 focus:border-emerald-500/80"
                                      required
                                    />
                                  </div>

                                  {/* Middle: Lesson Format Switcher */}
                                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLesson(chapter.id, lesson.id, 'type', 'video')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                        lessonType === 'video'
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                      title="Bài học video Abyss"
                                    >
                                      <Video className="w-3 h-3" />
                                      <span>Video</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLesson(chapter.id, lesson.id, 'type', 'article')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                        lessonType === 'article'
                                          ? 'bg-teal-600 text-white shadow-sm'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                      title="Bài đọc / Bài viết lý thuyết Markdown"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Bài Viết</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLesson(chapter.id, lesson.id, 'type', 'mixed')}
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                        lessonType === 'mixed'
                                          ? 'bg-amber-600 text-white shadow-sm'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                      title="Bao gồm cả Video và Bài viết Markdown"
                                    >
                                      <Layers className="w-3 h-3" />
                                      <span>Cả Hai</span>
                                    </button>
                                  </div>

                                  {/* Right: Quick Move Up/Down + Delete */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={lIdx === 0}
                                      onClick={() => moveLesson(chIdx, lIdx, lIdx - 1)}
                                      className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                      title="Di chuyển bài lên"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={lIdx === chapter.lessons.length - 1}
                                      onClick={() => moveLesson(chIdx, lIdx, lIdx + 1)}
                                      className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                                      title="Di chuyển bài xuống"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                      title="Xóa bài học này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Video Link Input (If video or mixed) */}
                                {(lessonType === 'video' || lessonType === 'mixed') && (
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                                      <input
                                        type="text"
                                        value={lesson.videoSource || ''}
                                        onChange={(e) => handleUpdateLesson(chapter.id, lesson.id, 'videoSource', e.target.value)}
                                        placeholder="Dán link Abyss (https://abyssplayer.com/ID) hoặc mã <iframe...>"
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500/80 font-mono"
                                      />
                                    </div>
                                    {abyssId && (
                                      <span className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                                        ID: {abyssId}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Article Content Rich Text Editor Toolbar (If article or mixed) */}
                                {(lessonType === 'article' || lessonType === 'mixed') && (
                                  <div className="space-y-1.5 pt-1">
                                    <RichTextEditor
                                      value={lesson.content || ''}
                                      onChange={(val) => handleUpdateLesson(chapter.id, lesson.id, 'content', val)}
                                      placeholder="Soạn thảo nội dung bài học chi tiết tại đây (H1, in đậm, danh sách, khối code, trích dẫn)..."
                                      minHeight="180px"
                                      label="Soạn Thảo Bài Viết / Tài Liệu"
                                    />
                                  </div>
                                )}

                                {/* Attachments Manager Accordion */}
                                <div className="border-t border-slate-800/80 pt-2.5">
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => toggleAttachmentExpand(lesson.id)}
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-0.5"
                                    >
                                      <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Tài Liệu Đính Kèm ({attCount})</span>
                                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAttExpanded ? 'rotate-180 text-emerald-400' : ''}`} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAddAttachment(chapter.id, lesson.id)}
                                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>+ Thêm File/Link</span>
                                    </button>
                                  </div>

                                  {/* Attachments List */}
                                  {isAttExpanded && (
                                    <div className="mt-2.5 space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                                      {attCount === 0 ? (
                                        <p className="text-[11px] text-slate-500 italic py-1">
                                          Chưa có tài liệu đính kèm nào. Bấm "+ Thêm File/Link" để chèn Slide, Drive, GitHub hoặc tài liệu đọc.
                                        </p>
                                      ) : (
                                        lesson.attachments?.map((att) => (
                                          <div key={att.id} className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                                            {/* Attachment Name */}
                                            <input
                                              type="text"
                                              value={att.name}
                                              onChange={(e) => handleUpdateAttachment(chapter.id, lesson.id, att.id, 'name', e.target.value)}
                                              placeholder="Tên tài liệu (Ví dụ: Slide PDF, Kho Prompt...)"
                                              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 flex-1 min-w-[140px] focus:border-emerald-500"
                                            />

                                            {/* Attachment URL */}
                                            <input
                                              type="url"
                                              value={att.url}
                                              onChange={(e) => handleUpdateAttachment(chapter.id, lesson.id, att.id, 'url', e.target.value)}
                                              placeholder="https://drive.google.com/..."
                                              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 font-mono text-[11px] flex-1 min-w-[160px] focus:border-emerald-500"
                                            />

                                            {/* Type Selector */}
                                            <select
                                              value={att.type || 'link'}
                                              onChange={(e) => handleUpdateAttachment(chapter.id, lesson.id, att.id, 'type', e.target.value as any)}
                                              className="text-[11px] bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:border-emerald-500"
                                            >
                                              <option value="pdf">📄 PDF</option>
                                              <option value="drive">📁 Drive</option>
                                              <option value="github">🐙 GitHub</option>
                                              <option value="link">🔗 Link</option>
                                            </select>

                                            {/* Delete Attachment */}
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteAttachment(chapter.id, lesson.id, att.id)}
                                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                                              title="Xóa tài liệu này"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
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

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
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
