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
  ChevronLeft,
  Video,
  Layers,
  Paperclip,
  FolderOpen,
  GripVertical,
  Settings,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  BookMarked
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
  // Course Metadata State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'AI & Machine Learning');
  const [instructor, setInstructor] = useState<string>('');
  const [sourcePlatform, setSourcePlatform] = useState<string>(sources[0] || 'Udemy');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Studio Mode: 'info' (Thông tin) | 'curriculum' (Giáo trình)
  // When creating new course -> 'info' first. When editing existing course -> 'curriculum' first.
  const [studioSection, setStudioSection] = useState<'info' | 'curriculum'>('curriculum');

  // Selected Active Lesson for 2-column workspace
  const [activeSelection, setActiveSelection] = useState<{ chId: string; lessonId: string } | null>(null);

  // Collapse / Expand states
  const [collapsedChapterIds, setCollapsedChapterIds] = useState<Record<string, boolean>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Drag and Drop state (ONLY triggered on the Grip handle)
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
      // Editing existing course -> Default to 'curriculum' tab
      setStudioSection('curriculum');
      setTitle(courseToEdit.title);
      setDescription(courseToEdit.description || '');
      setCategory(courseToEdit.category || categories[0] || 'Chung');
      setInstructor(courseToEdit.instructor || '');
      setSourcePlatform(courseToEdit.sourcePlatform || sources[0] || 'Khác');
      setThumbnailUrl(courseToEdit.thumbnailUrl || '');
      setTagsInput(courseToEdit.tags?.join(', ') || '');
      setChapters(courseToEdit.chapters || []);
      setCollapsedChapterIds({});

      const firstCh = courseToEdit.chapters[0];
      const firstLes = firstCh?.lessons[0];
      if (firstCh && firstLes) {
        setActiveSelection({ chId: firstCh.id, lessonId: firstLes.id });
      } else {
        setActiveSelection(null);
      }
    } else {
      // Creating NEW course -> Default to 'info' tab
      setStudioSection('info');
      setTitle('');
      setDescription('');
      setCategory(categories[0] || 'AI & Machine Learning');
      setInstructor('');
      setSourcePlatform(sources[0] || 'Udemy');
      setThumbnailUrl('');
      setTagsInput('');
      setCollapsedChapterIds({});
      const defaultChId = `ch-${Date.now()}`;
      const defaultLesId = `les-${Date.now()}-1`;
      setChapters([
        {
          id: defaultChId,
          title: 'Chương 1: Khởi động & Nền tảng',
          order: 1,
          lessons: [
            {
              id: defaultLesId,
              title: 'Bài 1: Giới thiệu tổng quan',
              type: 'video',
              videoSource: 'https://abyssplayer.com/Ld3tfGRGA',
              content: '',
              durationMinutes: 15,
              isCompleted: false,
              isStarred: false,
              attachments: [],
            }
          ]
        }
      ]);
      setActiveSelection({ chId: defaultChId, lessonId: defaultLesId });
    }
  }, [courseToEdit, isOpen, categories, sources]);

  if (!isOpen) return null;

  // Active Lesson & Chapter computed
  const activeChapter = chapters.find(ch => ch.id === activeSelection?.chId) || chapters[0];
  const activeLesson = activeChapter?.lessons.find(l => l.id === activeSelection?.lessonId) || activeChapter?.lessons[0] || null;

  // Chapter Collapse Toggle
  const toggleChapterCollapse = (chId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedChapterIds(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  // Chapter CRUD
  const handleAddChapter = () => {
    const newId = `ch-${Date.now()}`;
    const newLesId = `les-${Date.now()}-1`;
    const newChapter: Chapter = {
      id: newId,
      title: `Chương ${chapters.length + 1}: Chủ đề mới`,
      order: chapters.length + 1,
      lessons: [
        {
          id: newLesId,
          title: 'Bài 1: Bài học mới',
          type: 'video',
          videoSource: '',
          content: '',
          durationMinutes: 15,
          attachments: [],
        }
      ],
    };
    setChapters([...chapters, newChapter]);
    setActiveSelection({ chId: newId, lessonId: newLesId });
  };

  const handleUpdateChapterTitle = (chId: string, newTitle: string) => {
    setChapters(chapters.map(ch => ch.id === chId ? { ...ch, title: newTitle } : ch));
  };

  const handleDeleteChapter = (chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa chương này cùng toàn bộ bài học bên trong?')) {
      const remaining = chapters.filter(ch => ch.id !== chId);
      setChapters(remaining);
      const nextCh = remaining[0];
      const nextLes = nextCh?.lessons[0];
      if (nextCh && nextLes) {
        setActiveSelection({ chId: nextCh.id, lessonId: nextLes.id });
      } else {
        setActiveSelection(null);
      }
    }
  };

  // Lesson CRUD
  const handleAddLesson = (chId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newLesId = `les-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newLesson: Lesson = {
      id: newLesId,
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
    // Auto expand chapter if collapsed
    setCollapsedChapterIds(prev => ({ ...prev, [chId]: false }));
    setActiveSelection({ chId, lessonId: newLesId });
  };

  const handleUpdateActiveLesson = (field: keyof Lesson, value: any) => {
    if (!activeSelection) return;
    const { chId, lessonId } = activeSelection;

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

  const handleDeleteLesson = (chId: string, lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetChapter = chapters.find(ch => ch.id === chId);
    if (!targetChapter) return;

    if (targetChapter.lessons.length === 1 && chapters.length === 1) {
      alert('Khóa học phải có ít nhất 1 bài học!');
      return;
    }

    const updatedLessons = targetChapter.lessons.filter(l => l.id !== lessonId);
    const updatedChapters = chapters.map(ch => ch.id === chId ? { ...ch, lessons: updatedLessons } : ch);
    setChapters(updatedChapters);

    // If deleted lesson was active, select another lesson
    if (activeSelection?.lessonId === lessonId) {
      const nextLesson = updatedLessons[0] || updatedChapters[0]?.lessons[0];
      const nextCh = updatedLessons.length > 0 ? targetChapter : updatedChapters[0];
      if (nextCh && nextLesson) {
        setActiveSelection({ chId: nextCh.id, lessonId: nextLesson.id });
      }
    }
  };

  // Drag and drop (Handle Only)
  const handleLessonDragStart = (chIdx: number, lIdx: number, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', `${chIdx}:${lIdx}`);
    setDraggedLessonInfo({ chIdx, lIdx });
  };

  const handleLessonDrop = (targetChIdx: number, targetLIdx: number) => {
    if (!draggedLessonInfo) return;
    const { chIdx: srcChIdx, lIdx: srcLIdx } = draggedLessonInfo;

    if (srcChIdx === targetChIdx) {
      if (srcLIdx !== targetLIdx) {
        const targetChapter = chapters[srcChIdx];
        const updatedLessons = [...targetChapter.lessons];
        const [moved] = updatedLessons.splice(srcLIdx, 1);
        updatedLessons.splice(targetLIdx, 0, moved);

        const updatedChapters = [...chapters];
        updatedChapters[srcChIdx] = { ...targetChapter, lessons: updatedLessons };
        setChapters(updatedChapters);
      }
    } else {
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
        setActiveSelection({ chId: destChapter.id, lessonId: movedLesson.id });
      }
    }
    setDraggedLessonInfo(null);
  };

  // Attachment CRUD for active lesson
  const handleAddAttachment = () => {
    if (!activeLesson) return;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'Tài liệu mới (Slide / Code)',
      url: 'https://drive.google.com',
      type: 'drive',
    };
    handleUpdateActiveLesson('attachments', [...(activeLesson.attachments || []), newAtt]);
  };

  const handleUpdateAttachment = (attId: string, field: keyof Attachment, value: string) => {
    if (!activeLesson) return;
    const updated = (activeLesson.attachments || []).map(a => a.id === attId ? { ...a, [field]: value } : a);
    handleUpdateActiveLesson('attachments', updated);
  };

  const handleDeleteAttachment = (attId: string) => {
    if (!activeLesson) return;
    const updated = (activeLesson.attachments || []).filter(a => a.id !== attId);
    handleUpdateActiveLesson('attachments', updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên khóa học ở mục Thông Tin!');
      setStudioSection('info');
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

  const totalLessonsCount = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar with Tab Switchers & Save */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {title || (courseToEdit ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold">
                  {totalLessonsCount} bài
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Giao diện 2 cột chuyên nghiệp: Mục lục bên trái & Soạn thảo chi tiết bên phải
              </p>
            </div>
          </div>

          {/* Section Mode Navigation (Tối giản tên tab: Giáo Trình & Thông Tin) + Save */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStudioSection('curriculum')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  studioSection === 'curriculum'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Giáo Trình</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioSection('info')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  studioSection === 'info'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Thông Tin</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{courseToEdit ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* SECTION 1: 2-COLUMN CURRICULUM WORKSPACE */}
          {studioSection === 'curriculum' && (
            <div className="flex-1 flex overflow-hidden h-full">
              
              {/* COLUMN 1: Curriculum Tree Sidebar (Collapsible) */}
              <div 
                className={`border-r border-slate-800 bg-slate-950/70 flex flex-col h-full overflow-hidden transition-all duration-300 ${
                  isSidebarCollapsed ? 'w-14 items-center' : 'w-full md:w-80 lg:w-96 flex-shrink-0'
                }`}
              >
                {/* Column 1 Header */}
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between w-full">
                  {!isSidebarCollapsed ? (
                    <>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-teal-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Mục Lục ({chapters.length} chương)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAddChapter}
                          className="px-2.5 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm Chương</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsSidebarCollapsed(true)}
                          title="Thu gọn mục lục"
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <PanelLeftClose className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      title="Mở rộng mục lục"
                      className="p-1.5 mx-auto rounded-lg text-teal-400 hover:text-white hover:bg-slate-800"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Chapters & Lessons Tree List */}
                {!isSidebarCollapsed ? (
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar w-full">
                    {chapters.map((chapter, chIdx) => {
                      const isCollapsed = collapsedChapterIds[chapter.id] === true;

                      return (
                        <div 
                          key={chapter.id}
                          className="border border-slate-800/80 rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm"
                        >
                          {/* Chapter Title Row with Expand/Collapse button */}
                          <div className="p-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-2 group">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => toggleChapterCollapse(chapter.id, e)}
                                className="p-0.5 text-slate-400 hover:text-white flex-shrink-0"
                                title={isCollapsed ? 'Mở rộng chương' : 'Thu gọn chương'}
                              >
                                {isCollapsed ? (
                                  <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </button>

                              <input
                                type="text"
                                value={chapter.title}
                                onChange={(e) => handleUpdateChapterTitle(chapter.id, e.target.value)}
                                placeholder="Tên chương..."
                                className="text-xs font-bold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 px-1 py-0.5 flex-1 focus:outline-none"
                              />

                              <span className="text-[10px] text-slate-500 font-normal">
                                ({chapter.lessons.length})
                              </span>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleAddLesson(chapter.id, e)}
                                title="Thêm bài học vào chương này"
                                className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              {chapters.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                  title="Xóa chương này"
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Lessons in Chapter (Collapsible) */}
                          {!isCollapsed && (
                            <div className="p-1.5 space-y-1">
                              {chapter.lessons.map((lesson, lIdx) => {
                                const isActive = activeSelection?.chId === chapter.id && activeSelection?.lessonId === lesson.id;
                                const lessonType = lesson.type || 'video';

                                return (
                                  <div
                                    key={lesson.id}
                                    onClick={() => setActiveSelection({ chId: chapter.id, lessonId: lesson.id })}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleLessonDrop(chIdx, lIdx)}
                                    className={`group/lesson flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                                      isActive
                                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white font-bold shadow-sm ring-1 ring-emerald-500/20'
                                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                                    }`}
                                  >
                                    {/* Left: Drag Handle ONLY + Type Icon + Title */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                      
                                      {/* DRAG HANDLE: Drag ONLY starts from this icon */}
                                      <div
                                        draggable
                                        onDragStart={(e) => handleLessonDragStart(chIdx, lIdx, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-emerald-400 flex-shrink-0"
                                        title="Kéo thả để sắp xếp vị trí bài học"
                                      >
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </div>

                                      <div className="flex-shrink-0">
                                        {lessonType === 'article' ? (
                                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                                        ) : lessonType === 'mixed' ? (
                                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                                        ) : (
                                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                      </div>

                                      <span className="truncate text-xs">{lesson.title}</span>
                                    </div>

                                    {/* Right: Delete button */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteLesson(chapter.id, lesson.id, e)}
                                      className="opacity-0 group-hover/lesson:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-opacity"
                                      title="Xóa bài này"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Collapsed Icon Bar */
                  <div className="p-2 space-y-3 flex flex-col items-center">
                    {chapters.map((ch, idx) => (
                      <div 
                        key={ch.id}
                        onClick={() => {
                          setIsSidebarCollapsed(false);
                          if (ch.lessons[0]) {
                            setActiveSelection({ chId: ch.id, lessonId: ch.lessons[0].id });
                          }
                        }}
                        title={`${ch.title} (${ch.lessons.length} bài)`}
                        className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-teal-400 hover:border-emerald-500 cursor-pointer shadow-sm"
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: Active Lesson Workspace & Rich Editor (Takes full remaining width) */}
              <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
                
                {/* Expand sidebar hint if collapsed */}
                {isSidebarCollapsed && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <PanelLeftOpen className="w-3.5 h-3.5" />
                      <span>Mở lại Mục Lục Bài Học</span>
                    </button>

                    <span className="text-xs text-slate-500">
                      Chế độ Soạn thảo Mở rộng Toàn màn hình
                    </span>
                  </div>
                )}

                {activeLesson ? (
                  <div className="space-y-6 max-w-4xl mx-auto w-full">
                    
                    {/* Header Row: Title & Format Selector */}
                    <div className="space-y-3 p-5 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        
                        {/* Format Switcher */}
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleUpdateActiveLesson('type', 'video')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              (activeLesson.type || 'video') === 'video'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Video Abyss</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateActiveLesson('type', 'article')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              activeLesson.type === 'article'
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Bài Viết / Bài Đọc</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateActiveLesson('type', 'mixed')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              activeLesson.type === 'mixed'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Cả Video & Bài Viết</span>
                          </button>
                        </div>

                        {/* Estimated time */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Thời lượng:</span>
                          </label>
                          <input
                            type="number"
                            value={activeLesson.durationMinutes || 15}
                            onChange={(e) => handleUpdateActiveLesson('durationMinutes', parseInt(e.target.value) || 0)}
                            className="w-20 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white text-center font-bold"
                          />
                          <span className="text-xs text-slate-500">phút</span>
                        </div>
                      </div>

                      {/* Lesson Title Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Tiêu Đề Bài Giảng <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={activeLesson.title}
                          onChange={(e) => handleUpdateActiveLesson('title', e.target.value)}
                          placeholder="Nhập tiêu đề bài học..."
                          className="w-full px-4 py-2.5 text-sm sm:text-base font-bold bg-slate-900 border border-slate-800 rounded-2xl text-white focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Video Configuration (If video or mixed) */}
                    {(activeLesson.type === 'video' || activeLesson.type === 'mixed' || !activeLesson.type) && (
                      <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-3 shadow-md">
                        <label className="block text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          <span>Nguồn Video Abyss (URL hoặc Iframe embed code)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={activeLesson.videoSource || ''}
                            onChange={(e) => handleUpdateActiveLesson('videoSource', e.target.value)}
                            placeholder="Dán link Abyss: https://abyssplayer.com/ID hoặc mã <iframe...>"
                            className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:border-emerald-500 font-mono text-[11px]"
                          />
                          {activeLesson.videoSource && extractAbyssId(activeLesson.videoSource) && (
                            <span className="text-[10px] font-mono font-bold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                              ID: {extractAbyssId(activeLesson.videoSource)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rich Text Editor for Article / Reading Content */}
                    {(activeLesson.type === 'article' || activeLesson.type === 'mixed') && (
                      <div className="space-y-2">
                        <RichTextEditor
                          value={activeLesson.content || ''}
                          onChange={(val) => handleUpdateActiveLesson('content', val)}
                          placeholder="Soạn thảo nội dung bài học chi tiết tại đây (H1-H3, in đậm, khối code, danh sách, trích dẫn)..."
                          minHeight="260px"
                          label="Soạn Thảo Bài Viết / Hướng Dẫn Chi Tiết"
                        />
                      </div>
                    )}

                    {/* Attachments Section */}
                    <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-slate-200">
                            Tài Liệu Đính Kèm ({activeLesson.attachments?.length || 0})
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddAttachment}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm File/Link</span>
                        </button>
                      </div>

                      {/* Attachments List */}
                      {(!activeLesson.attachments || activeLesson.attachments.length === 0) ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Chưa có tài liệu đính kèm cho bài này. Bấm "Thêm File/Link" để chèn Slide PDF, Google Drive, Repo GitHub hoặc link bài tập.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {activeLesson.attachments.map((att) => (
                            <div 
                              key={att.id}
                              className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800"
                            >
                              <input
                                type="text"
                                value={att.name}
                                onChange={(e) => handleUpdateAttachment(att.id, 'name', e.target.value)}
                                placeholder="Tên tài liệu..."
                                className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 flex-1 min-w-[160px] focus:border-emerald-500"
                              />

                              <input
                                type="url"
                                value={att.url}
                                onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                                placeholder="https://..."
                                className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 font-mono text-[11px] flex-1 min-w-[180px] focus:border-emerald-500"
                              />

                              <select
                                value={att.type || 'link'}
                                onChange={(e) => handleUpdateAttachment(att.id, 'type', e.target.value as any)}
                                className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:border-emerald-500"
                              >
                                <option value="pdf">📄 PDF</option>
                                <option value="drive">📁 Google Drive</option>
                                <option value="github">🐙 GitHub</option>
                                <option value="link">🔗 Link ngoài</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                    <BookMarked className="w-12 h-12 text-slate-600" />
                    <p className="text-sm">Hãy chọn một bài học từ cột mục lục bên trái để bắt đầu soạn thảo.</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* SECTION 2: COURSE GENERAL INFO SETTINGS */}
          {studioSection === 'info' && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 custom-scrollbar">
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 space-y-5 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Thông Tin Cơ Bản Khóa Học</span>
                </h3>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tên Khóa Học <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Làm Chủ Trí Tuệ Nhân Tạo & AI Generative..."
                    className="w-full px-4 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-2xl text-white focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Category & Instructor */}
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

                {/* Source & Tags */}
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
                      className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Thumbnail & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Ảnh Bìa (Thumbnail URL)</label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả Ngắn Khóa Học</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tóm tắt ngắn gọn nội dung và giá trị khóa học..."
                      className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStudioSection('curriculum')}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <span>Tiếp tục Soạn Thảo Giáo Trình ➔</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
