import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Code } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content || !content.trim()) {
    return <p className="text-slate-500 italic py-2">Chưa có nội dung văn bản.</p>;
  }

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse inline styles (bold, italic, inline code, links, badges)
  const parseInlineElements = (text: string): React.ReactNode[] => {
    // Regex for inline elements: **bold**, *italic*, `code`, [text](url), [mm:ss] timestamp
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // 1. Timestamps: [05:30]
      const timestampMatch = remaining.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
      if (timestampMatch) {
        parts.push(
          <span 
            key={`ts-${key++}`} 
            className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 mx-1 align-baseline select-all"
          >
            ⏱ {timestampMatch[1]}
          </span>
        );
        remaining = remaining.slice(timestampMatch[0].length);
        continue;
      }

      // 2. Bold: **bold** or __bold__
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${key++}`} className="font-bold text-white tracking-wide">
            {parseInlineElements(boldMatch[2])}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 3. Highlight / Marked: ++text++
      const highlightMatch = remaining.match(/^\+\+(.*?)\+\+/);
      if (highlightMatch) {
        parts.push(
          <mark key={`hl-${key++}`} className="bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
            {highlightMatch[1]}
          </mark>
        );
        remaining = remaining.slice(highlightMatch[0].length);
        continue;
      }

      // 4. Italic: *italic* or _italic_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        parts.push(
          <em key={`em-${key++}`} className="italic text-slate-300">
            {parseInlineElements(italicMatch[2])}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 5. Inline Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={`code-${key++}`} className="font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-lg border border-slate-800 font-semibold mx-0.5">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // 6. Links: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const rawUrl = linkMatch[2].trim();
        const safeUrl = /^(javascript|vbscript|data):/i.test(rawUrl) ? '#' : rawUrl;
        parts.push(
          <a
            key={`link-${key++}`}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 underline underline-offset-4 decoration-teal-500/40 hover:decoration-teal-400 transition-colors font-medium"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Plain text character fallback
      const nextSpecial = remaining.search(/(\[|\*\*|__|\+\+|\*|_|`)/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Block Level Parser
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let codeBlockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Block Check
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = line.trim().slice(3).trim();
        codeBlockLines = [];
        continue;
      } else {
        inCodeBlock = false;
        const currentCode = codeBlockLines.join('\n');
        const currentIdx = codeBlockIndex++;
        const isCopied = copiedIndex === currentIdx;

        blocks.push(
          <div key={`codeblock-${i}`} className="my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-[11px] font-bold text-slate-300">
                  {codeBlockLanguage || 'CODE'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(currentCode, currentIdx)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{currentCode}</code>
            </pre>
          </div>
        );
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      blocks.push(<div key={`empty-${i}`} className="h-3" />);
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-slate-800" />);
      continue;
    }

    // Headers H1, H2, H3, H4
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-6 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2.5">
          <span className="w-2 h-6 rounded bg-emerald-500 flex-shrink-0" />
          <span>{parseInlineElements(trimmed.slice(2))}</span>
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-slate-100 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded bg-teal-400 flex-shrink-0" />
          <span>{parseInlineElements(trimmed.slice(3))}</span>
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-teal-300 mt-4 mb-2">
          {parseInlineElements(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-sm sm:text-base font-semibold text-slate-200 mt-3 mb-1">
          {parseInlineElements(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote: > Quote
    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote key={`quote-${i}`} className="my-3 pl-4 py-2 border-l-4 border-emerald-500 bg-emerald-950/20 rounded-r-2xl text-slate-300 italic text-sm sm:text-base leading-relaxed">
          {parseInlineElements(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List Items: - item or * item
    if (/^[-*+]\s+/.test(trimmed)) {
      const itemContent = trimmed.replace(/^[-*+]\s+/, '');
      blocks.push(
        <div key={`li-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm sm:text-base text-slate-200 leading-relaxed">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
          <span className="flex-1">{parseInlineElements(itemContent)}</span>
        </div>
      );
      continue;
    }

    // Numbered List: 1. item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      blocks.push(
        <div key={`numli-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm sm:text-base text-slate-200 leading-relaxed">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-teal-300 border border-slate-800 flex-shrink-0 mt-0.5">
            {numMatch[1]}.
          </span>
          <span className="flex-1">{parseInlineElements(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Standard Paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-sm sm:text-base text-slate-200 leading-relaxed sm:leading-loose my-1.5 font-normal">
        {parseInlineElements(line)}
      </p>
    );
  }

  return <div className={`space-y-1 ${className}`}>{blocks}</div>;
};
