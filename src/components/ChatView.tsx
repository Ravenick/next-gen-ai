import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Square, Menu } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (content: string) => void;
  onStop: () => void;
  onToggleSidebar: () => void;
  modelLabel: string;
}

export function ChatView({
  messages,
  isStreaming,
  onSend,
  onStop,
  onToggleSidebar,
  modelLabel,
}: ChatViewProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const showTypingIndicator =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    !messages[messages.length - 1].content;

  return (
    <div className="flex-1 flex flex-col h-full relative z-10">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 glass">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">{modelLabel}</span>
        </div>
        <div className="w-8 md:hidden" />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scroll px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {showTypingIndicator && (
            <div className="flex items-center gap-3 msg-in">
              <div className="w-7 h-7 rounded-full energy-orb scale-50 flex-shrink-0" />
              <div className="flex items-center gap-1 px-4 py-3 glass rounded-2xl rounded-tl-sm">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 py-4 border-t border-white/5 glass">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="glow-border glass rounded-2xl border border-white/10 flex items-end gap-2 p-2 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message NEXUS..."
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500
              resize-none outline-none px-3 py-2.5 text-sm max-h-40 custom-scroll"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30
                transition-all"
              >
                <Square size={16} className="fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="send-btn-glow glass-sheen flex-shrink-0 w-10 h-10 rounded-xl
                flex items-center justify-center text-white transition-all"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            NEXUS can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end msg-in">
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm
        bg-gradient-to-br from-blue-600/30 to-cyan-600/20
        border border-cyan-500/15 text-slate-100 text-sm leading-relaxed
        whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 msg-in">
      <div
        className={`w-7 h-7 rounded-full energy-orb scale-50 flex-shrink-0 ${message.isStreaming ? 'thinking' : ''}`}
      />
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm glass text-sm ${
          message.error ? 'border-red-500/30 text-red-300' : ''
        }`}
      >
        {message.error ? (
          <p>{message.content}</p>
        ) : (
          <MarkdownRenderer
            content={message.content}
            isStreaming={message.isStreaming}
          />
        )}
      </div>
    </div>
  );
}
