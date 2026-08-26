import React, { useState, useEffect } from 'react';
import { GraduationCap, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-[#060813] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Cyberpunk Ambient Light Balls */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Cyber Terminal Login Card */}
      <div className="w-full max-w-[420px] bg-[#0a0f24]/90 border border-cyan-500/30 rounded-3xl p-7 sm:p-10 shadow-[0_0_50px_rgba(0,240,255,0.12)] backdrop-blur-2xl space-y-8 animate-fade-in relative z-10">
        
        {/* Top Glowing Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] ring-1 ring-cyan-300 mb-1">
            <GraduationCap className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-1.5 tracking-wider">
              <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              AUTHENTICATION // PORTAL
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Đăng Nhập Quản Trị</h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              MyEdu Master Administrator Access
            </p>
          </div>
        </div>

        {/* Error Feedback Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2.5 animate-shake shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold text-slate-300 pl-1">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin..."
                autoFocus
                required
                className="w-full pl-10 pr-4 py-3 text-sm bg-[#060813] border border-cyan-500/20 rounded-2xl text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all focus:outline-none font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold text-slate-300 pl-1">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-11 py-3 text-sm bg-[#060813] border border-cyan-500/20 rounded-2xl text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all focus:outline-none font-mono shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-cyan-300 transition-colors font-mono">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded bg-[#060813] border-cyan-500/30 text-cyan-400 focus:ring-0 cursor-pointer"
              />
              <span>Duy trì phiên đăng nhập</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.55)] flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : lockoutSeconds > 0 ? (
                <span className="flex items-center gap-2 text-rose-950 font-mono">
                  <ShieldAlert className="w-4 h-4 text-rose-950 animate-pulse" />
                  Tạm khóa ({lockoutSeconds}s)
                </span>
              ) : (
                <>
                  <span className="font-mono">XÁC THỰC TRUY CẬP</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Security Badge Footer */}
        <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>PBKDF2 100,000 Rounds Encryption Vault</span>
        </div>

      </div>
    </div>
  );
};

