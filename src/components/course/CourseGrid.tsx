import React from 'react';
import { Course } from '../../types';
import { CourseCard } from './CourseCard';
import { FilterHub } from './FilterHub';
import { PlusCircle, Search } from 'lucide-react';

interface CourseGridProps {
  courses: Course[];
  searchQuery: string;
  categories: string[];
  sources: string[];
  instructors?: string[];
  selectedCategory: string;
  selectedSource: string;
  selectedInstructor: string;
  onSelectCategory: (cat: string) => void;
  onSelectSource: (source: string) => void;
  onSelectInstructor: (instructor: string) => void;
  onResetFilters: () => void;
  onSelectCourse: (courseId: string) => void;
  onOpenBulkImport: (courseId?: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddNewCourse: () => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  courses,
  searchQuery,
  categories,
  sources,
  instructors = [],
  selectedCategory,
  selectedSource,
  selectedInstructor,
  onSelectCategory,
  onSelectSource,
  onSelectInstructor,
  onResetFilters,
  onSelectCourse,
  onOpenBulkImport,
  onEditCourse,
  onDeleteCourse,
  onAddNewCourse,
}) => {
  // Triple-dimension multi-filter
  const filteredCourses = courses.filter((course) => {
    // 1. Filter by category
    if (selectedCategory && selectedCategory !== 'Tất cả') {
      const selectedNorm = selectedCategory.trim().toLowerCase();
      const courseNorm = (course.category || '').trim().toLowerCase();
      if (courseNorm !== selectedNorm) {
        return false;
      }
    }

    // 2. Filter by source platform
    if (selectedSource && selectedSource !== 'Tất cả') {
      const selectedSrcNorm = selectedSource.trim().toLowerCase();
      const courseSrcNorm = (course.sourcePlatform || '').trim().toLowerCase();
      if (courseSrcNorm !== selectedSrcNorm) {
        return false;
      }
    }

    // 3. Filter by instructor / author
    if (selectedInstructor && selectedInstructor !== 'Tất cả') {
      const selectedInstNorm = selectedInstructor.trim().toLowerCase();
      const courseInstNorm = (course.instructor || '').trim().toLowerCase();
      if (courseInstNorm !== selectedInstNorm) {
        return false;
      }
    }

    // 4. Filter by search query (Title, Description, Tags, Instructor, Lessons)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = course.title.toLowerCase().includes(q);
      const matchDesc = (course.description || '').toLowerCase().includes(q);
      const matchInstructor = (course.instructor || '').toLowerCase().includes(q);
      const matchSource = (course.sourcePlatform || '').toLowerCase().includes(q);
      const matchTags = course.tags && course.tags.some(t => t.toLowerCase().includes(q));
      
      const matchLessons = course.chapters.some(ch =>
        ch.lessons.some(l => l.title.toLowerCase().includes(q))
      );

      return matchTitle || matchDesc || matchInstructor || matchSource || matchTags || matchLessons;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Integrated Cascading Filter Hub */}
      <FilterHub
        courses={courses}
        categories={categories}
        sources={sources}
        instructors={instructors}
        selectedCategory={selectedCategory}
        selectedSource={selectedSource}
        selectedInstructor={selectedInstructor}
        onSelectCategory={onSelectCategory}
        onSelectSource={onSelectSource}
        onSelectInstructor={onSelectInstructor}
        onResetFilters={onResetFilters}
      />

      {/* 2. Course Grid Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {selectedCategory === 'Tất cả' ? 'Toàn Bộ Khóa Học' : selectedCategory}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
            {filteredCourses.length} khóa
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onAddNewCourse}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo Khóa Mới</span>
        </button>
      </div>

      {/* 3. Courses Grid List */}
      {filteredCourses.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">Không tìm thấy khóa học phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có khóa học nào khớp với các tiêu chí lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCourse={onSelectCourse}
              onOpenBulkImport={onOpenBulkImport}
              onEditCourse={onEditCourse}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </div>
      )}

    </div>
  );
};
