import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  recordLessonCompletionStats,
  INITIAL_SAMPLE_COURSES
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
import { isAuthenticated, verifySessionToken, clearAuthenticatedSession } from './lib/auth';
import { fetchFromCloud, syncToCloud, subscribeToCloudChanges, isFirebaseConfigured } from './lib/firebase';
import { Edit3, Zap } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State (Master QTV Gate)
  const [isAuth, setIsAuth] = useState<boolean>(() => isAuthenticated());

  // Cryptographically verify session HMAC signature on startup
  useEffect(() => {
    if (isAuth) {
      verifySessionToken().then((isValid) => {
        if (!isValid) {
          setIsAuth(false);
        }
      });
    }
  }, [isAuth]);

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

  const isInitialSyncDoneRef = useRef<boolean>(false);
  const lastLocalWriteTimeRef = useRef<number>(0);

  // Initialize data on mount + Connect Realtime Cloud Firestore
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
    const loadedStats = getStoredUserStats();
    setUserStats(loadedStats);

    // Setup Cloud Firestore Real-time Sync if configured
    if (isFirebaseConfigured) {
      // 1. Initial Cloud Fetch with timeout protection
      fetchFromCloud(5000).then(cloudData => {
        if (!cloudData || !cloudData.courses) {
          // Seed cloud only if cloud is completely uninitialized
          syncToCloud({
            courses: loadedCourses,
            categories: loadedCategories,
            sources: loadedSources,
            instructors: loadedInstructors,
            continueProgress: loadedProgress,
            userStats: loadedStats
          }).catch(err => console.warn('Failed initial cloud seed:', err));
        } else {
          // Cloud Firestore is the Single Source of Truth
          let currentCloudCourses = Array.isArray(cloudData.courses) ? cloudData.courses : [];
          
          // Bidirectional Merge:
          // 1. Any user-created course in localStorage (loadedCourses) that is not in Cloud -> preserve and sync up
          const cloudIdSet = new Set(currentCloudCourses.map(c => c.id));
          const localOnlyUserCourses = loadedCourses.filter(
            lc => !cloudIdSet.has(lc.id) && lc.id.startsWith('course-') && !INITIAL_SAMPLE_COURSES.some(sc => sc.id === lc.id)
          );

          // 2. Also check if newly standardized official courses (e.g. Thành Công TC) need one-time seeding
          const officialSeedCourses = INITIAL_SAMPLE_COURSES.filter(
            c => (c.id === 'course-thanhcongtc-dau-tu-chung-chi-quy-101' || c.id === 'course-8xtrading-footprint-trading') && !cloudIdSet.has(c.id)
          );

          const missingToMerge = [...localOnlyUserCourses, ...officialSeedCourses.filter(sc => !localOnlyUserCourses.some(lc => lc.id === sc.id))];

          if (missingToMerge.length > 0) {
            currentCloudCourses = [...missingToMerge, ...currentCloudCourses];
            syncToCloud({ courses: currentCloudCourses }).catch(err => console.warn('Failed course merge sync:', err));
          }

          setCourses(currentCloudCourses);
          saveCourses(currentCloudCourses);

          if (cloudData.categories && Array.isArray(cloudData.categories)) {
            setCategories(cloudData.categories);
            saveCategories(cloudData.categories);
          }
          if (cloudData.sources && Array.isArray(cloudData.sources)) {
            setSources(cloudData.sources);
            saveSources(cloudData.sources);
          }
          
          let currentInstructors = (cloudData.instructors && Array.isArray(cloudData.instructors)) ? cloudData.instructors : loadedInstructors;
          if (!currentInstructors.includes('Thành Công TC')) {
            currentInstructors = ['Thành Công TC', ...currentInstructors];
            syncToCloud({ instructors: currentInstructors }).catch(err => console.warn('Failed instructor sync:', err));
          }
          setInstructors(currentInstructors);
          saveInstructors(currentInstructors);

          if (cloudData.continueProgress !== undefined) {
            setContinueProgress(cloudData.continueProgress);
            if (cloudData.continueProgress) {
              saveContinueProgress(cloudData.continueProgress);
            } else {
              localStorage.removeItem('myedu_continue_progress_v1');
            }
          }

          if (cloudData.userStats) {
            setUserStats(cloudData.userStats);
          }
        }
        isInitialSyncDoneRef.current = true;
      }).catch(err => {
        console.warn('⚠️ Cloud fetch error, proceeding with local data:', err);
        isInitialSyncDoneRef.current = true;
      });

      // 2. Realtime listener for cross-device automatic updates
      const unsubscribe = subscribeToCloudChanges((cloudData) => {
        // Skip echo updates if we just performed a local write in the last 1500ms
        if (Date.now() - lastLocalWriteTimeRef.current < 1500) {
          return;
        }

        if (cloudData) {
          if (Array.isArray(cloudData.courses)) {
            setCourses(cloudData.courses);
            saveCourses(cloudData.courses);
          }
          if (cloudData.categories && Array.isArray(cloudData.categories)) {
            setCategories(cloudData.categories);
            saveCategories(cloudData.categories);
          }
          if (cloudData.sources && Array.isArray(cloudData.sources)) {
            setSources(cloudData.sources);
            saveSources(cloudData.sources);
          }
          if (cloudData.instructors && Array.isArray(cloudData.instructors)) {
            setInstructors(cloudData.instructors);
            saveInstructors(cloudData.instructors);
          }
          if (cloudData.continueProgress !== undefined) {
            setContinueProgress(cloudData.continueProgress);
            if (cloudData.continueProgress) {
              saveContinueProgress(cloudData.continueProgress);
            } else {
              localStorage.removeItem('myedu_continue_progress_v1');
            }
          }
          if (cloudData.userStats) {
            setUserStats(cloudData.userStats);
          }
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
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

    parseHashRoute();

    window.addEventListener('hashchange', parseHashRoute);
    window.addEventListener('popstate', parseHashRoute);
    return () => {
      window.removeEventListener('hashchange', parseHashRoute);
      window.removeEventListener('popstate', parseHashRoute);
    };
  }, []);

  // Cross-Tab Synchronization: Sync course edits & updates between multiple open tabs in real-time
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'myedu_courses_v1' && e.newValue) {
        try {
          const freshCourses = JSON.parse(e.newValue);
          if (Array.isArray(freshCourses)) {
            setCourses(freshCourses);
          }
        } catch {
          // ignore
        }
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('myedu_sync_channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'COURSES_UPDATED' && Array.isArray(event.data.courses)) {
          setCourses(event.data.courses);
        }
      };
    } catch {
      // ignore if unsupported
    }

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Sync courses to storage & Cloud Firestore whenever modified
  const updateCoursesState = (newCourses: Course[]) => {
    lastLocalWriteTimeRef.current = Date.now();
    setCourses(newCourses);
    saveCourses(newCourses);

    // Broadcast update to all other open browser tabs
    try {
      const channel = new BroadcastChannel('myedu_sync_channel');
      channel.postMessage({ type: 'COURSES_UPDATED', courses: newCourses });
      channel.close();
    } catch {
      // ignore
    }

    if (isFirebaseConfigured) {
      syncToCloud({ courses: newCourses }).catch(err => console.warn('Cloud sync error:', err));
    }
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

  // Dedicated Taxonomy Sync Helpers (Local Storage + Cloud Firestore)
  const updateCategoriesState = (updated: string[]) => {
    lastLocalWriteTimeRef.current = Date.now();
    setCategories(updated);
    saveCategories(updated);
    if (isFirebaseConfigured) {
      syncToCloud({ categories: updated }).catch(err => console.warn('Category sync error:', err));
    }
  };

  const updateSourcesState = (updated: string[]) => {
    lastLocalWriteTimeRef.current = Date.now();
    setSources(updated);
    saveSources(updated);
    if (isFirebaseConfigured) {
      syncToCloud({ sources: updated }).catch(err => console.warn('Source sync error:', err));
    }
  };

  const updateInstructorsState = (updated: string[]) => {
    lastLocalWriteTimeRef.current = Date.now();
    setInstructors(updated);
    saveInstructors(updated);
    if (isFirebaseConfigured) {
      syncToCloud({ instructors: updated }).catch(err => console.warn('Instructor sync error:', err));
    }
  };

  // Dynamic Category Handlers
  const handleAddCategory = (newCat: string) => {
    const updated = [...categories, newCat];
    updateCategoriesState(updated);
  };

  const handleRenameCategory = (oldCat: string, newCat: string) => {
    const updatedCategories = categories.map(c => c === oldCat ? newCat : c);
    updateCategoriesState(updatedCategories);

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
    updateCategoriesState(updatedCategories);

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
    updateSourcesState(updated);
  };

  const handleRenameSource = (oldSource: string, newSource: string) => {
    const updatedSources = sources.map(s => s === oldSource ? newSource : s);
    updateSourcesState(updatedSources);

    const updatedCourses = courses.map(c => 
      c.sourcePlatform === oldSource ? { ...c, sourcePlatform: newSource } : c
    );
    updateCoursesState(updatedCourses);
  };

  const handleDeleteSource = (sourceToDelete: string) => {
    const updatedSources = sources.filter(s => s !== sourceToDelete);
    updateSourcesState(updatedSources);

    const fallbackSrc = updatedSources[0] || 'Khác';
    const updatedCourses = courses.map(c => 
      c.sourcePlatform === sourceToDelete ? { ...c, sourcePlatform: fallbackSrc } : c
    );
    updateCoursesState(updatedCourses);
  };

  // Dynamic Instructor Handlers
  const handleAddInstructor = (newInst: string) => {
    const updated = [...instructors, newInst];
    updateInstructorsState(updated);
  };

  const handleRenameInstructor = (oldInst: string, newInst: string) => {
    const updatedInstructors = instructors.map(i => i === oldInst ? newInst : i);
    updateInstructorsState(updatedInstructors);

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
    updateInstructorsState(updatedInstructors);

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
      if (isFirebaseConfigured) {
        syncToCloud({ continueProgress: progress });
      }
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
        const updatedChapters = (c.chapters || []).map((ch) => ({
          ...ch,
          lessons: (ch.lessons || []).map((l) => {
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
      if (isFirebaseConfigured) {
        syncToCloud({ userStats: updatedStats }).catch(err => console.warn('Stats sync error:', err));
      }
    }
  };

  // Toggle Lesson Star / Bookmark
  const handleToggleStar = (lessonId: string, specificCourseId?: string) => {
    const targetCourseId = specificCourseId || activeCourseId;
    if (!targetCourseId) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === targetCourseId) {
        const updatedChapters = (c.chapters || []).map((ch) => ({
          ...ch,
          lessons: (ch.lessons || []).map((l) => (l.id === lessonId ? { ...l, isStarred: !l.isStarred } : l)),
        }));
        return { ...c, chapters: updatedChapters };
      }
      return c;
    });

    updateCoursesState(updatedCourses);
  };

  // Update Notes for specific lesson
  const handleUpdateNotes = (lessonId: string, notes: string) => {
    if (!activeCourseId || !lessonId) return;

    const updatedCourses = courses.map((c) => {
      if (c.id === activeCourseId) {
        const updatedChapters = (c.chapters || []).map((ch) => ({
          ...ch,
          lessons: (ch.lessons || []).map((l) => (l.id === lessonId ? { ...l, notes } : l)),
        }));
        return { ...c, chapters: updatedChapters };
      }
      return c;
    });

    updateCoursesState(updatedCourses);
  };

  // Update Duration for specific lesson
  const handleUpdateLessonDuration = (lessonId: string, durationMinutes: number, specificCourseId?: string) => {
    const targetCourseId = specificCourseId || activeCourseId;
    if (!targetCourseId || !lessonId || !durationMinutes || durationMinutes <= 0) return;

    let hasChanged = false;
    const updatedCourses = courses.map((c) => {
      if (c.id === targetCourseId) {
        const updatedChapters = (c.chapters || []).map((ch) => ({
          ...ch,
          lessons: (ch.lessons || []).map((l) => {
            if (l.id === lessonId && l.durationMinutes !== durationMinutes) {
              hasChanged = true;
              return { ...l, durationMinutes };
            }
            return l;
          }),
        }));
        return hasChanged ? { ...c, chapters: updatedChapters, updatedAt: new Date().toISOString() } : c;
      }
      return c;
    });

    if (hasChanged) {
      updateCoursesState(updatedCourses);
    }
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

  const handleBatchDeleteCourses = (courseIds: string[]) => {
    if (!courseIds || courseIds.length === 0) return;
    const updated = courses.filter(c => !courseIds.includes(c.id));
    updateCoursesState(updated);

    if (activeCourseId && courseIds.includes(activeCourseId)) {
      setActiveCourseId(null);
      setActiveLessonId(null);
      setCurrentView('home');
      window.location.hash = '#/';
    }

    if (continueProgress && courseIds.includes(continueProgress.courseId)) {
      setContinueProgress(null);
      localStorage.removeItem('myedu_continue_progress_v1');
    }
  };

  const handleBatchUpdateCategory = (courseIds: string[], newCat: string) => {
    if (!courseIds || courseIds.length === 0) return;
    const updated = courses.map(c => 
      courseIds.includes(c.id) ? { ...c, category: newCat } : c
    );
    updateCoursesState(updated);
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

  const handleAppendLessonsToChapter = (targetCourseId: string, targetChapterId: string, newLessons: Lesson[]) => {
    const updated = courses.map(c => {
      if (c.id === targetCourseId) {
        return {
          ...c,
          chapters: c.chapters.map(ch => {
            if (ch.id === targetChapterId) {
              return {
                ...ch,
                lessons: [...ch.lessons, ...newLessons]
              };
            }
            return ch;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    updateCoursesState(updated);
  };

  const handleRestoreCourses = (restoredCourses: Course[]) => {
    updateCoursesState(restoredCourses);
    const cats = Array.from(new Set(restoredCourses.map(c => c.category?.trim()).filter(Boolean))) as string[];
    if (cats.length > 0) updateCategoriesState(cats);
    const srcs = Array.from(new Set(restoredCourses.map(c => c.sourcePlatform?.trim()).filter(Boolean))) as string[];
    if (srcs.length > 0) updateSourcesState(srcs);
    const insts = Array.from(new Set(restoredCourses.map(c => c.instructor?.trim()).filter(Boolean))) as string[];
    if (insts.length > 0) updateInstructorsState(insts);
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
              onBatchDeleteCourses={handleBatchDeleteCourses}
              onBatchUpdateCategory={handleBatchUpdateCategory}
            />
          </div>
        )}

        {/* VIEW 2: Player Workspace */}
        {currentView === 'player' && activeCourse && activeLesson && (
          <div className="space-y-4">
            
            {/* Interactive Hierarchical Breadcrumb & Quick Action Toolbar */}
            {!isZenMode && (
              <div className="pb-1 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                {/* Direct Action Buttons for Active Course */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => handleEditCourse(activeCourse)}
                    title="Chỉnh sửa toàn bộ thông tin & giáo trình khóa này"
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-slate-950 border border-teal-500/30 hover:border-teal-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa Khóa Học</span>
                  </button>

                  <button
                    onClick={() => {
                      setBulkCourseId(activeCourse.id);
                      setIsBulkModalOpen(true);
                    }}
                    title="Nạp nhanh bài học vào khóa này"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Nạp Thêm Bài</span>
                  </button>
                </div>
              </div>
            )}

            {/* Single Persistent Player Layout (Prevents video reload when Zen Mode is toggled) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className={`transition-all duration-300 space-y-5 ${
                isZenMode ? 'lg:col-span-12 max-w-6xl mx-auto w-full pt-1' : 'lg:col-span-8'
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
                  onUpdateDuration={handleUpdateLessonDuration}
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
                    onUpdateDuration={handleUpdateLessonDuration}
                    onBackToCourseList={() => setCurrentView('home')}
                    onOpenBulkImportForCourse={(cId) => {
                      setBulkCourseId(cId);
                      setIsBulkModalOpen(true);
                    }}
                    onEditCourse={handleEditCourse}
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
            onBatchDeleteCourses={handleBatchDeleteCourses}
            onBatchUpdateCategory={handleBatchUpdateCategory}
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
        onAppendLessonsToChapter={handleAppendLessonsToChapter}
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
