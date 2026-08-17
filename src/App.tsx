import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Course, Lesson, CategoryType, Chapter, ContinueProgress, UserStats } from './types';
import { 
  getStoredCourses, 
  saveCourses, 
  getContinueProgress, 
  saveContinueProgress,
  getStoredCategories,
  saveCategories,
  getStoredSources,
  saveSources,
  getStoredInstructors,
  saveInstructors,
  getStoredUserStats,
  recordLessonCompletionStats
} from './lib/storage';
import { Navbar } from './components/layout/Navbar';
import { ContinueBanner } from './components/layout/ContinueBanner';
import { CourseGrid } from './components/course/CourseGrid';
import { FavoritesView } from './components/course/FavoritesView';
import { AbyssPlayer } from './components/player/AbyssPlayer';
import { LessonSidebar } from './components/player/LessonSidebar';
import { BulkImportModal } from './components/course/BulkImportModal';
import { CourseEditorModal } from './components/admin/CourseEditorModal';
import { CourseStudioView } from './components/admin/CourseStudioView';
import { ShortcutModal } from './components/common/ShortcutModal';
import { Breadcrumb } from './components/layout/Breadcrumb';
import { MasterLoginView } from './components/auth/MasterLoginView';
import { isAuthenticated, clearAuthenticatedSession } from './lib/auth';

export const App: React.FC = () => {
  // Authentication State (Master QTV Gate)
  const [isAuth, setIsAuth] = useState<boolean>(() => isAuthenticated());

  // Main Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const [continueProgress, setContinueProgress] = useState<ContinueProgress | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(getStoredUserStats());

  // Navigation & View States: 'home' | 'player' | 'favorites' | 'studio'
  const [currentView, setCurrentView] = useState<'home' | 'player' | 'favorites' | 'studio'>('home');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Filters (Category, Source, Instructor, Search)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedSource, setSelectedSource] = useState<string>('Tất cả');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('Tất cả');

  // Player preferences
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);

  // Sub-Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkCourseId, setBulkCourseId] = useState<string | undefined>(undefined);
  
  // Course Editor Modal
  const [isCourseEditorOpen, setIsCourseEditorOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedCourses = getStoredCourses();
    setCourses(loadedCourses);
    const loadedCategories = getStoredCategories();
    setCategories(loadedCategories);
    const loadedSources = getStoredSources();
    setSources(loadedSources);
    const loadedInstructors = getStoredInstructors();
    setInstructors(loadedInstructors);
    const loadedProgress = getContinueProgress();
    setContinueProgress(loadedProgress);
  }, []);

  // Hash Router Listener & Deep Linking (Back/Forward & Direct URL support)
  useEffect(() => {
    const parseHashRoute = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/studio')) {
        setCurrentView('studio');
      } else if (hash.startsWith('#/favorites')) {
        setCurrentView('favorites');
      } else if (hash.startsWith('#/course/')) {
        const parts = hash.replace('#/course/', '').split('/lesson/');
        const cId = parts[0];
        const lId = parts[1];
        if (cId) {
          setActiveCourseId(cId);
          if (lId) {
            setActiveLessonId(lId);
          }
          setCurrentView('player');
        }
      } else if (hash === '#/' || hash === '' || hash === '#') {
        setCurrentView('home');
      }
    };

    if (courses.length > 0) {
      parseHashRoute();
    }

    window.addEventListener('hashchange', parseHashRoute);
    window.addEventListener('popstate', parseHashRoute);
    return () => {
      window.removeEventListener('hashchange', parseHashRoute);
      window.removeEventListener('popstate', parseHashRoute);
    };
  }, [courses]);

  // Sync courses to storage whenever modified
  const updateCoursesState = (newCourses: Course[]) => {
    setCourses(newCourses);
    saveCourses(newCourses);
  };

  // Cascading Filter Handlers
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);

    if (cat !== 'Tất cả') {
      // Validate if current source still exists in this category
      if (selectedSource !== 'Tất cả') {
        const hasSource = courses.some(
          c => c.category?.trim().toLowerCase() === cat.trim().toLowerCase() && 
               c.sourcePlatform?.trim().toLowerCase() === selectedSource.trim().toLowerCase()
        );
        if (!hasSource) setSelectedSource('Tất cả');
      }

      // Validate if current instructor still exists in this category
      if (selectedInstructor !== 'Tất cả') {
        const hasInstructor = courses.some(
          c => c.category?.trim().toLowerCase() === cat.trim().toLowerCase() && 
               c.instructor?.trim().toLowerCase() === selectedInstructor.trim().toLowerCase()
        );
        if (!hasInstructor) setSelectedInstructor('Tất cả');
      }
    }
  };

  const handleSelectSource = (source: string) => {
    setSelectedSource(source);

    if (source !== 'Tất cả') {
      if (selectedInstructor !== 'Tất cả') {
        const hasInstructor = courses.some(c => {
          const matchCat = selectedCategory === 'Tất cả' || c.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
          const matchSrc = c.sourcePlatform?.trim().toLowerCase() === source.trim().toLowerCase();
          const matchInst = c.instructor?.trim().toLowerCase() === selectedInstructor.trim().toLowerCase();
          return matchCat && matchSrc && matchInst;
        });
        if (!hasInstructor) setSelectedInstructor('Tất cả');
      }
    }
  };

  const handleSelectInstructor = (instructor: string) => {
    setSelectedInstructor(instructor);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('Tất cả');
    setSelectedSource('Tất cả');
    setSelectedInstructor('Tất cả');
    setSearchQuery('');
  };

  // Dynamic Category Handlers
  const handleAddCategory = (newCat: string) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
  };

  const handleRenameCategory = (oldCat: string, newCat: string) => {
    const updatedCategories = categories.map(c => c === oldCat ? newCat : c);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);

    // Update category name in all existing courses
    const updatedCourses = courses.map(c => 
      c.category.trim().toLowerCase() === oldCat.trim().toLowerCase() 
        ? { ...c, category: newCat } 
        : c
    );
    updateCoursesState(updatedCourses);

    if (selectedCategory.trim().toLowerCase() === oldCat.trim().toLowerCase()) {
      setSelectedCategory(newCat);
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const updatedCategories = categories.filter(c => c !== catToDelete);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);

    // Reassign affected courses to fallback category
    const fallbackCat = updatedCategories[0] || 'Chung';
    const updatedCourses = courses.map(c => 
      c.category.trim().toLowerCase() === catToDelete.trim().toLowerCase() 
        ? { ...c, category: fallbackCat } 
        : c
    );
    updateCoursesState(updatedCourses);

    if (selectedCategory.trim().toLowerCase() === catToDelete.trim().toLowerCase()) {
      setSelectedCategory('Tất cả');
    }
  };

  // Dynamic Source Handlers
  const handleAddSource = (newSource: string) => {
    const updated = [...sources, newSource];
    setSources(updated);
    saveSources(updated);
  };

  const handleRenameSource = (oldSource: string, newSource: string) => {
    const updatedSources = sources.map(s => s === oldSource ? newSource : s);
    setSources(updatedSources);
    saveSources(updatedSources);

    const updatedCourses = courses.map(c => 
      c.sourcePlatform === oldSource ? { ...c, sourcePlatform: newSource } : c
    );
    updateCoursesState(updatedCourses);
  };

  const handleDeleteSource = (sourceToDelete: string) => {
    const updatedSources = sources.filter(s => s !== sourceToDelete);
    setSources(updatedSources);
    saveSources(updatedSources);

    const fallbackSrc = updatedSources[0] || 'Khác';
    const updatedCourses = courses.map(c => 
      c.sourcePlatform === sourceToDelete ? { ...c, sourcePlatform: fallbackSrc } : c
    );
    updateCoursesState(updatedCourses);
  };

  // Dynamic Instructor Handlers
  const handleAddInstructor = (newInst: string) => {
    const updated = [...instructors, newInst];
    setInstructors(updated);
    saveInstructors(updated);
  };

  const handleRenameInstructor = (oldInst: string, newInst: string) => {
    const updatedInstructors = instructors.map(i => i === oldInst ? newInst : i);
    setInstructors(updatedInstructors);
    saveInstructors(updatedInstructors);

    const updatedCourses = courses.map(c => 
      c.instructor === oldInst ? { ...c, instructor: newInst } : c
    );
    updateCoursesState(updatedCourses);

    if (selectedInstructor === oldInst) {
      setSelectedInstructor(newInst);
    }
  };

  const handleDeleteInstructor = (instToDelete: string) => {
    const updatedInstructors = instructors.filter(i => i !== instToDelete);
    setInstructors(updatedInstructors);
    saveInstructors(updatedInstructors);

    const updatedCourses = courses.map(c => 
      c.instructor === instToDelete ? { ...c, instructor: undefined } : c
    );
    updateCoursesState(updatedCourses);

    if (selectedInstructor === instToDelete) {
      setSelectedInstructor('Tất cả');
    }
  };

  // Find active course & active lesson
  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === activeCourseId) || null;
  }, [courses, activeCourseId]);

  const activeLesson = useMemo(() => {
    if (!activeCourse) return null;
    for (const ch of activeCourse.chapters) {
      const found = ch.lessons.find(l => l.id === activeLessonId);
      if (found) return found;
    }
    return activeCourse.chapters[0]?.lessons[0] || null;
  }, [activeCourse, activeLessonId]);

  // Find active chapter for breadcrumb
  const activeChapter = useMemo(() => {
    if (!activeCourse || !activeLesson) return null;
    return activeCourse.chapters.find(ch => ch.lessons.some(l => l.id === activeLesson.id)) || null;
  }, [activeCourse, activeLesson]);

  // Dynamic Document Title Sync
  useEffect(() => {
    if (currentView === 'player' && activeCourse && activeLesson) {
      document.title = `${activeLesson.title} - ${activeCourse.title} | MyEdu`;
    } else if (currentView === 'favorites') {
      document.title = 'Bài Học Đã Ghim | MyEdu';
    } else if (currentView === 'studio') {
      document.title = 'Trung Tâm Quản Trị Khóa Học | MyEdu';
    } else {
      document.title = 'MyEdu - Nền Tảng Học Tập Cá Nhân Siêu Tinh Gọn';
    }
  }, [currentView, activeCourse, activeLesson]);

  // Calculate Flattened Lessons for Next/Prev Navigation
  const flatLessons = useMemo(() => {
    if (!activeCourse) return [];
    return activeCourse.chapters.flatMap(ch => ch.lessons);
  }, [activeCourse]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson || flatLessons.length === 0) return -1;
    return flatLessons.findIndex(l => l.id === activeLesson.id);
  }, [flatLessons, activeLesson]);

  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < flatLessons.length - 1;

  // Next / Prev Handlers
  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson && activeCourse) {
      const prev = flatLessons[currentLessonIndex - 1];
      setActiveLessonId(prev.id);
      window.location.hash = `#/course/${activeCourse.id}/lesson/${prev.id}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasPrevLesson, flatLessons, currentLessonIndex, activeCourse]);

  const handleNextLesson = useCallback(() => {
    if (hasNextLesson && activeCourse) {
      const next = flatLessons[currentLessonIndex + 1];
      setActiveLessonId(next.id);
      window.location.hash = `#/course/${activeCourse.id}/lesson/${next.id}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasNextLesson, flatLessons, currentLessonIndex, activeCourse]);

  // Keyboard Shortcuts (Space, F, N, P, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }

      if (currentView === 'player') {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNextLesson();
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handlePrevLesson();
        } else if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          setIsZenMode(prev => !prev);
        } else if (e.key === 'Escape') {
          if (isZenMode) {
            setIsZenMode(false);
          } else {
            setCurrentView('home');
            window.location.hash = '#/';
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isZenMode, handleNextLesson, handlePrevLesson]);

  // Navigate to player with selected course & lesson
  const handleSelectCourseAndLesson = (courseId: string, lessonId?: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setActiveCourseId(courseId);
    const targetLessonId = lessonId || course.lastWatchedLessonId || course.chapters[0]?.lessons[0]?.id;
    setActiveLessonId(targetLessonId);

    // Update continue watching progress
    const targetLesson = course.chapters.flatMap(ch => ch.lessons).find(l => l.id === targetLessonId) || course.chapters[0]?.lessons[0];
    if (targetLesson) {
      const progress: ContinueProgress = {
        courseId: course.id,
        courseTitle: course.title,
        lessonId: targetLesson.id,
        lessonTitle: targetLesson.title,
        category: course.category,
        videoSource: targetLesson.videoSource,
        timestamp: new Date().toISOString(),
      };
      setContinueProgress(progress);
      saveContinueProgress(progress);
    }

    setCurrentView('player');
    window.location.hash = `#/course/${course.id}/lesson/${targetLessonId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Lesson Completion
  const handleToggleComplete = (lessonId: string, specificCourseId?: string) => {
    const targetCourseId = specificCourseId || activeCourseId;
    if (!targetCourseId) return;

    let justMarkedComplete = false;

    const updatedCourses = courses.map((c) => {
      if (c.id === targetCourseId) {
        const updatedChapters = c.chapters.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) => {
            if (l.id === lessonId) {
              const nextStatus = !l.isCompleted;
              if (nextStatus) justMarkedComplete = true;
              return { ...l, isCompleted: nextStatus };
            }
            return l;
          }),
        }));
        return { ...c, chapters: updatedChapters };
      }
      return c;
    });

    updateCoursesState(updatedCourses);

    // Record stats streak if completed
    if (justMarkedComplete) {
      const updatedStats = recordLessonCompletionStats(true);
      setUserStats(updatedStats);
    }
  };

  // Toggle Lesson Star / Bookmark
  const handleToggleStar = (lessonId: string, specificCourseId?: string) => {
    const targetCourseId = specificCourseId || activeCourseId;
    if (!targetCourseId) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === targetCourseId) {
        const updatedChapters = c.chapters.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) => (l.id === lessonId ? { ...l, isStarred: !l.isStarred } : l)),
        }));
        return { ...c, chapters: updatedChapters };
      }
      return c;
    });

    updateCoursesState(updatedCourses);
  };

  // Update Notes for current lesson
  const handleUpdateNotes = (notes: string) => {
    if (!activeCourseId || !activeLessonId) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourseId) {
        const updatedChapters = c.chapters.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) => (l.id === activeLessonId ? { ...l, notes } : l)),
        }));
        return { ...c, chapters: updatedChapters };
      }
      return c;
    });

    updateCoursesState(updatedCourses);
  };

  // Course CRUD handlers
  const handleAddNewCourse = () => {
    setCourseToEdit(null);
    setIsCourseEditorOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseEditorOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter(c => c.id !== courseId);
    updateCoursesState(updated);

    if (activeCourseId === courseId) {
      setActiveCourseId(null);
      setActiveLessonId(null);
      setCurrentView('home');
      window.location.hash = '#/';
    }

    if (continueProgress?.courseId === courseId) {
      setContinueProgress(null);
      localStorage.removeItem('myedu_continue_progress_v1');
    }
  };

  const handleSaveCourse = (savedCourse: Course) => {
    const exists = courses.some(c => c.id === savedCourse.id);
    let updatedCourses: Course[];
    if (exists) {
      updatedCourses = courses.map(c => c.id === savedCourse.id ? savedCourse : c);
    } else {
      updatedCourses = [savedCourse, ...courses];
    }
    updateCoursesState(updatedCourses);

    if (savedCourse.instructor && savedCourse.instructor.trim()) {
      const instName = savedCourse.instructor.trim();
      if (!instructors.some(i => i.toLowerCase() === instName.toLowerCase())) {
        handleAddInstructor(instName);
      }
    }
  };

  // Bulk Import Handlers
  const handleSaveNewCourseFromBulk = (newCourse: Course) => {
    const updated = [newCourse, ...courses];
    updateCoursesState(updated);

    if (newCourse.instructor && newCourse.instructor.trim()) {
      const instName = newCourse.instructor.trim();
      if (!instructors.some(i => i.toLowerCase() === instName.toLowerCase())) {
        handleAddInstructor(instName);
      }
    }

    handleSelectCourseAndLesson(newCourse.id);
  };

  const handleAddChapterToCourse = (targetCourseId: string, newChapter: Chapter) => {
    const updated = courses.map(c => {
      if (c.id === targetCourseId) {
        return {
          ...c,
          chapters: [...c.chapters, newChapter],
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    updateCoursesState(updated);
  };

  const handleRestoreCourses = (restoredCourses: Course[]) => {
    updateCoursesState(restoredCourses);
  };

  const handleDuplicateCourse = (sourceCourse: Course) => {
    const clonedCourse: Course = {
      ...JSON.parse(JSON.stringify(sourceCourse)),
      id: `course-${Date.now()}`,
      title: `[Bản sao] ${sourceCourse.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [clonedCourse, ...courses];
    updateCoursesState(updated);
  };

  // Count total starred lessons across all courses
  const starredCount = useMemo(() => {
    return courses.reduce((acc, course) => {
      return acc + course.chapters.reduce((cAcc, ch) => {
        return cAcc + ch.lessons.filter(l => l.isStarred).length;
      }, 0);
    }, 0);
  }, [courses]);

  // Master Admin Authentication Gate (Blocks entire application if not logged in)
  if (!isAuth) {
    return <MasterLoginView onLoginSuccess={() => setIsAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic Global Navbar */}
      {!isZenMode && (
        <Navbar
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigateHome={() => {
            setCurrentView('home');
            window.location.hash = '#/';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenStudio={() => {
            setCurrentView('studio');
            window.location.hash = '#/studio';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onLogout={() => {
            clearAuthenticatedSession();
            setIsAuth(false);
          }}
          totalCoursesCount={courses.length}
          userStats={userStats}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* VIEW 1: Home Course Catalog */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Quick Resume Hero Banner */}
            {continueProgress && !searchQuery && selectedCategory === 'Tất cả' && selectedSource === 'Tất cả' && (
              <ContinueBanner
                progress={continueProgress}
                onResume={(courseId, lessonId) => handleSelectCourseAndLesson(courseId, lessonId)}
              />
            )}

            {/* Courses Grid with Integrated Cascading Filter Hub */}
            <CourseGrid
              courses={courses}
              searchQuery={searchQuery}
              categories={categories}
              sources={sources}
              instructors={instructors}
              selectedCategory={selectedCategory}
              selectedSource={selectedSource}
              selectedInstructor={selectedInstructor}
              onSelectCategory={handleSelectCategory}
              onSelectSource={handleSelectSource}
              onSelectInstructor={handleSelectInstructor}
              onResetFilters={handleResetFilters}
              onSelectCourse={(cId) => handleSelectCourseAndLesson(cId)}
              onOpenBulkImport={(cId) => {
                setBulkCourseId(cId);
                setIsBulkModalOpen(true);
              }}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onDuplicateCourse={handleDuplicateCourse}
              onAddNewCourse={handleAddNewCourse}
              onBatchDeleteCourses={(ids) => {
                const updated = courses.filter(c => !ids.includes(c.id));
                updateCoursesState(updated);
              }}
              onBatchUpdateCategory={(ids, newCat) => {
                const updated = courses.map(c => ids.includes(c.id) ? { ...c, category: newCat } : c);
                updateCoursesState(updated);
              }}
            />
          </div>
        )}

        {/* VIEW 2: Player Workspace */}
        {currentView === 'player' && activeCourse && activeLesson && (
          <div className="space-y-4">
            
            {/* Interactive Hierarchical Breadcrumb */}
            {!isZenMode && (
              <div className="pb-1 border-b border-slate-800/80">
                <Breadcrumb
                  category={activeCourse.category}
                  courseTitle={activeCourse.title}
                  courseId={activeCourse.id}
                  chapterTitle={activeChapter?.title}
                  lessonTitle={activeLesson.title}
                  onNavigateHome={() => {
                    setCurrentView('home');
                    window.location.hash = '#/';
                  }}
                  onSelectCategory={(cat) => {
                    handleSelectCategory(cat);
                    setCurrentView('home');
                    window.location.hash = '#/';
                  }}
                  onSelectCourse={(cId) => handleSelectCourseAndLesson(cId)}
                />
              </div>
            )}

            {/* Single Persistent Player Layout (Prevents video reload when Zen Mode is toggled) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`transition-all duration-300 space-y-6 ${
                isZenMode ? 'lg:col-span-12 max-w-5xl mx-auto w-full pt-2' : 'lg:col-span-8'
              }`}>
                <AbyssPlayer
                  course={activeCourse}
                  currentLesson={activeLesson}
                  hasPrevLesson={hasPrevLesson}
                  hasNextLesson={hasNextLesson}
                  onPrevLesson={handlePrevLesson}
                  onNextLesson={handleNextLesson}
                  onToggleComplete={(lId) => handleToggleComplete(lId)}
                  onToggleStar={(lId) => handleToggleStar(lId)}
                  onUpdateNotes={handleUpdateNotes}
                  isZenMode={isZenMode}
                  onToggleZenMode={() => setIsZenMode(prev => !prev)}
                  autoPlayNext={autoPlayNext}
                  onToggleAutoPlayNext={() => setAutoPlayNext(prev => !prev)}
                />
              </div>

              {!isZenMode && (
                <div className="lg:col-span-4 sticky top-20">
                  <LessonSidebar
                    course={activeCourse}
                    currentLessonId={activeLesson.id}
                    onSelectLesson={(lId) => handleSelectCourseAndLesson(activeCourse.id, lId)}
                    onToggleComplete={(lId) => handleToggleComplete(lId)}
                    onToggleStar={(lId) => handleToggleStar(lId)}
                    onBackToCourseList={() => setCurrentView('home')}
                    onOpenBulkImportForCourse={(cId) => {
                      setBulkCourseId(cId);
                      setIsBulkModalOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Starred / Favorites View */}
        {currentView === 'favorites' && (
          <FavoritesView
            courses={courses}
            onSelectLesson={(cId, lId) => handleSelectCourseAndLesson(cId, lId)}
            onToggleStar={(cId, lId) => handleToggleStar(lId, cId)}
            onToggleComplete={(cId, lId) => handleToggleComplete(lId, cId)}
            onBackToHome={() => {
              setCurrentView('home');
              window.location.hash = '#/';
            }}
          />
        )}

        {/* VIEW 4: Course Studio Full-Page View */}
        {currentView === 'studio' && (
          <CourseStudioView
            courses={courses}
            categories={categories}
            sources={sources}
            instructors={instructors}
            onBackToLearning={() => {
              setCurrentView('home');
              window.location.hash = '#/';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddNewCourse={handleAddNewCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onDuplicateCourse={handleDuplicateCourse}
            onOpenBulkImport={(cId) => {
              setBulkCourseId(cId);
              setIsBulkModalOpen(true);
            }}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddSource={handleAddSource}
            onRenameSource={handleRenameSource}
            onDeleteSource={handleDeleteSource}
            onAddInstructor={handleAddInstructor}
            onRenameInstructor={handleRenameInstructor}
            onDeleteInstructor={handleDeleteInstructor}
            onRestoreCourses={handleRestoreCourses}
            onSelectCourseAndLesson={(cId, lId) => handleSelectCourseAndLesson(cId, lId)}
          />
        )}

      </main>

      {/* Course Editor CRUD Modal */}
      <CourseEditorModal
        isOpen={isCourseEditorOpen}
        onClose={() => setIsCourseEditorOpen(false)}
        courseToEdit={courseToEdit}
        categories={categories}
        sources={sources}
        instructors={instructors}
        allCourses={courses}
        onSaveCourse={handleSaveCourse}
        onAddCategory={handleAddCategory}
        onAddSource={handleAddSource}
        onAddInstructor={handleAddInstructor}
        onOpenCategoryManager={() => {
          setIsCourseEditorOpen(false);
          setCurrentView('studio');
          window.location.hash = '#/studio';
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        courses={courses}
        categories={categories}
        sources={sources}
        instructors={instructors}
        preselectedCourseId={bulkCourseId}
        onSaveNewCourse={handleSaveNewCourseFromBulk}
        onAddChapterToCourse={handleAddChapterToCourse}
        onAddInstructor={handleAddInstructor}
      />

      <ShortcutModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Footer */}
      {!isZenMode && (
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>MyEdu Personal Learning Workspace &bull; Powered by Google Antigravity 2.0 &bull; Abyss Video Cloud</p>
        </footer>
      )}

    </div>
  );
};
