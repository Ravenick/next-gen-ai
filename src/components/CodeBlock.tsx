import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block my-3 group relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}
