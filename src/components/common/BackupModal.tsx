import React, { useRef, useState } from 'react';
import { Course } from '../../types';
import { X, Database, Download, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { INITIAL_SAMPLE_COURSES, validateCoursesSchema } from '../../lib/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onRestoreCourses: (courses: Course[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  courses,
  onRestoreCourses,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Export JSON backup file
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(courses, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `myedu_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMessage(`Đã xuất file sao lưu: ${filename}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Import JSON backup file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validated = validateCoursesSchema(parsed);
        if (validated.length > 0) {
          onRestoreCourses(validated);
          setSuccessMessage(`Khôi phục thành công ${validated.length} khóa học!`);
          setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 1500);
        } else {
          setErrorMessage('Định dạng tệp JSON không hợp lệ hoặc không có khóa học.');
        }
      } catch (err) {
        setErrorMessage('Không thể đọc tệp sao lưu. Vui lòng kiểm tra lại!');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial sample data
  const handleResetSample = () => {
    if (confirm('Khôi phục lại dữ liệu mẫu gốc? Dữ liệu hiện tại sẽ được thay thế.')) {
      onRestoreCourses(INITIAL_SAMPLE_COURSES);
      setSuccessMessage('Đã khôi phục dữ liệu mẫu gốc.');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0f24]/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.15)] p-6 space-y-4">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database className="w-5 h-5" />
            <h3 className="font-extrabold text-white text-base font-mono uppercase tracking-wide">
              Sao Lưu & Vault // BACKUP
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#060813] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          Tất cả dữ liệu khóa học, tiến độ và ghi chú được mã hóa và lưu trữ an toàn. Bạn có thể xuất file JSON để lưu trữ ngoại tuyến hoặc di chuyển thiết bị.
        </p>

        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 shadow-[0_0_10px_rgba(0,255,157,0.2)]">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full p-3 rounded-xl bg-[#060813] hover:bg-[#0e1633] border border-cyan-500/20 hover:border-cyan-400/50 text-left flex items-center justify-between text-xs transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white font-mono">Xuất File JSON Vault</p>
                <p className="text-slate-400 text-[11px]">Tải về toàn bộ {courses.length} khóa học & tiến độ</p>
              </div>
            </div>
          </button>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-xl bg-[#060813] hover:bg-[#0e1633] border border-cyan-500/20 hover:border-teal-400/50 text-left flex items-center justify-between text-xs transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-400 group-hover:text-slate-950 transition-colors shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white font-mono">Nhập Khôi Phục JSON Vault</p>
                <p className="text-slate-400 text-[11px]">Khôi phục dữ liệu từ tệp sao lưu trước đó</p>
              </div>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Reset to Default */}
          <button
            onClick={handleResetSample}
            className="w-full p-3 rounded-xl bg-[#060813] hover:bg-[#0e1633] border border-cyan-500/15 hover:border-amber-400/40 text-left flex items-center justify-between text-xs transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-300 group-hover:text-white font-mono">Nạp Dữ Liệu Mẫu Mặc Định</p>
                <p className="text-slate-500 text-[11px]">Tải lại các khóa học mẫu ban đầu</p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#060813] hover:bg-[#0e1633] border border-cyan-500/20 text-slate-300 font-mono text-xs rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

