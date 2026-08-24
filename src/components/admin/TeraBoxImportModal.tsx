import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  Key, 
  Play, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { 
  parseTeraBoxInput, 
  getStoredCloudConfig, 
  saveStoredCloudConfig, 
  dispatchToStreamtape, 
  createLessonsFromDispatch,
  CloudApiConfig,
  DispatchProgressItem,
  DispatchDestination
} from '../../lib/teraboxBridge';
import { Lesson } from '../../types';

interface TeraBoxImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: { id: string; title: string }[];
  defaultChapterId?: string;
  onImportLessons: (targetChapterId: string, newLessons: Lesson[]) => void;
}

export const TeraBoxImportModal: React.FC<TeraBoxImportModalProps> = ({
  isOpen,
  onClose,
  chapters,
  defaultChapterId,
  onImportLessons,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(defaultChapterId || chapters[0]?.id || '');
  const [destination, setDestination] = useState<DispatchDestination>('streamtape');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<CloudApiConfig>(() => getStoredCloudConfig());
  
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [progressItems, setProgressItems] = useState<DispatchProgressItem[]>([]);

  useEffect(() => {
    if (defaultChapterId) {
      setSelectedChapterId(defaultChapterId);
    } else if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [defaultChapterId, chapters]);

  // Live parse input
  const parsedItems = useMemo(() => {
    return parseTeraBoxInput(rawText, 'Bài');
  }, [rawText]);

  const validItems = useMemo(() => {
    return parsedItems.filter(item => item.isValid);
  }, [parsedItems]);

  const handleSaveConfig = () => {
    saveStoredCloudConfig(config);
    setIsConfigOpen(false);
  };

  const handleStartDispatch = async () => {
    if (validItems.length === 0 || !selectedChapterId) return;

    setIsDispatching(true);
    const initialProgress: DispatchProgressItem[] = validItems.map(item => ({
      id: item.id,
      title: item.title,
      teraboxUrl: item.teraboxUrl,
      status: 'idle',
    }));
    setProgressItems(initialProgress);

    const updatedProgress = [...initialProgress];

    for (let i = 0; i < updatedProgress.length; i++) {
      const item = updatedProgress[i];
      item.status = 'processing';
      setProgressItems([...updatedProgress]);

      if (destination === 'streamtape' || destination === 'both') {
        const res = await dispatchToStreamtape(item.teraboxUrl, `${item.title}.mp4`, config);
        if (res.success && res.streamtapeUrl) {
          item.streamtapeUrl = res.streamtapeUrl;
          item.status = 'success';
        } else {
          item.status = 'error';
          item.errorMessage = res.error;
        }
      } else {
        // Fallback for offline/direct TeraBox link
        item.status = 'success';
      }

      setProgressItems([...updatedProgress]);
    }

    setIsDispatching(false);
  };

  const handleFinalizeImport = () => {
    if (progressItems.length === 0 || !selectedChapterId) return;
    const lessons = createLessonsFromDispatch(progressItems);
    onImportLessons(selectedChapterId, lessons);
    setRawText('');
    setProgressItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Bộ Điều Phối Nạp Video Từ TeraBox
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-extrabold uppercase">
                  Cloud Dispatcher
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Bắn video từ kho TeraBox (1TB) sang Streamtape / Abyss để phát mượt mà trên MyEdu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(prev => !prev)}
              title="Cấu hình API Key của Streamtape & Abyss"
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isConfigOpen 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20' 
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Cấu hình API</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          
          {/* API Configuration Panel */}
          {isConfigOpen && (
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cấu hình API Kết nối Đám mây</span>
                </h4>
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                >
                  Lưu Cấu Hình
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Streamtape API-Login:</label>
                  <input
                    type="text"
                    value={config.streamtapeLogin}
                    onChange={(e) => setConfig({ ...config, streamtapeLogin: e.target.value.trim() })}
                    placeholder="Ví dụ: y7bhafa3bxfxudzk"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Streamtape API-Key:</label>
                  <input
                    type="password"
                    value={config.streamtapeKey}
                    onChange={(e) => setConfig({ ...config, streamtapeKey: e.target.value.trim() })}
                    placeholder="Ví dụ: dq6hzjewe27bmwdn"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                * Lấy API Login & Key tại: <a href="https://streamtape.com/accpanel" target="_blank" rel="noreferrer" className="text-cyan-400 underline">streamtape.com/accpanel</a> (Tab Account Settings).
              </p>
            </div>
          )}

          {/* Chapter & Destination Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Chapter Selection */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chương tiếp nhận bài:</span>
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
              >
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
              </select>
            </div>

            {/* Destination Selection */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nền tảng đích đẩy sang:</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDestination('streamtape')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    destination === 'streamtape'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Streamtape (Ưu tiên)
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('both')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    destination === 'both'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Dự Phòng Kép
                </button>
              </div>
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Dán danh sách link TeraBox (Mỗi dòng 1 link hoặc Tên bài | Link):
              </label>
              <span className="text-xs text-slate-500">
                Hợp lệ: <strong className="text-cyan-400">{validItems.length}</strong> bài
              </span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`#10.1 Dùng Tool Nào Hiệu Quả Nhất | https://terabox.com/s/1GX1RoloXYVi1X4p\n#10.2 Roadmap Tự Học AI | https://teraboxapp.com/s/1rbVq81QzpKUbm87`}
              rows={6}
              disabled={isDispatching}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Dispatch Progress List */}
          {progressItems.length > 0 && (
            <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>Tiến trình đẩy video sang Cloud:</span>
                <span className="text-cyan-400 font-mono">
                  {progressItems.filter(p => p.status === 'success').length}/{progressItems.length} hoàn thành
                </span>
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {progressItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate mr-2">
                      {item.status === 'processing' && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />}
                      {item.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      {item.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                      {item.status === 'idle' && <Play className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                      <span className="text-slate-200 truncate">{item.title}</span>
                    </div>

                    <div className="flex-shrink-0 text-[11px]">
                      {item.status === 'processing' && <span className="text-cyan-400 font-bold">Đang đẩy...</span>}
                      {item.status === 'success' && <span className="text-emerald-400 font-bold">Đã sẵn sàng</span>}
                      {item.status === 'error' && <span className="text-rose-400 font-bold" title={item.errorMessage}>Lỗi API</span>}
                      {item.status === 'idle' && <span className="text-slate-500">Chờ xử lý</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Hủy Bỏ
          </button>

          <div className="flex items-center gap-3">
            {progressItems.length > 0 && progressItems.some(p => p.status === 'success') ? (
              <button
                onClick={handleFinalizeImport}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Hoàn Tất & Nạp Vào Khóa Học</span>
              </button>
            ) : (
              <button
                onClick={handleStartDispatch}
                disabled={validItems.length === 0 || !selectedChapterId || isDispatching}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Đẩy Video Sang Cloud...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Bắt Đầu Đẩy Sang {destination === 'both' ? 'Cả 2 Cloud' : 'Streamtape'} ({validItems.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
