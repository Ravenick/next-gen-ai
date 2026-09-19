import type { ChatMessage, ModelOption } from '@/types';

const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY as string;
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    label: 'Llama 3.3 70B',
    description: 'Meta flagship — versatile and powerful',
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    label: 'Qwen 2.5 72B',
    description: 'Alibaba — excellent reasoning & multilingual',
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    label: 'Mistral 7B',
    description: 'Fast & lightweight — great for quick replies',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    label: 'DeepSeek R1 Distill',
    description: 'Deep reasoning — step-by-step thinking',
  },
];

export function isApiKeyConfigured(): boolean {
  return (
    !!HF_API_KEY &&
    HF_API_KEY.length > 10 &&
    HF_API_KEY !== 'your_hugging_face_api_key_here'
  );
}

export function getApiKeyHint(): string {
  if (!HF_API_KEY || HF_API_KEY === 'your_hugging_face_api_key_here')
    return 'No API key found';
  return `${HF_API_KEY.slice(0, 4)}...${HF_API_KEY.slice(-4)}`;
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  model: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  if (!isApiKeyConfigured()) {
    callbacks.onError(
      'Hugging Face API key not configured. Add VITE_HUGGING_FACE_API_KEY to your .env file.',
    );
    return;
  }

  const apiMessages = messages
    .filter((m) => !m.error)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  // Add a system message for personality
  if (apiMessages.length === 0 || apiMessages[0].role !== 'system') {
    apiMessages.unshift({
      role: 'system',
      content:
        'You are NEXUS, a sleek next-generation AI assistant. Be helpful, concise, and engaging. Use markdown formatting when appropriate.',
    });
  }

  try {
    const response = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let errMsg = `Request failed (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errJson.error || errMsg;
      } catch {
        if (errText) errMsg = errText.slice(0, 200);
      }
      callbacks.onError(errMsg);
      return;
    }

    // Check if response is streamable
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/event-stream') || !response.body) {
      // Non-streaming fallback
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // Simulate streaming for nicer UX
        const words = content.split(' ');
        for (let i = 0; i < words.length; i++) {
          callbacks.onToken(i === 0 ? words[i] : ' ' + words[i]);
          await new Promise((r) => setTimeout(r, 20));
        }
      }
      callbacks.onDone();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            callbacks.onToken(delta);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    callbacks.onDone();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone();
      return;
    }
    callbacks.onError(
      err instanceof Error ? err.message : 'Network error occurred',
    );
  }
}
