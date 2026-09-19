# NEXUS | Ravenick AI Chat

A next-generation AI chat workspace built by Nelson Emmanuel | Ravenick. NEXUS combines streamed Hugging Face responses, model selection, persistent local conversations, markdown rendering, code blocks, and a focused glassmorphism interface for exploring ideas with AI.

> [!NOTE]
> NEXUS uses the Hugging Face Router API for model responses. Your conversation history is stored locally in the browser, while prompts and responses are sent to Hugging Face when you use the chat.

## Preview

![Ravenick logo](public/oc-logo-no-bg.png)

## Features

- Streaming chat responses with token-by-token rendering
- Hugging Face Router integration using the OpenAI-compatible chat completions endpoint
- Model selection for Llama 3.3 70B, Qwen 2.5 72B, Mistral 7B, and DeepSeek R1 Distill
- Conversation creation, switching, deletion, and automatic titles
- Conversation history persisted in browser local storage
- Abortable responses with a Stop control while a model is streaming
- Markdown-style rendering for headings, lists, quotes, separators, and fenced code blocks
- Dedicated code blocks with copy support
- Copy entire assistant responses to the clipboard
- Starter prompts for explanations, coding, brainstorming, writing, and planning
- API-key status and masked key hint inside the settings panel
- Animated aurora background, energy orb, glass panels, and responsive mobile sidebar
- Fixed Ravenick author badge with the project logo and a continuous sheen sweep to the right
- Branded page metadata, favicon, social sharing metadata, and theme color

## Built With

| Tool | Use |
| --- | --- |
| React 18 | Chat state, conversation views, and interactive controls |
| TypeScript | Typed messages, conversations, model options, and component contracts |
| Tailwind CSS 3 | Responsive utility styling and layout composition |
| Lucide React | Interface icons and prompt category icons |
| Hugging Face Router API | Streaming model responses |
| Vite | Development server and production compilation |
| Browser APIs | Local storage, clipboard access, abort controllers, and file-free client state |

## Project Structure

```text
public/
  oc-logo-no-bg.png
src/
  components/
    ApiKeyBanner.tsx
    ChatView.tsx
    CodeBlock.tsx
    MarkdownRenderer.tsx
    Sidebar.tsx
    WelcomeScreen.tsx
  hooks/
    useConversations.ts
  lib/
    huggingface.ts
  App.tsx
  index.css
  main.tsx
  types.ts
index.html
package.json
tailwind.config.js
vite.config.ts
```

## Environment Setup

Create a local `.env` file in the project root:

```env
VITE_HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
```

Create a token from your Hugging Face account with permission to use the selected inference models. The application displays a setup banner when the variable is missing or still uses the placeholder value.

Never commit `.env` or expose a production API token in a public client application. The repository already ignores `.env` files through `.gitignore`.

## Run Locally

```bash
git clone https://github.com/Ravenick/nexus-ai-chat.git
cd nexus-ai-chat
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, configure your Hugging Face key, and start a conversation from one of the suggested prompts or the chat composer.

Create a production build with:

```bash
npm run build
```

Run the available checks with:

```bash
npm run typecheck
npm run lint
```

## Data And Privacy

Conversation history is stored under the `nexus_conversations` key in the browser's local storage. The app does not provide a server-side conversation database. When you send a message, the relevant conversation messages are sent to the Hugging Face Router API for generation.

## Author

Nelson Emmanuel | Ravenick

Built for thoughtful interfaces, fast experiments, and practical AI tooling.
