import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Cloud, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  Key, 
  Play, 
  Pause,
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  FolderSearch,
  ListVideo,
  Radio,
  Sparkles,
  Folder,
  FolderPlus,
  CheckSquare,
  Square,
  Zap,
  FileVideo,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  parseTeraBoxInput, 
  getCloudApiConfig, 
  saveStoredCloudConfig, 
  resolveTeraBoxDirectLink,
  dispatchCloudVideo,
  getStreamtapeFolders,
  createStreamtapeFolder,
  createLessonsFromDispatch,
  CloudApiConfig,
  DispatchProgressItem,
  DispatchDestination,
  TeraBoxParsedItem
} from '../../lib/teraboxBridge';
import { Lesson } from '../../types';
import { normalizeDurationMinutes } from '../../lib/storage';

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
  const [destination, setDestination] = useState<DispatchDestination>('both');
  const [progressMap, setProgressMap] = useState<Record<string, { percent: number; speedMBs: number; stage: string }>>({});
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<CloudApiConfig>({
    streamtapeLogin: 'b594c70e5a75cdfaa252',
    streamtapeKey: 'Ore0rexG6gSk2Q',
    abyssApiKey: 'ba8dac0020fbdbe8b3b931285e5acb42',
    teraboxToken: 'YyBEzQx5eHui1iqLnLGobVhdjc_6HrAdN3ni2iD5',
  });
  
  // Streamtape Folder Management
  const [streamtapeFolders, setStreamtapeFolders] = useState<Array<{ id: string; name: string; path?: string; parentId?: string }>>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [parentFolderIdForNew, setParentFolderIdForNew] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);

  // File Scanning & Selection
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedFiles, setScannedFiles] = useState<TeraBoxParsedItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const [progressItems, setProgressItems] = useState<DispatchProgressItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const refreshStreamtapeFolders = async () => {
    const res = await getStreamtapeFolders();
    if (res.success && res.folders) {
      setStreamtapeFolders(res.folders);
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      setStatusMessage(`Đang tạo thư mục "${newFolderName.trim()}" trên Streamtape...`);
      const folderRes = await createStreamtapeFolder(newFolderName.trim(), parentFolderIdForNew);
      if (folderRes.success && folderRes.folderId) {
        const parent = streamtapeFolders.find(f => f.id === parentFolderIdForNew);
        const fullPath = parent ? `${parent.path || parent.name} / ${newFolderName.trim()}` : newFolderName.trim();
        const newItem = {
          id: folderRes.folderId,
          name: newFolderName.trim(),
          path: fullPath,
          parentId: parentFolderIdForNew,
        };
        setStreamtapeFolders(prev => [...prev, newItem]);
        setSelectedFolderId(folderRes.folderId);
        setIsCreatingNewFolder(false);
        setNewFolderName('');
        setStatusMessage(`✓ Đã tạo thư mục Streamtape "${fullPath}" thành công!`);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage(`⚠️ ${folderRes.error || 'Lỗi tạo thư mục trên Streamtape'}`);
      }
    } catch (err: any) {
      setStatusMessage(`⚠️ Lỗi: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getCloudApiConfig().then(cfg => {
        if (cfg) setConfig(cfg);
        refreshStreamtapeFolders();
      });
    }
  }, [isOpen]);

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

  // Auto select all valid items initially
  useEffect(() => {
    if (scannedFiles.length > 0) {
      setSelectedFileIds(new Set(scannedFiles.map(f => f.id)));
    } else {
      const valids = parsedItems.filter(p => p.isValid);
      setSelectedFileIds(new Set(valids.map(p => p.id)));
    }
  }, [scannedFiles, parsedItems]);

  const allAvailableItems = useMemo(() => {
    return scannedFiles.length > 0 ? scannedFiles : parsedItems.filter(item => item.isValid);
  }, [scannedFiles, parsedItems]);

  const activeItemsToProcess = useMemo(() => {
    return allAvailableItems.filter(item => selectedFileIds.has(item.id));
  }, [allAvailableItems, selectedFileIds]);

  const toggleSelectAll = () => {
    if (selectedFileIds.size === allAvailableItems.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(allAvailableItems.map(i => i.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveConfig = async () => {
    await saveStoredCloudConfig(config);
    setIsConfigOpen(false);
    setStatusMessage('✓ Đã cập nhật cấu hình API an toàn');
    setTimeout(() => setStatusMessage(''), 3000);
    // Refresh folders
    getStreamtapeFolders().then(res => {
      if (res.success && res.folders) setStreamtapeFolders(res.folders);
    });
  };

  // Helper tính và format thời lượng video chuẩn xác từ milliseconds
  const formatDuration = (raw?: number) => {
    if (!raw || raw <= 0) return '15:00';
    const totalSec = raw > 10000 ? Math.round(raw / 1000) : Math.round(raw);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getDurationMinutes = (raw?: number) => {
    if (!raw || raw <= 0) return 15;
    const totalSec = raw > 10000 ? Math.round(raw / 1000) : Math.round(raw);
    return Math.max(1, Math.round(totalSec / 60));
  };

  // Quét & Bóc tách thư mục / Link TeraBox để lấy danh sách bài học đầy đủ
  const handleScanTeraBox = async () => {
    const valid = parsedItems.filter(item => item.isValid);
    if (valid.length === 0) return;

    setIsScanning(true);
    setStatusMessage('Đang quét và bóc tách dữ liệu từ TeraBox...');
    const detected: TeraBoxParsedItem[] = [];

    for (let i = 0; i < valid.length; i++) {
      const item = valid[i];
      try {
        const res = await resolveTeraBoxDirectLink(item.teraboxUrl, config.teraboxToken);
        if (res.success && res.files && res.files.length > 0) {
          res.files.forEach((f, fIdx) => {
            const cleanTitle = f.filename.replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
            detected.push({
              id: `scan_${Date.now()}_${i}_${fIdx}`,
              title: cleanTitle || `Bài ${detected.length + 1}`,
              cleanName: cleanTitle,
              teraboxUrl: f.teraboxUrl || item.teraboxUrl,
              path: f.path,
              isValid: true,
              dlink: f.dlink,
              size: f.size,
              duration: f.duration || 15 * 60,
              thumb: f.thumb,
            });
          });
        } else if (res.success && (res.dlink || res.path)) {
          const cleanTitle = (res.filename || item.title).replace(/\.(mp4|webm|mkv|avi|mov|flv|wmv|ts|m4v|3gp)$/i, '').trim();
          detected.push({
            id: `scan_${Date.now()}_${i}`,
            title: cleanTitle,
            cleanName: cleanTitle,
            teraboxUrl: item.teraboxUrl,
            path: res.path || item.path,
            isValid: true,
            dlink: res.dlink,
            size: res.files?.[0]?.size,
            duration: res.duration || 15 * 60,
            thumb: res.thumb,
          });
        } else {
          detected.push(item);
        }
      } catch {
        detected.push(item);
      }
    }

    setScannedFiles(detected);
    setIsScanning(false);
    setStatusMessage(`✓ Đã bóc tách thành công ${detected.length} bài giảng chất lượng cao từ TeraBox!`);
  };

  const handleRetrySingleItem = async (itemId: string) => {
    const targetItem = progressItems.find(p => p.id === itemId);
    if (!targetItem) return;

    targetItem.status = 'processing';
    targetItem.errorMessage = undefined;
    setProgressItems([...progressItems]);

    try {
      const dispatchRes = await dispatchCloudVideo({
        url: targetItem.teraboxUrl,
        dlink: targetItem.dlink,
        path: targetItem.path,
        title: targetItem.title,
        folderId: selectedFolderId,
        streamtapeFolderId: selectedFolderId,
        destination,
        token: config.teraboxToken,
        config,
      });

      if (dispatchRes.success && (dispatchRes.streamtapeUrl || dispatchRes.abyssUrl)) {
        if (dispatchRes.streamtapeUrl) targetItem.streamtapeUrl = dispatchRes.streamtapeUrl;
        if (dispatchRes.abyssUrl) targetItem.abyssUrl = dispatchRes.abyssUrl;
        if (dispatchRes.filename) targetItem.title = dispatchRes.filename;
        if (dispatchRes.duration && dispatchRes.duration > 0) {
          targetItem.durationMinutes = normalizeDurationMinutes(dispatchRes.duration, 15);
        }
        if (dispatchRes.thumb) targetItem.thumbnailUrl = dispatchRes.thumb;
        targetItem.status = 'success';
      } else {
        targetItem.status = 'error';
        targetItem.errorMessage = dispatchRes.error || dispatchRes.errors?.join(', ') || 'Lỗi nạp video sang Cloud';
      }
    } catch (err: any) {
      targetItem.status = 'error';
      targetItem.errorMessage = err.message || 'Lỗi kết nối khi truyền tải video';
    }

    setProgressItems([...progressItems]);
  };

  const handleRetryMissingTarget = async (itemId: string, missingTarget: 'streamtape' | 'abyss') => {
    const targetItem = progressItems.find(p => p.id === itemId);
    if (!targetItem) return;

    targetItem.status = 'processing';
    targetItem.errorMessage = undefined;
    setProgressItems([...progressItems]);

    try {
      const dispatchRes = await dispatchCloudVideo({
        url: targetItem.teraboxUrl,
        dlink: targetItem.dlink,
        path: targetItem.path,
        title: targetItem.title,
        folderId: selectedFolderId,
        streamtapeFolderId: selectedFolderId,
        destination: missingTarget,
        token: config.teraboxToken,
        config,
      });

      if (dispatchRes.success && (dispatchRes.streamtapeUrl || dispatchRes.abyssUrl)) {
        if (dispatchRes.streamtapeUrl) targetItem.streamtapeUrl = dispatchRes.streamtapeUrl;
        if (dispatchRes.abyssUrl) targetItem.abyssUrl = dispatchRes.abyssUrl;
        if (dispatchRes.filename) targetItem.title = dispatchRes.filename;
        if (dispatchRes.duration && dispatchRes.duration > 0) {
          targetItem.durationMinutes = normalizeDurationMinutes(dispatchRes.duration, 15);
        }
        if (dispatchRes.thumb) targetItem.thumbnailUrl = dispatchRes.thumb;
        targetItem.status = 'success';
      } else {
        targetItem.status = 'error';
        targetItem.errorMessage = dispatchRes.error || dispatchRes.errors?.join(', ') || `Lỗi nạp bù sang ${missingTarget === 'abyss' ? 'Abyss' : 'Streamtape'}`;
      }
    } catch (err: any) {
      targetItem.status = 'error';
      targetItem.errorMessage = err.message || `Lỗi kết nối khi nạp bù sang ${missingTarget}`;
    }

    setProgressItems([...progressItems]);
  };

  const handleRetryAllFailed = async () => {
    const failedItems = progressItems.filter(p => p.status === 'error');
    if (failedItems.length === 0) return;

    setIsDispatching(true);
    setIsPaused(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;

    for (const item of failedItems) {
      if (isCancelledRef.current) break;
      while (isPausedRef.current) {
        await new Promise(r => setTimeout(r, 500));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      item.status = 'processing';
      item.errorMessage = undefined;
      setProgressItems([...progressItems]);

      try {
        const dispatchRes = await dispatchCloudVideo({
          url: item.teraboxUrl,
          dlink: item.dlink,
          path: item.path,
          title: item.title,
          folderId: selectedFolderId,
          streamtapeFolderId: selectedFolderId,
          destination,
          token: config.teraboxToken,
          config,
        });

        if (dispatchRes.success && (dispatchRes.streamtapeUrl || dispatchRes.abyssUrl)) {
          if (dispatchRes.streamtapeUrl) item.streamtapeUrl = dispatchRes.streamtapeUrl;
          if (dispatchRes.abyssUrl) item.abyssUrl = dispatchRes.abyssUrl;
          if (dispatchRes.filename) item.title = dispatchRes.filename;
          if (dispatchRes.duration && dispatchRes.duration > 0) {
            item.durationMinutes = normalizeDurationMinutes(dispatchRes.duration, 15);
          }
          if (dispatchRes.thumb) item.thumbnailUrl = dispatchRes.thumb;
          item.status = 'success';
        } else {
          item.status = 'error';
          item.errorMessage = dispatchRes.error || dispatchRes.errors?.join(', ') || 'Lỗi nạp video sang Cloud';
        }
      } catch (err: any) {
        item.status = 'error';
        item.errorMessage = err.message || 'Lỗi kết nối khi truyền tải video';
      }

      setProgressItems([...progressItems]);
    }

    setIsDispatching(false);
  };

  const handlePauseDispatch = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    setStatusMessage('⏸ Đang tạm dừng nạp video. Bạn có thể bấm [Tiếp Tục] bất kỳ lúc nào.');
  };

  const handleResumeDispatch = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    setStatusMessage('▶️ Đang tiếp tục tiến trình nạp video...');
  };

  const handleCancelDispatch = () => {
    isCancelledRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsDispatching(false);
    setStatusMessage('⏹ Đã dừng hẳn tiến trình nạp video.');
  };

  const handleStartDispatch = async () => {
    const baseList = scannedFiles.length > 0 ? scannedFiles : parsedItems.filter(p => p.isValid);
    const items = baseList.filter(item => selectedFileIds.has(item.id));
    if (items.length === 0) return;

    setIsDispatching(true);
    setIsPaused(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;

    const destName = destination === 'both' ? 'Cả 2 Cloud (Streamtape & Abyss)' : destination === 'abyss' ? 'Abyss' : 'Streamtape';
    setStatusMessage(`Đang truyền video chất lượng gốc sang ${destName}...`);

    let finalFolderId = selectedFolderId;
    if (isCreatingNewFolder && newFolderName.trim() && (destination === 'streamtape' || destination === 'both')) {
      try {
        const folderRes = await createStreamtapeFolder(newFolderName.trim());
        if (folderRes.success && folderRes.folderId) {
          finalFolderId = folderRes.folderId;
          setStreamtapeFolders(prev => [...prev, { id: folderRes.folderId!, name: newFolderName.trim() }]);
          setSelectedFolderId(folderRes.folderId);
          setIsCreatingNewFolder(false);
        }
      } catch (fErr) {
        console.error('Folder creation failed:', fErr);
      }
    }

    const initialProgress: DispatchProgressItem[] = items.map(item => ({
      id: item.id,
      title: item.title,
      teraboxUrl: item.teraboxUrl,
      dlink: item.dlink,
      path: item.path,
      durationMinutes: normalizeDurationMinutes(item.duration, 15),
      thumbnailUrl: item.thumb,
      status: 'idle',
    }));
    setProgressItems(initialProgress);

    const targetList = [...initialProgress];

    for (let currentIndex = 0; currentIndex < targetList.length; currentIndex++) {
      if (isCancelledRef.current) break;

      // Check if paused - wait until resumed or cancelled
      while (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      const item = targetList[currentIndex];
      if (!item) continue;

      item.status = 'processing';
      setProgressItems([...targetList]);

      try {
        const dispatchRes = await dispatchCloudVideo({
          url: item.teraboxUrl,
          dlink: item.dlink,
          path: item.path,
          title: item.title,
          folderId: finalFolderId,
          streamtapeFolderId: finalFolderId,
          destination,
          token: config.teraboxToken,
          config,
        });

        if (dispatchRes.success && (dispatchRes.streamtapeUrl || dispatchRes.abyssUrl)) {
          item.streamtapeUrl = dispatchRes.streamtapeUrl;
          item.abyssUrl = dispatchRes.abyssUrl;
          if (dispatchRes.filename) {
            item.title = dispatchRes.filename;
          }
          if (dispatchRes.duration && dispatchRes.duration > 0) {
            item.durationMinutes = normalizeDurationMinutes(dispatchRes.duration, 15);
          }
          if (dispatchRes.thumb) {
            item.thumbnailUrl = dispatchRes.thumb;
          }
          item.status = 'success';
        } else {
          item.status = 'error';
          item.errorMessage = dispatchRes.error || dispatchRes.errors?.join(', ') || `Lỗi nạp video sang ${destName}`;
        }
      } catch (err: any) {
        item.status = 'error';
        item.errorMessage = err.message || 'Lỗi kết nối khi điều phối video';
      }

      setProgressItems([...targetList]);
    }

    setIsDispatching(false);
    const successCount = targetList.filter(p => p.status === 'success').length;
    const failedCount = targetList.filter(p => p.status === 'error').length;
    if (successCount === items.length) {
      setStatusMessage(`✓ Đã chuyển thành công tất cả ${successCount}/${items.length} bài vào ${destName}! Bấm [Hoàn Tất] để lưu vào khóa học.`);
    } else if (successCount > 0) {
      setStatusMessage(`Đã hoàn thành ${successCount}/${items.length} bài. Có ${failedCount} bài bị lỗi, bạn có thể bấm [Thử lại] bên dưới.`);
    } else {
      setStatusMessage(`⚠️ Không thể chuyển video sang ${destName}. Xem chi tiết lỗi bên dưới bài giảng để xử lý.`);
    }
  };

  const handleFinalizeImport = () => {
    if (progressItems.length === 0 || !selectedChapterId) return;
    const lessons = createLessonsFromDispatch(progressItems.filter(p => p.status === 'success'));
    onImportLessons(selectedChapterId, lessons);
    setRawText('');
    setScannedFiles([]);
    setProgressItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0a0f24]/95 border border-cyan-500/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.12)] flex flex-col max-h-[90vh]">
        {/* Top Glowing Strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/15 flex items-center justify-between bg-[#060813]/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2 font-mono uppercase">
                Điều Phối Nạp Video // PIPELINE HUD
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-extrabold uppercase tracking-wide">
                  Multi-Cloud v2.0
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Kho TeraBox ➔ <strong className="text-cyan-300">Streamtape (Primary)</strong> + <strong className="text-amber-400">Abyss (Fallback)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigOpen(prev => !prev)}
              title="Cấu hình an toàn API Key"
              className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isConfigOpen 
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                  : 'bg-[#060813] hover:bg-[#0e1633] text-slate-300 border-cyan-500/20'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Khóa API Bảo Mật</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#060813] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          
          {/* Status Message Notification */}
          {statusMessage && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Secure API Configuration Panel */}
          {isConfigOpen && (
            <div className="p-4 sm:p-5 bg-slate-950/90 rounded-2xl border border-cyan-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cấu hình Bảo Mật 3 Đám Mây (Lưu trữ cục bộ an toàn)</span>
                </h4>
                <button
                  onClick={handleSaveConfig}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Lưu & Áp Dụng
                </button>
              </div>

              {/* 1. Streamtape Credentials */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5" /> 1. Streamtape API (Luồng Phát Chính Tốc Độ Cao):
                  </span>
                  {config.hasStreamtapeKey && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ Đã kết nối
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">API Username / Login:</label>
                    <input
                      type="text"
                      value={config.streamtapeLogin}
                      onChange={(e) => setConfig({ ...config, streamtapeLogin: e.target.value.trim() })}
                      placeholder="b594c70e5a75cdfaa252"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">API Key / Pass:</label>
                    <input
                      type="password"
                      value={config.streamtapeKey}
                      onChange={(e) => setConfig({ ...config, streamtapeKey: e.target.value.trim() })}
                      placeholder="Ore0rexG6gSk2Q"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Abyss Credentials */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                    2. Abyss API (Luồng Dự Phòng Fallback):
                  </span>
                  {config.hasAbyssKey && (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      ✓ Đã kết nối
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <label className="text-slate-400 block mb-1 font-medium">Abyss API Key:</label>
                  <input
                    type="password"
                    value={config.abyssApiKey}
                    onChange={(e) => setConfig({ ...config, abyssApiKey: e.target.value.trim() })}
                    placeholder="ba8dac0020fbdbe8b3b931285e5acb42"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 3. TeraBox Credentials */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                    3. TeraBox Master Vault (Cookie `ndus`):
                  </span>
                  {config.hasTeraboxToken && (
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      ✓ Đã nạp Cookie
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  <label className="text-slate-400 block mb-1 font-medium">TeraBox Cookie `ndus` / Token (Trích xuất từ DevTools Storage):</label>
                  <input
                    type="password"
                    value={config.teraboxToken}
                    onChange={(e) => setConfig({ ...config, teraboxToken: e.target.value.trim() })}
                    placeholder="YyBEzQx5eHui1iqLnLGobVhdjc_6HrAdN3ni2iD5"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chapter & Destination Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Target Chapter Selection */}
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chương bài giảng:</span>
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
                <span>Đích điều phối:</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDestination('streamtape')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold border transition-all ${
                    destination === 'streamtape'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Streamtape
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('abyss')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold border transition-all ${
                    destination === 'abyss'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Abyss
                </button>
                <button
                  type="button"
                  onClick={() => setDestination('both')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold border transition-all ${
                    destination === 'both'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  ✨ Cả Hai
                </button>
              </div>
            </div>
          </div>

          {/* Streamtape Target Folder Selection (only when Streamtape or Both is active) */}
          {(destination === 'streamtape' || destination === 'both') && (
            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-emerald-500/30 space-y-1.5 transition-all animate-fade-in">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Thư mục lưu trữ trên Streamtape:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFolder(prev => !prev)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>{isCreatingNewFolder ? 'Đóng' : '+ Tạo mới'}</span>
                </button>
              </label>

              {isCreatingNewFolder ? (
                <div className="p-2.5 bg-slate-900 rounded-xl border border-emerald-500/40 space-y-2 animate-fade-in text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Thư mục cha:</label>
                    <select
                      value={parentFolderIdForNew}
                      onChange={(e) => setParentFolderIdForNew(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                    >
                      <option value="">📁 / (Thư mục gốc)</option>
                      {streamtapeFolders.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.parentId ? `  ↳ 📁 ${f.path || f.name}` : `📁 ${f.name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Tên thư mục con:</label>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Ví dụ: Thư mục 1..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-emerald-500/50 rounded-lg text-emerald-300 font-medium focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => { setIsCreatingNewFolder(false); setNewFolderName(''); }}
                      className="px-2.5 py-1 rounded-lg text-[10px] text-slate-400 hover:text-slate-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewFolder}
                      disabled={!newFolderName.trim()}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-[10px] shadow-sm"
                    >
                      ✓ Tạo Thư Mục
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={selectedFolderId}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsCreatingNewFolder(true);
                    } else {
                      setSelectedFolderId(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 font-medium focus:border-emerald-500 focus:outline-none truncate"
                >
                  <option value="">📁 / (Thư mục gốc)</option>
                  {streamtapeFolders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.parentId ? `  ↳ 📁 ${f.path || f.name}` : `📁 ${f.name}`}
                    </option>
                  ))}
                  <option value="__new__">+ ➕ Tạo thư mục / thư mục con...</option>
                </select>
              )}
            </div>
          )}

          {/* Textarea Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileVideo className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dán link TeraBox (Hỗ trợ 1 link thư mục, tệp lẻ hoặc danh sách nhiều dòng):</span>
              </label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => { setRawText(''); setScannedFiles([]); }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa toàn bộ</span>
                </button>
              )}
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`# Ví dụ 1: Link xem trực tiếp hoặc thư mục:\nhttps://www.terabox.com/vietnamese/play/video?path=%2FCourse%2FAI%2FModule1%2FBai1.mp4&t=-1\n\n# Ví dụ 2: Link chia sẻ:\nhttps://1024terabox.com/s/1wIoIxU8wyHaFsN48r5i7bQ\n\n# Ví dụ 3: Danh sách nhiều bài giảng:\nBài 1 Giới thiệu | https://terabox.com/s/123...\nBài 2 Cài đặt | https://terabox.com/s/456...`}
              rows={5}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Fast Scanning Button */}
          {rawText.trim() && scannedFiles.length === 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleScanTeraBox}
                disabled={isScanning}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                {isScanning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{isScanning ? 'Đang quét dữ liệu TeraBox...' : '🔍 Quét Danh Sách Bài Giảng Gốc'}</span>
              </button>
            </div>
          )}

          {/* List of Detected / Scanned Files with Multi-Select */}
          {((scannedFiles.length > 0) || (parsedItems.length > 0 && !isScanning)) && (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>
                      {selectedFileIds.size === (scannedFiles.length > 0 ? scannedFiles.length : parsedItems.filter(p => p.isValid).length)
                        ? 'Bỏ chọn tất cả'
                        : 'Chọn tất cả'}
                    </span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    (Đã chọn: <strong className="text-emerald-400">{selectedFileIds.size}</strong> / {(scannedFiles.length > 0 ? scannedFiles.length : parsedItems.filter(p => p.isValid).length)} bài)
                  </span>
                </div>

                {scannedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setScannedFiles([]); setSelectedFileIds(new Set()); }}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Xóa quét lại
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {(scannedFiles.length > 0 ? scannedFiles : parsedItems).map((file, idx) => {
                  const isChecked = selectedFileIds.has(file.id);
                  return (
                    <div
                      key={file.id || idx}
                      onClick={() => toggleSelectItem(file.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-slate-900 border-cyan-500/40 text-slate-200 shadow-sm' 
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium">
                          {file.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[10px]">
                        {file.size && file.size > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        ) : null}
                        {file.duration ? (
                          <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            ~{normalizeDurationMinutes(file.duration)}m
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dispatch Progress List with Honest State & Retry Support */}
          {progressItems.length > 0 && (() => {
            const successCount = progressItems.filter(p => p.status === 'success').length;
            const errorCount = progressItems.filter(p => p.status === 'error').length;
            const doneCount = successCount + errorCount;
            const overallPercent = progressItems.length > 0 ? Math.round((doneCount / progressItems.length) * 100) : 0;
            return (
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-cyan-500/30 space-y-3 animate-fade-in shadow-xl">
                <div className="space-y-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${isDispatching && !isPaused ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>Tiến trình nạp video ({doneCount}/{progressItems.length} bài):</span>
                      {isPaused && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          ⏸ Đang tạm dừng
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-emerald-400 font-mono text-xs font-bold">
                        {successCount}/{progressItems.length} thành công
                      </span>

                      {/* Pause / Resume Controls during Dispatch */}
                      {isDispatching && (
                        <div className="flex items-center gap-1.5">
                          {!isPaused ? (
                            <button
                              type="button"
                              onClick={handlePauseDispatch}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold text-xs flex items-center gap-1 transition-all"
                              title="Tạm dừng tiến trình nạp"
                            >
                              <Pause className="w-3 h-3" />
                              <span>Tạm Dừng</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResumeDispatch}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold text-xs flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"
                              title="Tiếp tục nạp video"
                            >
                              <Play className="w-3 h-3" />
                              <span>Tiếp Tục</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleCancelDispatch}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Dừng hẳn tiến trình"
                          >
                            <X className="w-3 h-3" />
                            <span>Dừng</span>
                          </button>
                        </div>
                      )}

                      {errorCount > 0 && (
                        <button
                          type="button"
                          onClick={handleRetryAllFailed}
                          disabled={isDispatching && !isPaused}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isDispatching ? 'animate-spin' : ''}`} />
                          <span>Thử lại tất cả bài lỗi ({errorCount})</span>
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-xs font-extrabold shadow-sm">
                        {overallPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30"
                      style={{ width: `${Math.max(overallPercent, isDispatching ? 5 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {progressItems.map((item, idx) => {
                    const isProcessing = item.status === 'processing';
                    return (
                      <div 
                        key={item.id || idx} 
                        className={`p-3 rounded-xl border text-xs transition-all space-y-2 ${
                          isProcessing
                            ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                            : item.status === 'success'
                            ? 'bg-slate-900/60 border-slate-800/80'
                            : item.status === 'error'
                            ? 'bg-rose-950/20 border-rose-900/50'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                            {item.status === 'processing' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />}
                            {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                            {item.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                            {item.status === 'idle' && <Play className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                            <span className={`truncate font-medium ${item.status === 'processing' ? 'text-cyan-300 font-bold' : item.status === 'success' ? 'text-slate-200' : item.status === 'error' ? 'text-rose-200' : 'text-slate-400'}`}>
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] flex-wrap justify-end">
                            {item.streamtapeUrl && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Streamtape</span>
                              </span>
                            )}
                            {item.abyssUrl && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Abyss</span>
                              </span>
                            )}

                            {/* Supplementary / Missing Cloud Retry Button */}
                            {item.status === 'success' && (
                              <>
                                {!item.streamtapeUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryMissingTarget(item.id, 'streamtape')}
                                    disabled={isDispatching}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                                    title="Nạp bù Streamtape cho bài này"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Nạp bù Streamtape</span>
                                  </button>
                                )}
                                {!item.abyssUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleRetryMissingTarget(item.id, 'abyss')}
                                    disabled={isDispatching}
                                    className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                                    title="Nạp bù Abyss cho bài này"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>+ Nạp bù Abyss</span>
                                  </button>
                                )}
                              </>
                            )}

                            {item.status === 'processing' && (
                              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm animate-pulse">
                                <span>⚡ Đang truyền video...</span>
                              </span>
                            )}
                            {item.status === 'error' && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                                ⚠️ Thất bại
                              </span>
                            )}
                            {item.status === 'idle' && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-500 border border-slate-800 text-[10px]">
                                Đang chờ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Error details banner with actionable retry button */}
                        {item.status === 'error' && (
                          <div className="mt-2 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1.5 animate-fade-in text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5 text-rose-300">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-bold">Chi tiết lỗi: </span>
                                  <span>{item.errorMessage || 'Không thể tải hoặc kết nối đến máy chủ Cloud.'}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRetrySingleItem(item.id)}
                                disabled={isDispatching}
                                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm flex-shrink-0 transition-all"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Thử lại</span>
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-5">
                              {item.errorMessage?.includes('TeraBox') || item.errorMessage?.includes('Token') || item.errorMessage?.includes('cookie') ? (
                                <span>💡 <strong>Gợi ý:</strong> Token TeraBox có thể đã hết hạn. Hãy bấm nút <strong>[Khóa API Bảo Mật]</strong> ở góc trên và cập nhật lại Token TeraBox.</span>
                              ) : (
                                <span>💡 <strong>Gợi ý:</strong> Kết nối mạng hoặc API tạm thời gián đoạn. Bấm nút <strong>[Thử lại]</strong> bên cạnh để truyền lại bài giảng này.</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

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
                <span>Hoàn Tất & Nạp Vào Khóa Học ({progressItems.filter(p => p.status === 'success').length} bài)</span>
              </button>
            ) : (
              <button
                onClick={handleStartDispatch}
                disabled={activeItemsToProcess.length === 0 || !selectedChapterId || isDispatching || isScanning}
                className={`px-5 py-2.5 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                  destination === 'abyss'
                    ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                    : destination === 'streamtape'
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20'
                }`}
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Đẩy Video Sang {destination === 'both' ? 'Cả 2 Cloud' : destination === 'abyss' ? 'Abyss' : 'Streamtape'}...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Bắt Đầu Đẩy Sang {destination === 'both' ? 'Cả 2 Cloud' : destination === 'abyss' ? 'Abyss' : 'Streamtape'} ({activeItemsToProcess.length} bài)</span>
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

