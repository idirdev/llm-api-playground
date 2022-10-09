# LLM API Playground

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive web-based playground for testing and comparing LLM APIs. Switch between models, tweak parameters, and see results in real time.

## Features

- **Multi-model support** - GPT-4, Claude 3, Llama 3, Mistral in one interface
- **Parameter tuning** - Temperature, top-p, max tokens, frequency penalty sliders
- **System prompt templates** - Pre-built templates for common use cases
- **Preset configurations** - Creative Writer, Code Assistant, Data Analyst, and more
- **Chat interface** - Full conversation history with markdown rendering
- **Export conversations** - Download chat history as JSON
- **Dark theme** - Comfortable dark UI built with Tailwind CSS
- **Token estimation** - Approximate token count display

## Supported Models

| Model | Provider | Context Window | Input Price | Output Price |
|-------|----------|---------------|-------------|--------------|
| GPT-4 Turbo | OpenAI | 128K | $10/M | $30/M |
| GPT-4o | OpenAI | 128K | $5/M | $15/M |
| Claude 3 Opus | Anthropic | 200K | $15/M | $75/M |
| Claude 3 Sonnet | Anthropic | 200K | $3/M | $15/M |
| Llama 3 70B | Meta | 8K | $0.80/M | $0.80/M |
| Mistral Large | Mistral AI | 32K | $4/M | $12/M |
| Mixtral 8x7B | Mistral AI | 32K | $0.70/M | $0.70/M |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout with dark theme
    page.tsx            # Main playground page
    globals.css         # Dark theme styles
  components/
    ChatPanel.tsx       # Chat message display with markdown
    ConfigPanel.tsx     # Model and parameter configuration
    SystemPrompt.tsx    # System prompt editor with templates
    MessageInput.tsx    # Message input with keyboard shortcuts
  lib/
    types.ts            # TypeScript interfaces
    models.ts           # Model definitions and specs
  stores/
    chat.ts             # Zustand state management
```

## Configuration

Set your API keys in `.env.local`:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## License

MIT

---

## Français

**LLM API Playground** est un environnement de test interactif basé sur le web pour comparer des APIs de modèles de langage (LLM). Il prend en charge GPT-4, Claude 3, Llama 3 et Mistral dans une seule interface, avec des curseurs de réglage des paramètres (température, top-p, tokens max), des templates de prompts système prédéfinis et l'export de l'historique des conversations en JSON.

### Installation

```bash
npm install
npm run dev
```

### Utilisation

Créez un fichier `.env.local` avec vos clés API, puis ouvrez [http://localhost:3000](http://localhost:3000). Sélectionnez un modèle, ajustez les paramètres, rédigez votre message et observez les réponses en temps réel.

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```
