import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';
import type { Conversation } from '@/types';
import { AVAILABLE_MODELS } from '@/lib/huggingface';
import { getApiKeyHint, isApiKeyConfigured } from '@/lib/huggingface';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  selectedModel,
  onSelectModel,
  isOpen,
  onClose,
}: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-40 h-full w-72 flex flex-col
          glass-strong border-r border-white/5
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 energy-orb scale-75" />
              <span className="text-sheen text-lg font-bold tracking-wide">
                NEXUS
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={onCreate}
            className="glass-sheen w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
            bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/20
            text-slate-200 hover:text-white text-sm font-medium transition-all
            hover:border-cyan-500/40"
          >
            <Plus size={16} />
            New Conversation
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto custom-scroll px-2 py-2">
          <p className="text-xs text-slate-500 px-3 py-2 uppercase tracking-wider">
            Conversations
          </p>
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageSquare
                size={24}
                className="mx-auto text-slate-600 mb-2"
              />
              <p className="text-sm text-slate-500">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`
                  group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all slide-in-left
                  ${
                    conv.id === activeId
                      ? 'sidebar-item-active text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }
                `}
              >
                <MessageSquare size={15} className="flex-shrink-0 opacity-60" />
                <span className="text-sm truncate flex-1">
                  {conv.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Settings */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-sm"
          >
            <Settings size={16} />
            Settings & Model
          </button>

          {showSettings && (
            <div className="mt-3 space-y-3 fade-in">
              <div>
                <p className="text-xs text-slate-500 mb-2 px-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={11} /> Model
                </p>
                <div className="space-y-1.5">
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onSelectModel(m.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                        selectedModel === m.id
                          ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                          : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-medium">{m.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {m.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                  API Key
                </p>
                <p
                  className={`text-xs font-mono ${
                    isApiKeyConfigured()
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {isApiKeyConfigured() ? getApiKeyHint() : 'Not configured'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
