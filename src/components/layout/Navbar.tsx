import React from 'react';
import { 
  GraduationCap, 
  Search, 
  Settings, 
  Keyboard, 
  Home, 
  Bookmark, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { UserStats } from '../../types';

interface NavbarProps {
  currentView: 'home' | 'player' | 'favorites';
  onNavigateHome: () => void;
  onNavigateFavorites: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenStudio: () => void;
  onOpenShortcuts: () => void;
  totalCoursesCount: number;
  starredCount: number;
  userStats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onNavigateFavorites,
  searchQuery,
  onSearchChange,
  onOpenStudio,
  onOpenShortcuts,
  totalCoursesCount,
  starredCount,
  userStats,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MyEdu</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Abyss Lean
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Personal Learning Workspace</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm khóa học, giảng viên, nguồn mua, tag..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Learning Streak & Today's Goal Pills */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <div 
                title={`Chuỗi học liên tục: ${userStats.streak} ngày`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold"
              >
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{userStats.streak} ngày</span>
              </div>

              {userStats.todayCompletedCount > 0 && (
                <div 
                  title={`Hôm nay đã hoàn thành ${userStats.todayCompletedCount} bài giảng`}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>+{userStats.todayCompletedCount} bài</span>
                </div>
              )}
            </div>

            <button
              onClick={onNavigateHome}
              title="Trang chủ"
              className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Khóa học</span>
              <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-400">
                {totalCoursesCount}
              </span>
            </button>

            <button
              onClick={onNavigateFavorites}
              title="Bài giảng đã ghim"
              className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'favorites'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Đã ghim</span>
              {starredCount > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md">
                  {starredCount}
                </span>
              )}
            </button>

            {/* Unified Course Studio Admin Hub */}
            <button
              onClick={onOpenStudio}
              title="Mở Trung Tâm Quản Trị Khóa Học (Studio)"
              className="bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Quản Trị</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

            <button
              onClick={onOpenShortcuts}
              title="Danh sách phím tắt"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài giảng, giảng viên..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
