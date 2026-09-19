import { useCallback, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ApiKeyBanner } from '@/components/ApiKeyBanner';
import { useConversations, useApiKeyStatus } from '@/hooks/useConversations';
import { streamChatCompletion, AVAILABLE_MODELS } from '@/lib/huggingface';
import type { ChatMessage } from '@/types';

function App() {
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useConversations();

  const apiKeyConfigured = useApiKeyStatus();
  const [showBanner, setShowBanner] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const abortRef = useRef<AbortController | null>(null);

  const modelLabel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.label ||
    AVAILABLE_MODELS[0].label;

  const handleSend = useCallback(
    async (content: string) => {
      let convId = activeId;

      // Create a conversation if none active
      if (!convId) {
        convId = createConversation();
      }

      const convIdFinal = convId;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      // Add user + empty assistant message
      updateConversation(convIdFinal, (conv) => {
        const title =
          conv.messages.length === 0
            ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
            : conv.title;
        return {
          ...conv,
          title,
          messages: [...conv.messages, userMsg, assistantMsg],
          updatedAt: Date.now(),
        };
      });

      // Build the message list for the API (include prior messages + new user msg)
      const priorMessages = activeConversation
        ? activeConversation.messages
        : [];
      const apiMessages = [...priorMessages, userMsg];

      setIsStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let accumulated = '';

      await streamChatCompletion(
        apiMessages,
        selectedModel,
        {
          onToken: (token) => {
            accumulated += token;
            updateConversation(convIdFinal, (conv) => ({
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, content: accumulated, isStreaming: true }
                  : m,
              ),
              updatedAt: Date.now(),
            }));
          },
          onDone: () => {
            setIsStreaming(false);
            abortRef.current = null;
            updateConversation(convIdFinal, (conv) => ({
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsg.id
                  ? { ...m, isStreaming: false }
                  : m,
              ),
            }));
          },
          onError: (error) => {
            setIsStreaming(false);
            abortRef.current = null;
            updateConversation(convIdFinal, (conv) => ({
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: `Error: ${error}`,
                      isStreaming: false,
                      error: true,
                    }
                  : m,
              ),
            }));
          },
        },
        controller.signal,
      );
    },
    [
      activeId,
      activeConversation,
      createConversation,
      updateConversation,
      selectedModel,
    ],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const handleNewChat = useCallback(() => {
    if (isStreaming) handleStop();
    createConversation();
  }, [createConversation, isStreaming, handleStop]);

  const handleDelete = useCallback(
    (id: string) => {
      if (isStreaming && id === activeId) handleStop();
      deleteConversation(id);
    },
    [deleteConversation, isStreaming, activeId, handleStop],
  );

  const messages = activeConversation?.messages || [];
  const showWelcome = messages.length === 0;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#04060d]">
      {/* Animated background */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="aurora-bg grid-overlay" />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onCreate={handleNewChat}
        onDelete={handleDelete}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {!apiKeyConfigured && showBanner && (
          <ApiKeyBanner onDismiss={() => setShowBanner(false)} />
        )}

        {showWelcome ? (
          <WelcomeScreen onSuggestion={(prompt) => handleSend(prompt)} />
        ) : (
          <ChatView
            messages={messages}
            isStreaming={isStreaming}
            onSend={handleSend}
            onStop={handleStop}
            onToggleSidebar={() => setSidebarOpen(true)}
            modelLabel={modelLabel}
          />
        )}
      </div>

      <a
        className="ravenick-badge"
        href="https://github.com/Ravenick"
        target="_blank"
        rel="noreferrer"
        aria-label="Built by Ravenick, Nelson Emmanuel"
      >
        <span className="ravenick-badge__sheen" aria-hidden="true" />
        <img src="/oc-logo-no-bg.png" alt="" className="ravenick-badge__logo" />
        <span className="ravenick-badge__copy">
          <span className="ravenick-badge__built">Built by</span>
          <span className="ravenick-badge__name">Ravenick</span>
        </span>
      </a>
    </div>
  );
}

export default App;
