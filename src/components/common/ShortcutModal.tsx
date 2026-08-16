import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutModal: React.FC<ShortcutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Chuyển nhanh sang bài học kế tiếp (Next Lesson)' },
    { key: 'P', desc: 'Quay lại bài học trước đó (Previous Lesson)' },
    { key: 'F', desc: 'Bật / Tắt chế độ toàn màn hình (Fullscreen)' },
    { key: 'Space', desc: 'Tạm dừng / Phát video (Trong trình phát)' },
    { key: '← / →', desc: 'Tua lùi / Tiến 5 giây (Trong trình phát)' },
    { key: 'J / L', desc: 'Tua lùi / Tiến 10 giây (Trong trình phát)' },
    { key: 'Esc', desc: 'Thoát chế độ toàn màn hình hoặc đóng cửa sổ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Keyboard className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Phím Tắt Bàn Phím</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Các phím tắt được thiết kế chuẩn theo thói quen YouTube & các ứng dụng video chuyên nghiệp để bạn học nhanh nhất:
        </p>

        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs"
            >
              <span className="text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 font-mono font-bold bg-slate-800 text-emerald-400 rounded-md border border-slate-700 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
