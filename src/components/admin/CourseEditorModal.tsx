import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Video,
  Layers,
  Paperclip,
  FolderOpen,
  GripVertical,
  Settings,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  BookMarked,
  AlertTriangle,
  Check,
  Zap,
  HardDrive,
  RefreshCw,
  Radio,
  AlertCircle
} from 'lucide-react';
import { extractAbyssId, normalizeLessonVideoSources, parseUniversalVideo } from '../../lib/abyss';
import { SearchableSelect } from '../common/SearchableSelect';
import { RichTextEditor } from '../common/RichTextEditor';
import { TeraBoxImportModal } from './TeraBoxImportModal';
import { normalizeDurationMinutes } from '../../lib/storage';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit: Course | null; // null if creating a new course
  categories: string[];
  sources: string[];
  instructors?: string[];
  allCourses?: Course[];
  onSaveCourse: (course: Course) => void;
  onOpenCategoryManager?: () => void;
  onAddCategory?: (cat: string) => void;
  onAddSource?: (source: string) => void;
  onAddInstructor?: (inst: string) => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  categories,
  sources,
  instructors = [],
  allCourses = [],
  onSaveCourse,
  onOpenCategoryManager,
  onAddCategory,
  onAddSource,
  onAddInstructor,
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

  // Initial Snapshot for Unsaved Changes tracking
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');

  // Save state for button feedback
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Studio Mode: 'info' (Thông tin) | 'curriculum' (Giáo trình)
  const [studioSection, setStudioSection] = useState<'info' | 'curriculum'>('curriculum');

  // Selected Active Lesson for 2-column workspace
  const [activeSelection, setActiveSelection] = useState<{ chId: string; lessonId: string } | null>(null);

  // Collapse / Expand states
  const [collapsedChapterIds, setCollapsedChapterIds] = useState<Record<string, boolean>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Drag and Drop state & ref (ONLY triggered on the Grip handle / Chapter header)
  const [draggedLessonInfo, setDraggedLessonInfo] = useState<{ chIdx: number; lIdx: number } | null>(null);
  const [draggedChapterIdx, setDraggedChapterIdx] = useState<number | null>(null);
  const draggedChapterIdxRef = useRef<number | null>(null);

  // Modal alert confirmation for unsaved changes & TeraBox Embed Modal
  const [showUnsavedConfirmModal, setShowUnsavedConfirmModal] = useState<boolean>(false);
  const [isTeraBoxModalOpen, setIsTeraBoxModalOpen] = useState<boolean>(false);
  const [activeEditingCourseId, setActiveEditingCourseId] = useState<string | null>(null);

  const handleImportBulkLessonsToChapter = (targetChapterId: string, newLessons: Lesson[]) => {
    setChapters(prev => {
      return prev.map(ch => {
        if (ch.id === targetChapterId) {
          return {
            ...ch,
            lessons: [...ch.lessons, ...newLessons],
          };
        }
        return ch;
      });
    });

    if (newLessons.length > 0) {
      setActiveSelection({ chId: targetChapterId, lessonId: newLessons[0].id });
    }
  };

  // Refs to guarantee initialization only runs once when modal opens
  const prevIsOpenRef = useRef<boolean>(false);
  const prevCourseIdRef = useRef<string | null>(null);

  // Auto-collect unique instructors across global list and existing courses
  const existingInstructors = useMemo(() => {
    const set = new Set<string>();
    instructors.forEach(i => {
      if (i && i.trim()) set.add(i.trim());
    });
    allCourses.forEach(c => {
      if (c.instructor && c.instructor.trim()) {
        set.add(c.instructor.trim());
      }
    });
    if (set.size === 0) {
      ['Andrew Ng & Hoàng Minh', 'Alex Đặng', 'Sarah Jenkins', 'VietJack', 'F8 Official'].forEach(i => set.add(i));
    }
    return Array.from(set);
  }, [allCourses, instructors]);

  useEffect(() => {
    // Only re-initialize when modal transitions from closed -> open, or editing a different course ID
    const currentCourseId = courseToEdit ? courseToEdit.id : '__new__';
    const isOpeningNow = isOpen && (!prevIsOpenRef.current || prevCourseIdRef.current !== currentCourseId);

    if (isOpeningNow) {
      prevIsOpenRef.current = true;
      prevCourseIdRef.current = currentCourseId;
      setShowUnsavedConfirmModal(false);
      setIsSavedRecently(false);
      setActiveEditingCourseId(courseToEdit ? courseToEdit.id : null);

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
        
        // Deep copy chapters with auto-healing for any inverted titles and video sources
        const clonedChapters: Chapter[] = (courseToEdit.chapters || []).map(ch => ({
          ...ch,
          lessons: (ch.lessons || []).map(les => {
            let finalTitle = les.title;
            let finalSource = les.videoSource;
            if (
              (finalTitle?.startsWith('<iframe') || finalTitle?.startsWith('http://') || finalTitle?.startsWith('https://')) &&
              finalSource && !finalSource.startsWith('<iframe') && !finalSource.startsWith('http://') && !finalSource.startsWith('https://')
            ) {
              const actualSource = finalTitle;
              let actualTitle = finalSource.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
              const prefixMatch = actualTitle.match(/^(?:Bài|Lesson|Chuong|Chương)?\s*(\d+)[\.\s:_-]+(.+)/i);
              if (prefixMatch) {
                actualTitle = `Bài ${prefixMatch[1]}: ${prefixMatch[2].trim()}`;
              }
              finalTitle = actualTitle;
              finalSource = actualSource;
            }
            const { primary, mirror } = normalizeLessonVideoSources(finalSource, les.mirrorVideoSource);

            return {
              ...les,
              title: finalTitle,
              videoSource: primary,
              mirrorVideoSource: mirror
            };
          })
        }));
        setChapters(clonedChapters);
        setCollapsedChapterIds({});

        const firstCh = clonedChapters[0];
        const firstLes = firstCh?.lessons[0];
        if (firstCh && firstLes) {
          setActiveSelection({ chId: firstCh.id, lessonId: firstLes.id });
        } else {
          setActiveSelection(null);
        }

        // Save initial snapshot for dirty comparison
        setInitialSnapshot(JSON.stringify({
          title: courseToEdit.title,
          description: courseToEdit.description || '',
          category: courseToEdit.category || categories[0] || 'Chung',
          instructor: courseToEdit.instructor || '',
          sourcePlatform: courseToEdit.sourcePlatform || sources[0] || 'Khác',
          thumbnailUrl: courseToEdit.thumbnailUrl || '',
          tagsInput: courseToEdit.tags?.join(', ') || '',
          chapters: clonedChapters
        }));
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
        const initChapters: Chapter[] = [
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
        ];
        setChapters(initChapters);
        setActiveSelection({ chId: defaultChId, lessonId: defaultLesId });

        // Save initial snapshot for new course
        setInitialSnapshot(JSON.stringify({
          title: '',
          description: '',
          category: categories[0] || 'AI & Machine Learning',
          instructor: '',
          sourcePlatform: sources[0] || 'Udemy',
          thumbnailUrl: '',
          tagsInput: '',
          chapters: initChapters
        }));
      }
    }

    if (!isOpen) {
      prevIsOpenRef.current = false;
      prevCourseIdRef.current = null;
    }
  }, [isOpen, courseToEdit]);

  // Compute if form has unsaved modifications
  const currentSnapshot = useMemo(() => {
    return JSON.stringify({
      title,
      description,
      category,
      instructor,
      sourcePlatform,
      thumbnailUrl,
      tagsInput,
      chapters
    });
  }, [title, description, category, instructor, sourcePlatform, thumbnailUrl, tagsInput, chapters]);

  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    return currentSnapshot !== initialSnapshot;
  }, [currentSnapshot, initialSnapshot]);

  // Prevent accidental tab reload / page close with beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpen && isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có các thay đổi chưa được lưu trong khóa học. Bạn có chắc chắn muốn rời đi?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, isDirty]);

  // Direct Save function (Always stays in workspace)
  const handleSaveCourse = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên khóa học ở mục Thông Tin!');
      setStudioSection('info');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const finalId = activeEditingCourseId || (courseToEdit ? courseToEdit.id : `course-${Date.now()}`);
    setActiveEditingCourseId(finalId);

    const normalizedChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(les => {
        const { primary, mirror } = normalizeLessonVideoSources(les.videoSource, les.mirrorVideoSource);
        return {
          ...les,
          videoSource: primary || undefined,
          mirrorVideoSource: mirror || undefined,
        };
      })
    }));

    const savedCourse: Course = {
      id: finalId,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Chung',
      instructor: instructor.trim() || undefined,
      sourcePlatform: sourcePlatform || 'Khác',
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      tags,
      chapters: normalizedChapters,
      createdAt: courseToEdit ? courseToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to parent and storage
    onSaveCourse(savedCourse);

    // Update snapshot so isDirty becomes false
    setInitialSnapshot(JSON.stringify({
      title: savedCourse.title,
      description: savedCourse.description || '',
      category: savedCourse.category || 'Chung',
      instructor: savedCourse.instructor || '',
      sourcePlatform: savedCourse.sourcePlatform || 'Khác',
      thumbnailUrl: savedCourse.thumbnailUrl || '',
      tagsInput: tags.join(', '),
      chapters: savedCourse.chapters
    }));

    // Show button save confirmation feedback
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCourse();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, title, description, category, instructor, sourcePlatform, thumbnailUrl, tagsInput, chapters]);

  if (!isOpen) return null;

  // Safe Close Handler: Warns if there are unsaved changes
  const handleSafeClose = () => {
    if (isDirty) {
      setShowUnsavedConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleForceClose = () => {
    setShowUnsavedConfirmModal(false);
    onClose();
  };

  // Active Lesson & Chapter computed safely
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
    setChapters(prev => [...prev, newChapter]);
    setActiveSelection({ chId: newId, lessonId: newLesId });
  };

  const handleUpdateChapterTitle = (chId: string, newTitle: string) => {
    setChapters(prev => prev.map(ch => ch.id === chId ? { ...ch, title: newTitle } : ch));
  };

  const handleDeleteChapter = (chId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa chương này cùng toàn bộ bài học bên trong?')) {
      setChapters(prev => {
        const remaining = prev.filter(ch => ch.id !== chId);
        const nextCh = remaining[0];
        const nextLes = nextCh?.lessons[0];
        if (nextCh && nextLes) {
          setActiveSelection({ chId: nextCh.id, lessonId: nextLes.id });
        } else {
          setActiveSelection(null);
        }
        return remaining;
      });
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

    setChapters(prev => prev.map(ch => {
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

    setChapters(prev => prev.map(ch => {
      if (ch.id === chId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
        };
      }
      return ch;
    }));
  };

  // Tự động hoán đổi và chuẩn hóa nguồn video (Luôn ưu tiên Streamtape làm chính, Abyss làm dự phòng)
  const handleNormalizeActiveLessonSources = () => {
    if (!activeSelection) return;
    const { chId, lessonId } = activeSelection;
    setChapters(prev => prev.map(ch => {
      if (ch.id !== chId) return ch;
      return {
        ...ch,
        lessons: ch.lessons.map(l => {
          if (l.id !== lessonId) return l;
          const { primary, mirror } = normalizeLessonVideoSources(l.videoSource, l.mirrorVideoSource);
          return {
            ...l,
            videoSource: primary || undefined,
            mirrorVideoSource: mirror || undefined,
          };
        })
      };
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

    setChapters(prev => {
      const updatedChapters = prev.map(ch => {
        if (ch.id === chId) {
          return { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) };
        }
        return ch;
      });

      // If deleted lesson was active, select another lesson
      if (activeSelection?.lessonId === lessonId) {
        const nextChapter = updatedChapters.find(ch => ch.id === chId) || updatedChapters[0];
        const nextLesson = nextChapter?.lessons[0];
        if (nextChapter && nextLesson) {
          setActiveSelection({ chId: nextChapter.id, lessonId: nextLesson.id });
        }
      }
      return updatedChapters;
    });
  };

  // Drag and drop for Chapters
  const handleChapterDragStart = (chIdx: number, e: React.DragEvent) => {
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `chapter:${chIdx}`);
    } catch {}
    draggedChapterIdxRef.current = chIdx;
    setDraggedChapterIdx(chIdx);
  };

  const handleChapterDrop = (targetChIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const srcIdx = draggedChapterIdxRef.current !== null ? draggedChapterIdxRef.current : draggedChapterIdx;
    
    if (srcIdx === null || srcIdx === targetChIdx) {
      draggedChapterIdxRef.current = null;
      setDraggedChapterIdx(null);
      return;
    }

    setChapters(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(srcIdx, 1);
      updated.splice(targetChIdx, 0, moved);
      return updated.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    });

    draggedChapterIdxRef.current = null;
    setDraggedChapterIdx(null);
  };

  // Drag and drop for Lessons (Handle Only)
  const handleLessonDragStart = (chIdx: number, lIdx: number, e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', `${chIdx}:${lIdx}`);
    setDraggedLessonInfo({ chIdx, lIdx });
  };

  const handleLessonDrop = (targetChIdx: number, targetLIdx: number) => {
    if (!draggedLessonInfo) return;
    const { chIdx: srcChIdx, lIdx: srcLIdx } = draggedLessonInfo;

    setChapters(prev => {
      if (srcChIdx === targetChIdx) {
        if (srcLIdx !== targetLIdx) {
          const targetChapter = prev[srcChIdx];
          const updatedLessons = [...targetChapter.lessons];
          const [moved] = updatedLessons.splice(srcLIdx, 1);
          updatedLessons.splice(targetLIdx, 0, moved);

          const updatedChapters = [...prev];
          updatedChapters[srcChIdx] = { ...targetChapter, lessons: updatedLessons };
          return updatedChapters;
        }
        return prev;
      } else {
        const srcChapter = prev[srcChIdx];
        const destChapter = prev[targetChIdx];
        if (srcChapter && destChapter) {
          const srcLessons = [...srcChapter.lessons];
          const [movedLesson] = srcLessons.splice(srcLIdx, 1);

          const destLessons = [...destChapter.lessons];
          destLessons.splice(targetLIdx, 0, movedLesson);

          const updatedChapters = [...prev];
          updatedChapters[srcChIdx] = { ...srcChapter, lessons: srcLessons };
          updatedChapters[targetChIdx] = { ...destChapter, lessons: destLessons };
          setActiveSelection({ chId: destChapter.id, lessonId: movedLesson.id });
          return updatedChapters;
        }
        return prev;
      }
    });

    setDraggedLessonInfo(null);
  };

  // Attachment CRUD for active lesson
  const handleAddAttachment = () => {
    if (!activeLesson) return;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'Tài liệu học tập (PDF)',
      url: '',
      type: 'pdf', // Mặc định tất cả đều là PDF
    };
    handleUpdateActiveLesson('attachments', [...(activeLesson.attachments || []), newAtt]);
  };

  const handleUpdateAttachment = (attId: string, field: keyof Attachment, value: string) => {
    if (!activeLesson) return;
    const updated = (activeLesson.attachments || []).map(a => {
      if (a.id === attId) {
        const next = { ...a, [field]: value };
        if (field === 'url') {
          const u = value.toLowerCase();
          if (u.includes('terabox') || u.includes('1024tera') || u.includes('terasharelink') || u.includes('mirrobox') || u.includes('nephobox')) {
            next.type = 'terabox';
          }
        }
        return next;
      }
      return a;
    });
    handleUpdateActiveLesson('attachments', updated);
  };

  const handleDeleteAttachment = (attId: string) => {
    if (!activeLesson) return;
    const updated = (activeLesson.attachments || []).filter(a => a.id !== attId);
    handleUpdateActiveLesson('attachments', updated);
  };

  const totalLessonsCount = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-7xl bg-[#0a0f24]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.12)] overflow-hidden flex flex-col h-[92vh]">
        {/* Top Glowing Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />
        
        {/* Studio Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/15 flex items-center justify-between bg-[#060813]/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight truncate max-w-md font-mono">
                  {title || (courseToEdit ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#060813] text-cyan-300 font-mono font-bold border border-cyan-500/30 flex-shrink-0">
                  {totalLessonsCount} bài
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">
                Mục lục bên trái & Soạn thảo chi tiết bài giảng bên phải
              </p>
            </div>
          </div>

          {/* Section Navigation & Safe Close Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center bg-[#060813] p-1 rounded-2xl border border-cyan-500/20 font-mono">
              <button
                type="button"
                onClick={() => setStudioSection('curriculum')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  studioSection === 'curriculum'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Giáo Trình</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioSection('info')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  studioSection === 'info'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white border-transparent'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Thông Tin</span>
              </button>
            </div>

            {/* Safe Close Button */}
            <button
              type="button"
              onClick={handleSafeClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-[#060813] transition-colors"
              title="Đóng cửa sổ soạn thảo"
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
                <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2.5 w-full flex-shrink-0">
                  {!isSidebarCollapsed ? (
                    <>
                      {/* Row 1: Title & Collapse Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FolderOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider truncate">
                            Mục Lục Khóa Học
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                            {chapters.length} chương • {totalLessonsCount} bài
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSidebarCollapsed(true)}
                          title="Thu gọn mục lục"
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                        >
                          <PanelLeftClose className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Row 2: Action Buttons (Nạp TeraBox & Thêm Chương) */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTeraBoxModalOpen(true)}
                          title="Bắn / Đẩy video tự động từ kho TeraBox sang Streamtape & Abyss"
                          className="py-2 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] group"
                        >
                          <HardDrive className="w-3.5 h-3.5 text-cyan-400 group-hover:text-slate-950 transition-colors" />
                          <span>Nạp TeraBox</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddChapter}
                          title="Thêm một chương bài giảng mới"
                          className="py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] group"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
                          <span>Thêm Chương</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(false)}
                      title="Mở rộng mục lục"
                      className="p-1.5 mx-auto rounded-lg text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            if (draggedChapterIdxRef.current !== null || draggedChapterIdx !== null) {
                              handleChapterDrop(chIdx, e);
                            }
                          }}
                          className={`border rounded-2xl bg-slate-900/60 overflow-hidden shadow-sm transition-all ${
                            draggedChapterIdx === chIdx ? 'opacity-40 border-emerald-500 border-dashed' : 'border-slate-800/80'
                          }`}
                        >
                          {/* Chapter Title Row with Drag handle & Expand/Collapse button */}
                          <div 
                            draggable
                            onDragStart={(e) => handleChapterDragStart(chIdx, e)}
                            onDragEnd={() => {
                              draggedChapterIdxRef.current = null;
                              setDraggedChapterIdx(null);
                            }}
                            className="p-2.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between gap-2 group cursor-grab active:cursor-grabbing hover:bg-slate-850/80 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              
                              {/* CHAPTER DRAG HANDLE ICON */}
                              <div
                                className="p-0.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0"
                                title="Nắm kéo để sắp xếp vị trí chương"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>

                              <button
                                type="button"
                                draggable={false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChapterCollapse(chapter.id, e);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
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
                                draggable={false}
                                value={chapter.title}
                                onChange={(e) => handleUpdateChapterTitle(chapter.id, e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                placeholder="Tên chương..."
                                className="text-xs font-bold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 px-1 py-0.5 flex-1 focus:outline-none cursor-text"
                              />

                              <span className="text-[10px] text-slate-500 font-normal select-none">
                                ({chapter.lessons.length})
                              </span>
                            </div>

                            <div 
                              className="flex items-center gap-1 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                draggable={false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddLesson(chapter.id, e);
                                }}
                                title="Thêm bài học vào chương này"
                                className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>

                              {chapters.length > 1 && (
                                <button
                                  type="button"
                                  draggable={false}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChapter(chapter.id, e);
                                  }}
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

                                      <span className="truncate text-xs flex-1">{lesson.title}</span>

                                      {/* Visual Stream Status Indicators (2 Luồng, 1 Luồng, 0 Luồng) */}
                                      {(() => {
                                        const hasPrimary = Boolean(lesson.videoSource && lesson.videoSource.trim());
                                        const hasMirror = Boolean(lesson.mirrorVideoSource && lesson.mirrorVideoSource.trim());
                                        const streamCount = (hasPrimary ? 1 : 0) + (hasMirror ? 1 : 0);

                                        if (lessonType === 'article') return null;

                                        if (streamCount === 2) {
                                          return (
                                            <span 
                                              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0 flex items-center gap-1 shadow-sm"
                                              title="Đầy đủ 2 luồng phát: Streamtape + Abyss"
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                              <span>2 Luồng</span>
                                            </span>
                                          );
                                        }
                                        if (streamCount === 1) {
                                          return (
                                            <span 
                                              className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 flex items-center gap-1"
                                              title={`Mới có 1 luồng: ${hasPrimary ? 'Streamtape' : 'Abyss'} (Khuyên dùng bổ sung thêm 1 luồng)`}
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                              <span>1 Luồng</span>
                                            </span>
                                          );
                                        }
                                        return (
                                          <span 
                                            className="px-1.5 py-0.5 text-[9px] font-mono text-slate-500 rounded bg-slate-800/80 border border-slate-700/60 flex-shrink-0"
                                            title="Chưa có link video"
                                          >
                                            0 Luồng
                                          </span>
                                        );
                                      })()}
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

              {/* COLUMN 2: Active Lesson Workspace & Rich Editor */}
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
                    
                    {/* Header Row: Title & Format Selector + DIRECT LESSON SAVE BUTTON */}
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
                            <span>Video Bài Giảng</span>
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

                        {/* Estimated time & Direct Save Button for this Lesson */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Thời lượng:</span>
                            </label>
                            <input
                              type="number"
                              value={normalizeDurationMinutes(activeLesson.durationMinutes, 15)}
                              onChange={(e) => handleUpdateActiveLesson('durationMinutes', parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white text-center font-bold"
                            />
                            <span className="text-xs text-slate-500">phút</span>
                          </div>

                          {/* DIRECT SAVE BUTTON PLACED RIGHT ON THE LESSON */}
                          <button
                            type="button"
                            onClick={handleSaveCourse}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                              isSavedRecently
                                ? 'bg-teal-600 text-white shadow-teal-600/30 ring-1 ring-teal-400'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                            }`}
                            title="Lưu tất cả nội dung khóa học & bài giảng này vào máy (Ctrl+S)"
                          >
                            {isSavedRecently ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã Lưu!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Lưu Bài Học</span>
                              </>
                            )}
                          </button>
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
                    {(activeLesson.type === 'video' || activeLesson.type === 'mixed' || !activeLesson.type) && (() => {
                      const hasPrimary = Boolean(activeLesson.videoSource && activeLesson.videoSource.trim());
                      const hasMirror = Boolean(activeLesson.mirrorVideoSource && activeLesson.mirrorVideoSource.trim());
                      const streamCount = (hasPrimary ? 1 : 0) + (hasMirror ? 1 : 0);

                      return (
                      <div className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-3 shadow-md">
                        {/* Stream Summary Badge */}
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Trạng thái cấu hình phát:</span>
                          </span>
                          {streamCount === 2 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>🟢 Đầy đủ 2 Luồng (Streamtape + Abyss)</span>
                            </span>
                          ) : streamCount === 1 ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span>🟡 Mới có 1 Luồng (Khuyên dùng thêm Luồng {hasPrimary ? 'Phụ' : 'Chính'})</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>⚪ Chưa cấu hình luồng phát</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                          <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            <span>Nguồn Video Chính (Ưu tiên Streamtape / Mặc định)</span>
                          </label>
                          
                          {activeLesson.videoSource && (
                            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl border whitespace-nowrap ${
                              parseUniversalVideo(activeLesson.videoSource).provider === 'streamtape'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'abyss'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'youtube'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'tiktok'
                                ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'vimeo'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'gdrive'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : parseUniversalVideo(activeLesson.videoSource).provider === 'mp4'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            }`}>
                              {parseUniversalVideo(activeLesson.videoSource).label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={activeLesson.videoSource || ''}
                            onChange={(e) => handleUpdateActiveLesson('videoSource', e.target.value)}
                            onBlur={handleNormalizeActiveLessonSources}
                            placeholder="Nguồn chính: Streamtape, Abyss, YouTube, MP4 (Hệ thống luôn ưu tiên Streamtape)..."
                            className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:border-emerald-500 font-mono text-[11px]"
                          />
                        </div>

                        {/* Mirror Video Source (Nguồn Dự Phòng Dual-Source Fallback) */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                              <RefreshCw className="w-3 h-3 text-amber-400" />
                              <span>Nguồn Dự Phòng (Mirror Fallback - Abyss / Nguồn phụ)</span>
                            </label>
                            {activeLesson.mirrorVideoSource && (
                              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-lg border ${
                                parseUniversalVideo(activeLesson.mirrorVideoSource).provider === 'abyss'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {parseUniversalVideo(activeLesson.mirrorVideoSource).label}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={activeLesson.mirrorVideoSource || ''}
                            onChange={(e) => handleUpdateActiveLesson('mirrorVideoSource', e.target.value)}
                            onBlur={handleNormalizeActiveLessonSources}
                            placeholder="Nguồn dự phòng: Dán link Abyss / Streamtape / YouTube (Tự động chuyển về Abyss khi chính là Streamtape)..."
                            className="w-full px-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:border-amber-500 font-mono text-[11px]"
                          />
                        </div>
                      </div>
                      );
                    })()}

                    {/* Rich Text Editor for Article / Reading Content */}
                    {(activeLesson.type === 'article' || activeLesson.type === 'mixed') && (
                      <div className="space-y-2">
                        <RichTextEditor
                          key={activeLesson.id}
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
                          {activeLesson.attachments.map((att) => {
                            const isTeraBox = att.type === 'terabox' || att.url?.includes('terabox') || att.url?.includes('1024tera') || att.url?.includes('terasharelink');

                            return (
                              <div 
                                key={att.id}
                                className={`flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                                  isTeraBox 
                                    ? 'bg-[#060813] border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]' 
                                    : 'bg-slate-900/90 border-slate-800'
                                }`}
                              >
                                {isTeraBox && (
                                  <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0">
                                    <HardDrive className="w-3 h-3 text-cyan-400" />
                                    <span>TeraBox</span>
                                  </span>
                                )}

                                <input
                                  type="text"
                                  value={att.name}
                                  onChange={(e) => handleUpdateAttachment(att.id, 'name', e.target.value)}
                                  placeholder="Tên tài liệu đính kèm..."
                                  className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 flex-1 min-w-[160px] focus:border-emerald-500 font-medium"
                                />

                                <input
                                  type="url"
                                  value={att.url}
                                  onChange={(e) => handleUpdateAttachment(att.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 font-mono text-[11px] flex-1 min-w-[180px] focus:border-emerald-500"
                                />

                                <select
                                  value={att.type || (isTeraBox ? 'terabox' : 'pdf')}
                                  onChange={(e) => handleUpdateAttachment(att.id, 'type', e.target.value as any)}
                                  className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:border-emerald-500 font-bold cursor-pointer"
                                >
                                  <option value="pdf">📄 PDF (Mặc định)</option>
                                  <option value="terabox">🖴 TeraBox</option>
                                  <option value="drive">📁 Google Drive</option>
                                  <option value="github">🐙 GitHub</option>
                                  <option value="link">🔗 Link ngoài</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(att.id)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors flex-shrink-0"
                                  title="Xóa tài liệu này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
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
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    <span>Thông Tin Cơ Bản Khóa Học</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handleSaveCourse}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isSavedRecently
                        ? 'bg-teal-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isSavedRecently ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavedRecently ? 'Đã Lưu!' : 'Lưu Thông Tin'}</span>
                  </button>
                </div>

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
                    onAddNewOption={(newInst) => onAddInstructor && onAddInstructor(newInst)}
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

        {/* Unsaved Changes Warning Modal Confirmation */}
        {showUnsavedConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl shadow-amber-950/40">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Cảnh Báo Thay Đổi Chưa Lưu!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Các nội dung vừa chỉnh sửa sẽ bị mất nếu không lưu.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                Bạn đã thay đổi thông tin hoặc nội dung giáo trình của khóa học nhưng chưa bấm <strong>"Lưu Bài Học"</strong>. Bạn có chắc chắn muốn thoát và hủy bỏ toàn bộ chỉnh sửa này không?
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  Ở Lại Chỉnh Sửa
                </button>

                <button
                  type="button"
                  onClick={handleForceClose}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20"
                >
                  Thoát & Hủy Bỏ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TeraBox Cloud Dispatcher & Import Modal */}
        <TeraBoxImportModal
          isOpen={isTeraBoxModalOpen}
          onClose={() => setIsTeraBoxModalOpen(false)}
          chapters={chapters.map(ch => ({ id: ch.id, title: ch.title }))}
          defaultChapterId={activeSelection?.chId || chapters[0]?.id}
          onImportLessons={handleImportBulkLessonsToChapter}
        />

      </div>
    </div>
  );
};
