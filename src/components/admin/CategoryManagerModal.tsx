import React, { useState } from 'react';
import { Course } from '../../types';
import { X, Plus, Trash2, Edit2, Check, Tags, Globe, Sparkles, BookOpen } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  sources: string[];
  courses: Course[];
  onAddCategory: (cat: string) => void;
  onRenameCategory: (oldCat: string, newCat: string) => void;
  onDeleteCategory: (cat: string) => void;
  onAddSource: (source: string) => void;
  onRenameSource: (oldSource: string, newSource: string) => void;
  onDeleteSource: (source: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  sources,
  courses,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddSource,
  onRenameSource,
  onDeleteSource,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'sources'>('categories');
  
  // Category states
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState<string>('');

  // Source states
  const [newSourceInput, setNewSourceInput] = useState<string>('');
  const [editingSourceIndex, setEditingSourceIndex] = useState<number | null>(null);
  const [editingSourceValue, setEditingSourceValue] = useState<string>('');

  if (!isOpen) return null;

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }
    onAddCategory(trimmed);
    setNewCatInput('');
  };

  const handleSaveEditCat = (oldCat: string) => {
    const trimmed = editingCatValue.trim();
    if (!trimmed || trimmed === oldCat) {
      setEditingCatIndex(null);
      return;
    }
    onRenameCategory(oldCat, trimmed);
    setEditingCatIndex(null);
  };

  const handleDeleteCat = (catToDelete: string) => {
    const courseCount = courses.filter(c => c.category === catToDelete).length;
    const msg = courseCount > 0
      ? `Danh mục "${catToDelete}" đang có ${courseCount} khóa học. Nếu xóa, các khóa học này sẽ được chuyển về danh mục khác. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa danh mục "${catToDelete}"?`;

    if (confirm(msg)) {
      onDeleteCategory(catToDelete);
    }
  };

  // Source Handlers
  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSourceInput.trim();
    if (!trimmed) return;
    if (sources.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      alert('Nguồn này đã tồn tại!');
      return;
    }
    onAddSource(trimmed);
    setNewSourceInput('');
  };

  const handleSaveEditSource = (oldSrc: string) => {
    const trimmed = editingSourceValue.trim();
    if (!trimmed || trimmed === oldSrc) {
      setEditingSourceIndex(null);
      return;
    }
    onRenameSource(oldSrc, trimmed);
    setEditingSourceIndex(null);
  };

  const handleDeleteSrc = (srcToDelete: string) => {
    if (confirm(`Bạn có chắc muốn xóa nguồn "${srcToDelete}"?`)) {
      onDeleteSource(srcToDelete);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Quản Lý Danh Mục & Nguồn Khóa Học</h2>
              <p className="text-xs text-slate-400">Các thay đổi sẽ cập nhật tự động lên toàn bộ bộ lọc và khóa học</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1.5 border-b border-slate-800/80 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tags className="w-3.5 h-3.5" />
            <span>Danh Mục ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex-1 py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sources'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Nguồn Mua ({sources.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              {/* Add form */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Thêm danh mục mới (ví dụ: Thiết kế UI/UX, Tài chính...)"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {categories.map((cat, idx) => {
                  const count = courses.filter(c => c.category.trim().toLowerCase() === cat.trim().toLowerCase()).length;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs"
                    >
                      {editingCatIndex === idx ? (
                        <div className="flex-1 flex items-center gap-2 mr-2">
                          <input
                            type="text"
                            value={editingCatValue}
                            onChange={(e) => setEditingCatValue(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCat(cat)}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{cat}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                            {count} khóa học
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {editingCatIndex !== idx && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatIndex(idx);
                              setEditingCatValue(cat);
                            }}
                            title="Đổi tên danh mục"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteCat(cat)}
                          title="Xóa danh mục"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SOURCES */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              {/* Add form */}
              <form onSubmit={handleAddSource} className="flex gap-2">
                <input
                  type="text"
                  value={newSourceInput}
                  onChange={(e) => setNewSourceInput(e.target.value)}
                  placeholder="Thêm nguồn mới (ví dụ: Udemy, VietJack, KTcity...)"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {sources.map((src, idx) => {
                  const count = courses.filter(c => c.sourcePlatform === src).length;

                  return (
                    <div
                      key={src}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs"
                    >
                      {editingSourceIndex === idx ? (
                        <div className="flex-1 flex items-center gap-2 mr-2">
                          <input
                            type="text"
                            value={editingSourceValue}
                            onChange={(e) => setEditingSourceValue(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditSource(src)}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{src}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400">
                            {count} khóa học
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {editingSourceIndex !== idx && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSourceIndex(idx);
                              setEditingSourceValue(src);
                            }}
                            title="Đổi tên nguồn"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteSrc(src)}
                          title="Xóa nguồn"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
