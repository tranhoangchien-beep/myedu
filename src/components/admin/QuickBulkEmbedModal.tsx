import React, { useState, useMemo } from 'react';
import { Zap, X, Check, FileVideo, Layers, ArrowUpDown, RefreshCw } from 'lucide-react';
import { parseBulkLessonInput, createLessonsFromParsed } from '../../lib/bulkParser';
import { Lesson } from '../../types';

interface QuickBulkEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: { id: string; title: string }[];
  defaultChapterId?: string;
  onImportLessons: (targetChapterId: string, newLessons: Lesson[]) => void;
}

export const QuickBulkEmbedModal: React.FC<QuickBulkEmbedModalProps> = ({
  isOpen,
  onClose,
  chapters,
  defaultChapterId,
  onImportLessons,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(defaultChapterId || chapters[0]?.id || '');
  const [reverseOrder, setReverseOrder] = useState<boolean>(true); // Default true since Abyss exports 7 down to 1

  // Auto update selectedChapterId when chapters change or modal opens
  React.useEffect(() => {
    if (defaultChapterId) {
      setSelectedChapterId(defaultChapterId);
    } else if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [defaultChapterId, chapters]);

  // Live parse input
  const parsedItems = useMemo(() => {
    return parseBulkLessonInput(rawText, 'Bài', reverseOrder);
  }, [rawText, reverseOrder]);

  const validItems = useMemo(() => {
    return parsedItems.filter(item => item.isValid);
  }, [parsedItems]);

  if (!isOpen) return null;

  const handleImport = () => {
    if (validItems.length === 0 || !selectedChapterId) return;
    const lessons = createLessonsFromParsed(validItems);
    onImportLessons(selectedChapterId, lessons);
    setRawText('');
    onClose();
  };

  const sampleAbyssFormat = `7 Xác định mục tiêu tài chính.mp4|https://player.abyssplayer.com/58_ZxuvA0|<iframe src="https://player.abyssplayer.com/58_ZxuvA0"></iframe>
6 Lãi suất kép.mp4|https://player.abyssplayer.com/i3Uz0dvOn|<iframe src="https://player.abyssplayer.com/i3Uz0dvOn"></iframe>
1 Tài chính cá nhân là gì.mp4|https://player.abyssplayer.com/jhgvxwpVp|<iframe src="https://player.abyssplayer.com/jhgvxwpVp"></iframe>`;

  const sampleStreamtapeFormat = `https://streamtape.com/v/GX1RoloXYVi1X4p/%2310.1_D%C3%B9ng_Tool_N%C3%A0o_Hi%E1%BB%87u_Qu%E1%BA%A3_T%E1%BB%91t_Nh%E1%BA%A5t.mp4
https://streamtape.com/v/rbVq81QzpKUbm87/%2310.2_Roadmap_%C4%90%E1%BB%83_T%E1%BB%B1_H%E1%BB%8Dc_v%E1%BB%9Bi_AI.mp4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Nhập Nhanh Hàng Loạt Video (Streamtape & Abyss)
              </h2>
              <p className="text-xs text-slate-400">
                Hỗ trợ dán trực tiếp danh sách link Streamtape, Abyss (TenFile.mp4|Link|Iframe), BBCode, HTML hoặc ID
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          
          {/* Target Chapter Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Chương tiếp nhận bài giảng:</span>
            </label>

            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none min-w-[220px]"
            >
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Raw Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileVideo className="w-4 h-4 text-emerald-400" />
                Dán văn bản bài giảng (Abyss Embed Multi-select):
              </span>
              <button
                type="button"
                onClick={() => setRawText(sampleAbyssFormat)}
                className="text-[11px] text-emerald-400 hover:underline font-semibold"
              >
                + Thử dữ liệu mẫu
              </button>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Dán danh sách copy từ Abyss.to vào đây...\nVí dụ:\n7 Xác định mục tiêu tài chính.mp4|https://player.abyssplayer.com/58_ZxuvA0|<iframe...>\n6 Lãi suất kép.mp4|https://player.abyssplayer.com/i3Uz0dvOn|<iframe...>`}
              rows={6}
              className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-600 focus:border-emerald-500/60 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Options & Settings */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={reverseOrder}
                onChange={(e) => setReverseOrder(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                Tự động đảo ngược danh sách (đổi từ 7 &rarr; 1 thành 1 &rarr; 7)
              </span>
            </label>

            <span className="text-[11px] text-slate-500 font-mono">
              Tự loại bỏ đuôi .mp4
            </span>
          </div>

          {/* Live Preview List */}
          {parsedItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Xem Trước Kết Quả ({validItems.length}/{parsedItems.length} bài hợp lệ):
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 custom-scrollbar">
                {parsedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                      item.isValid
                        ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium truncate pr-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 text-[10px] font-bold font-mono text-emerald-400 border border-slate-800 flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="truncate font-bold">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.providerLabel && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.providerLabel}
                        </span>
                      )}
                      {item.isValid ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Hợp lệ
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-semibold">
                          Thiếu link
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={validItems.length === 0 || !selectedChapterId}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Zap className="w-4 h-4" />
            <span>Nhập {validItems.length} Bài Giảng Vào Chương</span>
          </button>
        </div>

      </div>
    </div>
  );
};
