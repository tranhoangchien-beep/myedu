import React from 'react';
import { 
  GraduationCap, 
  Search, 
  Settings, 
  Keyboard, 
  Home, 
  Flame,
  CheckCircle2,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserStats } from '../../types';

interface NavbarProps {
  currentView: 'home' | 'player' | 'favorites' | 'studio';
  onNavigateHome: () => void;
  onNavigateFavorites?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenStudio: () => void;
  onOpenShortcuts: () => void;
  onLogout?: () => void;
  totalCoursesCount: number;
  starredCount?: number;
  userStats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  searchQuery,
  onSearchChange,
  onOpenStudio,
  onOpenShortcuts,
  onLogout,
  totalCoursesCount,
  userStats,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#060813]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400/50 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  MyEdu
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-wider">
                  HUD // v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">Personal E-Learning Engine</p>
            </div>
          </div>

          {/* Search Bar - only shown on home & favorites view, hidden on studio & player to avoid duplicate search inputs */}
          {(currentView === 'home' || currentView === 'favorites') ? (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                <input
                  id="global-search-input"
                  type="text"
                  aria-label="Tìm kiếm khóa học, giảng viên, nguồn mua, tag"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Tìm khóa học, giảng viên, nguồn mua, tag... (Nhấn /)"
                  className="w-full pl-10 pr-12 py-2 text-sm bg-[#0a0f24]/90 border border-cyan-500/20 rounded-xl text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:bg-[#0a0f24] transition-all shadow-inner"
                />
                {!searchQuery && (
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-cyan-400/70 bg-[#060813] border border-cyan-500/20 rounded">
                    /
                  </kbd>
                )}
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-cyan-300"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Achievement Telemetry Badge */}
            <div 
              title={`Thành tích học tập: Chuỗi ${userStats.streak} ngày liên tục • Hôm nay đã học +${userStats.todayCompletedCount || 0} bài`}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0f24]/80 border border-cyan-500/20 text-xs font-mono font-bold text-slate-200 shadow-[0_0_15px_rgba(0,240,255,0.05)]"
            >
              <div className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                <span>{userStats.streak}D</span>
              </div>

              <span className="text-cyan-500/40 font-normal">|</span>

              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>+{userStats.todayCompletedCount || 0} bài</span>
              </div>
            </div>

            <a
              href="#/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  onNavigateHome();
                }
              }}
              aria-label="Về trang chủ danh sách khóa học"
              title="Trang chủ"
              className={`p-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                currentView === 'home'
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-[#0a0f24] border-transparent'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Khóa học</span>
              <span className="text-[11px] font-mono bg-[#060813] px-1.5 py-0.5 rounded-md text-cyan-400 border border-cyan-500/30">
                {totalCoursesCount}
              </span>
            </a>

            {/* Unified Course Studio Admin Hub */}
            <a
              href="#/studio"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  onOpenStudio();
                }
              }}
              aria-label="Mở Trung Tâm Quản Trị Khóa Học Studio"
              title="Mở Trung Tâm Quản Trị Khóa Học (Studio)"
              className={`font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 border ${
                currentView === 'studio'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.1)]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Quản Trị</span>
            </a>

            <div className="h-5 w-[1px] bg-cyan-500/20 mx-0.5 hidden sm:block" />

            <button
              onClick={onOpenShortcuts}
              aria-label="Xem danh sách phím tắt"
              title="Danh sách phím tắt (?)"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0a0f24] border border-transparent hover:border-cyan-500/20 transition-all"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                aria-label="Đăng xuất khỏi tài khoản quản trị"
                title="Đăng xuất"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm bài giảng, giảng viên..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0a0f24] border border-cyan-500/20 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

