import { useEffect, useState } from 'react';
import type { Conversation } from '@/types';
import { isApiKeyConfigured } from '@/lib/huggingface';

const STORAGE_KEY = 'nexus_conversations';

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // storage full or unavailable
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);
    if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const createConversation = (): string => {
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const conv: Conversation = {
      id,
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  };

  const updateConversation = (
    id: string,
    updater: (conv: Conversation) => Conversation,
  ): void => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c)),
    );
  };

  const deleteConversation = (id: string): void => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const activeConversation =
    conversations.find((c) => c.id === activeId) || null;

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
  };
}

export function useApiKeyStatus() {
  const [configured] = useState(() => isApiKeyConfigured());
  return configured;
}
