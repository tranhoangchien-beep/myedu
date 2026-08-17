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

export const App: React.FC = () => {
  // Main Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
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
      document.title = 'Bài Giảng Đã Ghim | MyEdu';
    } else if (currentView === 'studio') {
      document.title = 'Trung Tâm Quản Trị Khóa Học | MyEdu';
    } else {
      document.title = 'MyEdu - Không Gian Học Tập Cá Nhân';
    }
  }, [currentView, activeCourse, activeLesson]);

  // Flatten lessons in active course to calculate prev/next
  const flattenedLessons = useMemo(() => {
    if (!activeCourse) return [];
    const list: Lesson[] = [];
    activeCourse.chapters.forEach(ch => {
      ch.lessons.forEach(l => list.push(l));
    });
    return list;
  }, [activeCourse]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return flattenedLessons.findIndex(l => l.id === activeLesson.id);
  }, [flattenedLessons, activeLesson]);

  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < flattenedLessons.length - 1;

  // Starred count
  const starredCount = useMemo(() => {
    let count = 0;
    courses.forEach(c => {
      c.chapters.forEach(ch => {
        ch.lessons.forEach(l => {
          if (l.isStarred) count += 1;
        });
      });
    });
    return count;
  }, [courses]);

  // Action: Open a course and lesson with URL Hash sync
  const handleSelectCourseAndLesson = useCallback((courseId: string, lessonId?: string) => {
    const targetCourse = courses.find(c => c.id === courseId);
    if (!targetCourse) return;

    const firstLesson = targetCourse.chapters[0]?.lessons[0];
    const targetLessonId = lessonId || firstLesson?.id;

    setActiveCourseId(courseId);
    setActiveLessonId(targetLessonId || null);
    setCurrentView('player');

    // Update URL hash
    const newHash = targetLessonId 
      ? `#/course/${courseId}/lesson/${targetLessonId}`
      : `#/course/${courseId}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }

    // Update continue progress
    const targetLesson = lessonId
      ? targetCourse.chapters.flatMap(ch => ch.lessons).find(l => l.id === lessonId)
      : firstLesson;

    if (targetLesson) {
      const newProgress: ContinueProgress = {
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        lessonId: targetLesson.id,
        lessonTitle: targetLesson.title,
        category: targetCourse.category,
        videoSource: targetLesson.videoSource,
        timestamp: new Date().toISOString(),
      };
      setContinueProgress(newProgress);
      saveContinueProgress(newProgress);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courses]);

  // Action: Next Lesson
  const handleNextLesson = useCallback(() => {
    if (hasNextLesson && currentLessonIndex !== -1) {
      const next = flattenedLessons[currentLessonIndex + 1];
      if (next && activeCourseId) {
        handleSelectCourseAndLesson(activeCourseId, next.id);
      }
    }
  }, [hasNextLesson, currentLessonIndex, flattenedLessons, activeCourseId, handleSelectCourseAndLesson]);

  // Action: Previous Lesson
  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson && currentLessonIndex !== -1) {
      const prev = flattenedLessons[currentLessonIndex - 1];
      if (prev && activeCourseId) {
        handleSelectCourseAndLesson(activeCourseId, prev.id);
      }
    }
  }, [hasPrevLesson, currentLessonIndex, flattenedLessons, activeCourseId, handleSelectCourseAndLesson]);

  // Action: Toggle Lesson Complete
  const handleToggleComplete = useCallback((lessonId: string, courseIdParam?: string) => {
    const cId = courseIdParam || activeCourseId;
    if (!cId) return;

    let isNowCompleted = false;
    const updated = courses.map(course => {
      if (course.id !== cId) return course;
      return {
        ...course,
        chapters: course.chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              isNowCompleted = !l.isCompleted;
              return { ...l, isCompleted: isNowCompleted };
            }
            return l;
          })
        }))
      };
    });
    updateCoursesState(updated);

    // Update streak and today's completed count
    const updatedStats = recordLessonCompletionStats(isNowCompleted);
    setUserStats(updatedStats);
  }, [activeCourseId, courses]);

  // Action: Toggle Lesson Star
  const handleToggleStar = useCallback((lessonId: string, courseIdParam?: string) => {
    const cId = courseIdParam || activeCourseId;
    if (!cId) return;

    const updated = courses.map(course => {
      if (course.id !== cId) return course;
      return {
        ...course,
        chapters: course.chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, isStarred: !l.isStarred };
            }
            return l;
          })
        }))
      };
    });
    updateCoursesState(updated);
  }, [activeCourseId, courses]);

  // Action: Update Notes for Lesson
  const handleUpdateNotes = useCallback((lessonId: string, notes: string) => {
    if (!activeCourseId) return;

    const updated = courses.map(course => {
      if (course.id !== activeCourseId) return course;
      return {
        ...course,
        chapters: course.chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(l => {
            if (l.id === lessonId) {
              return { ...l, notes };
            }
            return l;
          })
        }))
      };
    });
    updateCoursesState(updated);
  }, [activeCourseId, courses]);

  // Action: Save or Update Course from Editor Modal
  const handleSaveCourse = (course: Course) => {
    const exists = courses.some(c => c.id === course.id);
    let updated: Course[];
    if (exists) {
      updated = courses.map(c => c.id === course.id ? course : c);
    } else {
      updated = [course, ...courses];
    }
    updateCoursesState(updated);

    // Auto add category to categories list if not present
    if (course.category && !categories.some(c => c.toLowerCase() === course.category.toLowerCase())) {
      const newCats = [...categories, course.category];
      setCategories(newCats);
      saveCategories(newCats);
    }
    // Auto add source to sources list if not present
    if (course.sourcePlatform && !sources.some(s => s.toLowerCase() === course.sourcePlatform?.toLowerCase())) {
      const newSrcs = [...sources, course.sourcePlatform];
      setSources(newSrcs);
      saveSources(newSrcs);
    }
  };

  // Action: Open Editor to Create New Course
  const handleAddNewCourse = () => {
    setCourseToEdit(null);
    setIsCourseEditorOpen(true);
  };

  // Action: Open Editor to Edit Existing Course
  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseEditorOpen(true);
  };

  // Action: Save New Course from Bulk Modal
  const handleSaveNewCourseFromBulk = (newCourse: Course) => {
    handleSaveCourse(newCourse);
    handleSelectCourseAndLesson(newCourse.id);
  };

  // Action: Add Chapter & Lessons to Existing Course
  const handleAddChapterToCourse = (courseId: string, newChapter: Chapter) => {
    const updated = courses.map(course => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        chapters: [...course.chapters, newChapter],
        updatedAt: new Date().toISOString(),
      };
    });
    updateCoursesState(updated);
  };

  // Action: Delete Course
  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter(c => c.id !== courseId);
    updateCoursesState(updated);
    if (activeCourseId === courseId) {
      setCurrentView('home');
      setActiveCourseId(null);
      setActiveLessonId(null);
    }
  };

  // Action: Restore Backup
  const handleRestoreCourses = (restored: Course[]) => {
    updateCoursesState(restored);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (currentView === 'player') {
        if (e.key === 'n' || e.key === 'N') {
          handleNextLesson();
        } else if (e.key === 'p' || e.key === 'P') {
          handlePrevLesson();
        } else if (e.key === 'z' || e.key === 'Z') {
          setIsZenMode(prev => !prev);
        }
      }

      if (e.key === 'Escape') {
        if (isZenMode) {
          setIsZenMode(false);
          return;
        }
        if (isBulkModalOpen) setIsBulkModalOpen(false);
        if (isCourseEditorOpen) setIsCourseEditorOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleNextLesson, handlePrevLesson, isZenMode, isBulkModalOpen, isCourseEditorOpen, isShortcutsOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Zen Mode Floating Exit Bar */}
      {isZenMode && currentView === 'player' && (
        <div className="sticky top-2 z-50 flex justify-center px-4 animate-fade-in pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/40 shadow-2xl backdrop-blur-md text-xs">
            <span className="flex items-center gap-1.5 font-bold text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              Zen Focus Mode Đang Bật
            </span>
            <span className="text-slate-400 hidden sm:inline">&bull; Ẩn xao nhãng</span>
            <button
              onClick={() => setIsZenMode(false)}
              className="px-2.5 py-0.5 rounded-full bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-bold text-[11px] transition-all"
            >
              Thoát (Phím Z / Esc)
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation (Hidden in Zen Mode) */}
      {!isZenMode && (
        <Navbar
          currentView={currentView}
          onNavigateHome={() => {
            setCurrentView('home');
            window.location.hash = '#/';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateFavorites={() => {
            setCurrentView('favorites');
            window.location.hash = '#/favorites';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenStudio={() => {
            setCurrentView('studio');
            window.location.hash = '#/studio';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          totalCoursesCount={courses.length}
          starredCount={starredCount}
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

            {/* Courses Grid with Integrated Wrapped Filter Hub */}
            <CourseGrid
              courses={courses}
              searchQuery={searchQuery}
              categories={categories}
              sources={sources}
              selectedCategory={selectedCategory}
              selectedSource={selectedSource}
              selectedInstructor={selectedInstructor}
              onSelectCategory={setSelectedCategory}
              onSelectSource={setSelectedSource}
              onSelectInstructor={setSelectedInstructor}
              onResetFilters={handleResetFilters}
              onSelectCourse={(cId) => handleSelectCourseAndLesson(cId)}
              onOpenBulkImport={(cId) => {
                setBulkCourseId(cId);
                setIsBulkModalOpen(true);
              }}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddNewCourse={handleAddNewCourse}
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
                    setSelectedCategory(cat);
                    setCurrentView('home');
                    window.location.hash = '#/';
                  }}
                  onSelectCourse={(cId) => handleSelectCourseAndLesson(cId)}
                />
              </div>
            )}

            {isZenMode ? (
              // Zen Focus Mode: Distraction-free max container at center
              <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pt-2">
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
            ) : (
              // Standard Split Mode: Player on Left, Sidebar on Right
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
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
              </div>
            )}
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
            onBackToLearning={() => {
              setCurrentView('home');
              window.location.hash = '#/';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddNewCourse={handleAddNewCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
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
        onSaveCourse={handleSaveCourse}
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
        preselectedCourseId={bulkCourseId}
        onSaveNewCourse={handleSaveNewCourseFromBulk}
        onAddChapterToCourse={handleAddChapterToCourse}
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
