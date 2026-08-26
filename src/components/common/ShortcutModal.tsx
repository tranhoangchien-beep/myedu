import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutModal: React.FC<ShortcutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Tìm kiếm nhanh khóa học (Focus Search Bar)' },
    { key: 'M', desc: 'Đóng / Mở thanh Mục lục khóa học' },
    { key: 'N', desc: 'Chuyển nhanh sang bài học kế tiếp (Next Lesson)' },
    { key: 'P', desc: 'Quay lại bài học trước đó (Previous Lesson)' },
    { key: 'F', desc: 'Bật / Tắt chế độ toàn màn hình (Fullscreen)' },
    { key: '?', desc: 'Mở bảng trợ giúp phím tắt HUD' },
    { key: 'Esc', desc: 'Đóng modal / Thoát tìm kiếm / Trở về Trang chủ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0f24]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] p-6 space-y-4">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
          <div className="flex items-center gap-2 text-cyan-400">
            <Keyboard className="w-5 h-5" />
            <h3 className="font-extrabold text-white text-base font-mono uppercase tracking-wide">
              Phím Tắt // KEYBINDS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#060813] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Các phím tắt được thiết kế chuẩn theo phong cách HUD tương tác 1-chạm:
        </p>

        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#060813] border border-cyan-500/20 text-xs hover:border-cyan-500/40 transition-colors"
            >
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 font-mono font-extrabold bg-[#0a0f24] text-cyan-300 rounded-lg border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs font-mono rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            Đã Hiểu (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
