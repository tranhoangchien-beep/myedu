import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, Check, X } from 'lucide-react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  allowCustom?: boolean;
  onAddNewOption?: (newVal: string) => void;
  required?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Tìm hoặc chọn...',
  label,
  icon,
  allowCustom = true,
  onAddNewOption,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter options
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const exactMatch = options.some(
    opt => opt.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleAddNew = (customVal: string) => {
    const trimmed = customVal.trim();
    if (!trimmed) return;
    if (onAddNewOption) {
      onAddNewOption(trimmed);
    }
    onChange(trimmed);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setSearchQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Select Box Trigger */}
      <div
        onClick={handleOpenDropdown}
        className={`w-full px-3 py-2 text-xs bg-slate-900 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
          isOpen 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-900/90' 
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {value ? (
            <span className="font-semibold text-white truncate">{value}</span>
          ) : (
            <span className="text-slate-500 truncate">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 hover:text-rose-400 transition-colors"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in flex flex-col max-h-64">
          
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/80">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập để tìm hoặc gõ tên mới..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0]);
                    } else if (allowCustom && searchQuery.trim()) {
                      handleAddNew(searchQuery);
                    }
                  } else if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar flex-1">
            {filteredOptions.length === 0 && !searchQuery.trim() && (
              <div className="py-4 text-center text-xs text-slate-500">
                Chưa có dữ liệu danh sách
              </div>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = opt.toLowerCase() === value.toLowerCase();
              return (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-xs rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
              );
            })}

            {/* Creatable Add New Option */}
            {allowCustom && searchQuery.trim() && !exactMatch && (
              <div
                onClick={() => handleAddNew(searchQuery)}
                className="px-3 py-2 text-xs rounded-xl flex items-center gap-2 cursor-pointer bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-dashed border-emerald-500/40 mt-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Thêm mới: <strong>"{searchQuery.trim()}"</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
