import React, { useState, useEffect } from 'react';
import { GraduationCap, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { verifyAdminCredentials, setAuthenticatedSession, getLockoutRemainingSeconds } from '../../lib/auth';

interface MasterLoginViewProps {
  onLoginSuccess: () => void;
}

export const MasterLoginView: React.FC<MasterLoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => getLockoutRemainingSeconds());

  // Timer countdown if locked out
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      const remaining = getLockoutRemainingSeconds();
      setLockoutSeconds(remaining);
      if (remaining <= 0) {
        setErrorMsg(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    if (!username.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await verifyAdminCredentials(username, password);
      if (result.success) {
        await setAuthenticatedSession(remember);
        onLoginSuccess();
      } else {
        setErrorMsg(result.errorMsg || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
        const remaining = getLockoutRemainingSeconds();
        if (remaining > 0) {
          setLockoutSeconds(remaining);
        }
      }
    } catch {
      setErrorMsg('Đã xảy ra lỗi hệ thống khi xác thực PBKDF2.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Centered Gmail Minimalist Login Card */}
      <div className="w-full max-w-[420px] bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-10 shadow-2xl shadow-emerald-950/20 backdrop-blur-2xl space-y-8 animate-fade-in">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/30 mb-1">
            <GraduationCap className="w-7 h-7 text-slate-950 font-bold" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Đăng nhập</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Sử dụng Tài khoản Quản trị viên MyEdu
            </p>
          </div>
        </div>

        {/* Error Feedback Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 pl-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                autoFocus
                required
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 pl-1">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full pl-10 pr-11 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors p-1"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Duy trì đăng nhập trên thiết bị này</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : lockoutSeconds > 0 ? (
                <span className="flex items-center gap-2 text-rose-300 font-mono">
                  <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                  Tạm khóa đăng nhập ({lockoutSeconds}s)
                </span>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Security Badge Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>MyEdu Personal Workspace • Master QTV Security</span>
        </div>

      </div>
    </div>
  );
};
