import { useState } from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({
  content,
  isStreaming,
}: MarkdownRendererProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const blocks = parseMarkdown(content);

  return (
    <div className={`space-y-1 ${isStreaming ? 'stream-cursor' : ''}`}>
      {blocks.map((block, i) => {
        if (block.type === 'code') {
          return (
            <CodeBlock
              key={i}
              code={block.code}
              language={block.language}
            />
          );
        }
        if (block.type === 'heading') {
          const HeadingTag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
          return (
            <HeadingTag
              key={i}
              className={`font-bold text-slate-100 mt-4 mb-2 ${
                block.level === 1
                  ? 'text-xl'
                  : block.level === 2
                    ? 'text-lg'
                    : 'text-base'
              }`}
            >
              {renderInline(block.text)}
            </HeadingTag>
          );
        }
        if (block.type === 'list') {
          if (block.ordered) {
            return (
              <ol
                key={i}
                className="list-decimal list-inside space-y-1 text-slate-300 my-2"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          }
          return (
            <ul
              key={i}
              className="list-disc list-inside space-y-1 text-slate-300 my-2"
            >
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'quote') {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-cyan-500/40 pl-4 text-slate-400 italic my-2"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }
        if (block.type === 'separator') {
          return (
            <hr key={i} className="border-white/10 my-4" />
          );
        }
        // paragraph
        if (block.text.trim()) {
          return (
            <p key={i} className="text-slate-300 leading-relaxed">
              {renderInline(block.text)}
            </p>
          );
        }
        return null;
      })}
      {!isStreaming && content.trim() && (
        <button
          onClick={handleCopyAll}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors mt-2 block"
        >
          {copiedAll ? 'Copied to clipboard' : 'Copy response'}
        </button>
      )}
    </div>
  );
}

type Block =
  | { type: 'code'; code: string; language?: string }
  | { type: 'heading'; text: string; level: number }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'quote'; text: string }
  | { type: 'separator' }
  | { type: 'paragraph'; text: string };

function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```(\w*)/);
      const language = langMatch?.[1] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: 'code',
        code: codeLines.join('\n'),
        language,
      });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        text: headingMatch[2],
        level: headingMatch[1].length,
      });
      i++;
      continue;
    }

    // Separator
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({ type: 'separator' });
      i++;
      continue;
    }

    // Block quote
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items, ordered: true });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items, ordered: false });
      continue;
    }

    // Paragraph (collect consecutive non-empty lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].match(/^#{1,4}\s+/) &&
      !lines[i].match(/^[-*]\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !lines[i].trim().startsWith('>') &&
      lines[i].trim() !== '---' &&
      lines[i].trim() !== '***'
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    } else {
      i++;
    }
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**, *italic*, `code`, and [link](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  const patterns: Array<{
    regex: RegExp;
    render: (match: RegExpExecArray) => React.ReactNode;
  }> = [
    {
      regex: /\*\*(.+?)\*\*/,
      render: (m) => (
        <strong key={`b${keyIdx}`} className="font-semibold text-slate-100">
          {m[1]}
        </strong>
      ),
    },
    {
      regex: /`([^`]+)`/,
      render: (m) => (
        <code
          key={`c${keyIdx}`}
          className="px-1.5 py-0.5 rounded bg-white/5 text-cyan-300 font-mono text-sm"
        >
          {m[1]}
        </code>
      ),
    },
    {
      regex: /\*([^*]+?)\*/,
      render: (m) => (
        <em key={`i${keyIdx}`} className="italic text-slate-200">
          {m[1]}
        </em>
      ),
    },
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/,
      render: (m) => (
        <a
          key={`l${keyIdx}`}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          {m[1]}
        </a>
      ),
    },
  ];

  while (remaining.length > 0) {
    let earliestIdx = -1;
    let earliestMatch: RegExpExecArray | null = null;
    let earliestPattern:
      | ((match: RegExpExecArray) => React.ReactNode)
      | null = null;

    for (const p of patterns) {
      const m = p.regex.exec(remaining);
      if (m && (earliestIdx === -1 || m.index < earliestIdx)) {
        earliestIdx = m.index;
        earliestMatch = m;
        earliestPattern = p.render;
      }
    }

    if (earliestMatch && earliestPattern) {
      if (earliestIdx > 0) {
        parts.push(remaining.slice(0, earliestIdx));
      }
      parts.push(earliestPattern(earliestMatch));
      keyIdx++;
      remaining = remaining.slice(earliestIdx + earliestMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}
