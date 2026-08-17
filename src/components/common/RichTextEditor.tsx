import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon, 
  Minus, 
  Eye, 
  Edit3, 
  Sparkles,
  Clock,
  FileText
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Soạn thảo nội dung bài học...',
  minHeight = '220px',
  label,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown syntax at cursor position or wrap selection
  const insertSyntax = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultPlaceholder;
    const replacement = `${before}${selectedText}${after}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  // Helper to insert a block line (e.g. Header, list item, hr)
  const insertBlock = (prefix: string, defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    const needNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const newlinePrefix = needNewlineBefore ? '\n' : '';

    const textToInsert = `${newlinePrefix}${prefix} ${defaultText}`;
    const newValue = beforeCursor + textToInsert + afterCursor;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Insert standard lesson template
  const insertLessonTemplate = () => {
    const template = `# Mục Tiêu Bài Học
- Hiểu rõ nguyên lý cốt lõi
- Nắm vững các bước thực hành từng bước
- Tránh các lỗi thường gặp trong thực tế

## 1. Khái Niệm Cốt Lõi
Nội dung giới thiệu chi tiết về chủ đề...

> **Lưu ý quan trọng:** Đây là điểm mấu chốt bạn cần ghi nhớ khi áp dụng vào dự án thực tế.

## 2. Hướng Dẫn Thực Hành
1. **Bước 1:** Chuẩn bị môi trường và tài liệu cần thiết.
2. **Bước 2:** Cấu hình và thiết lập các thông số chính.
3. **Bước 3:** Kiểm tra kết quả và tinh chỉnh.

\`\`\`typescript
// Đoạn mã mẫu minh họa
export function exampleWorkflow() {
  console.log("Thực thi thành công!");
}
\`\`\`

## 3. Tổng Kết & Bài Tập
Tóm tắt lại các kiến thức trọng tâm đã học trong bài này.`;

    onChange(value ? `${value}\n\n${template}` : template);
  };

  // Calculate word count & reading time
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-lg space-y-0">
      
      {/* Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900 border-b border-slate-800 text-xs">
        
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          {label && (
            <span className="text-[11px] font-bold text-slate-400 mr-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>{label}</span>
            </span>
          )}

          {/* Heading buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => insertBlock('#', 'Tiêu đề lớn')}
              title="Tiêu đề H1"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-[11px]"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertBlock('##', 'Tiêu đề vừa')}
              title="Tiêu đề H2"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-[11px]"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertBlock('###', 'Tiêu đề nhỏ')}
              title="Tiêu đề H3"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-[11px]"
            >
              H3
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Text Style buttons */}
          <button
            type="button"
            onClick={() => insertSyntax('**', '**', 'chữ in đậm')}
            title="In đậm (Bold)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax('*', '*', 'chữ in nghiêng')}
            title="In nghiêng (Italic)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* List buttons */}
          <button
            type="button"
            onClick={() => insertBlock('-', 'Mục danh sách')}
            title="Danh sách gạch đầu dòng"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertBlock('1.', 'Bước đầu tiên')}
            title="Danh sách đánh số"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertBlock('>', 'Trích dẫn quan trọng...')}
            title="Trích dẫn (Quote)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertBlock('```typescript\n// Code mẫu tại đây\n', '\n```')}
            title="Khối mã code snippet"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertSyntax('[', '](https://...)', 'Tiêu đề liên kết')}
            title="Chèn link liên kết"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => insertBlock('---')}
            title="Đường kẻ ngang phân cách"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={insertLessonTemplate}
            title="Chèn khung bài giảng mẫu"
            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span>Mẫu Bài Học</span>
          </button>
        </div>

        {/* Tab Switcher: Edit vs Preview */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'edit'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Soạn Thảo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Xem Trước</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none font-mono text-xs sm:text-sm leading-relaxed resize-y custom-scrollbar"
        />
      ) : (
        <div 
          style={{ minHeight }}
          className="p-6 bg-slate-950/70 overflow-y-auto max-h-96 custom-scrollbar"
        >
          <MarkdownRenderer content={value} />
        </div>
      )}

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Hỗ trợ định dạng Markdown đầy đủ (H1-H3, **in đậm**, *nghiêng*, code, danh sách)</span>
        <div className="flex items-center gap-3">
          <span>{wordCount} từ</span>
          <span className="flex items-center gap-1 text-teal-400">
            <Clock className="w-3 h-3" />
            <span>~{estimatedReadMinutes} phút đọc</span>
          </span>
        </div>
      </div>

    </div>
  );
};
