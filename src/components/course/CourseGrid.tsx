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
      
      {/* 1. Integrated Filter Hub (Category Pills Wrapped + Source & Instructor) */}
      <FilterHub
        courses={courses}
        categories={categories}
        sources={sources}
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
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Danh Sách Khóa Học
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
            {filteredCourses.length} khóa phù hợp
          </span>
        </div>
      </div>

      {/* 3. Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Không tìm thấy khóa học nào</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            {searchQuery
              ? `Không có kết quả nào phù hợp với từ khóa "${searchQuery}".`
              : `Hiện chưa có khóa học nào khớp với bộ lọc đang chọn.`}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Đặt lại toàn bộ lọc
            </button>
            <button
              onClick={onAddNewCourse}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              + Tạo khóa học mới
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCourse={onSelectCourse}
              onOpenBulkImport={() => onOpenBulkImport(course.id)}
              onEditCourse={onEditCourse}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </div>
      )}

    </div>
  );
};
