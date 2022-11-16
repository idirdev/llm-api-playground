# LLM API Playground

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive web-based playground for testing LLM APIs. Select a model, enter your own API key, adjust parameters, and get real streaming completions back from OpenAI or Anthropic.

> **API keys are required.** This playground calls the providers directly from your browser via a Next.js API proxy route. You must supply your own API key for the provider whose models you want to use. Keys are stored in `localStorage` only — they are never sent to any server other than the provider's own endpoint.

## Features

- **Real streaming completions** — SSE streaming via `/api/chat`, proxied to OpenAI or Anthropic
- **Multi-model support** — GPT-4 Turbo, GPT-4o (OpenAI) and Claude 3 Opus/Sonnet (Anthropic)
- **Per-provider API keys** — enter your `sk-...` or `sk-ant-...` key in the Config panel; stored only in your browser
- **Stop generation** — cancel an in-progress stream with the Stop button
- **Parameter tuning** — Temperature, top-p, max tokens, frequency penalty sliders
- **System prompt templates** — pre-built templates for common use cases
- **Preset configurations** — Creative Writer, Code Assistant, Data Analyst, and more
- **Chat interface** — full conversation history with markdown and syntax highlighting
- **Export conversations** — download chat history as JSON
- **Dark theme** — comfortable dark UI built with Tailwind CSS
- **Persistent settings** — model choice, parameters, and API keys saved to `localStorage`

## Supported Models

| Model | Provider | Context Window | Input Price | Output Price |
|-------|----------|---------------|-------------|--------------|
| GPT-4 Turbo | OpenAI | 128K | $10/M | $30/M |
| GPT-4o | OpenAI | 128K | $5/M | $15/M |
| Claude 3 Opus | Anthropic | 200K | $15/M | $75/M |
| Claude 3 Sonnet | Anthropic | 200K | $3/M | $15/M |
| Llama 3 70B | Meta (via proxy) | 8K | $0.80/M | $0.80/M |
| Mistral Large | Mistral AI (via proxy) | 32K | $4/M | $12/M |
| Mixtral 8x7B | Mistral AI (via proxy) | 32K | $0.70/M | $0.70/M |

> **Note:** Llama and Mistral models are listed in the UI but require a compatible API proxy (e.g. Together AI, Groq, or a local server) that accepts OpenAI-compatible requests on a custom base URL. Only OpenAI and Anthropic are fully supported out of the box.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

1. Open the **Config** panel (shown by default on the left sidebar)
2. Enter your **OpenAI API Key** (`sk-...`) and/or **Anthropic API Key** (`sk-ant-...`)
3. Select a model
4. Type a message and press **Enter** — real completions stream back token by token
5. Use the **Stop** button to cancel generation mid-stream

## How API Keys Work

- Keys are entered in the UI and stored in your browser's `localStorage` via Zustand persist
- On each request, the key is sent **only** to `/api/chat` (the local Next.js proxy route running on your own machine)
- The proxy forwards the key to the provider (OpenAI or Anthropic) in the appropriate header (`Authorization: Bearer ...` or `x-api-key: ...`)
- **No API keys are stored server-side or logged anywhere**

## Project Structure

```
src/
  app/
    api/chat/route.ts   # Next.js API route — proxies to OpenAI / Anthropic with streaming
    layout.tsx          # Root layout with dark theme
    page.tsx            # Main playground page
    globals.css         # Dark theme styles
  components/
    ChatPanel.tsx       # Chat message display with markdown
    ConfigPanel.tsx     # Model, API key, and parameter configuration
    SystemPrompt.tsx    # System prompt editor with templates
    MessageInput.tsx    # Message input with real fetch + streaming + stop button
  lib/
    types.ts            # TypeScript interfaces
    models.ts           # Model definitions and specs
  stores/
    chat.ts             # Zustand state (messages, config, API keys — persisted)
tests/
  index.test.ts         # Model/provider utility tests
  api-chat.test.ts      # API route logic + SSE parsing tests (mocked fetch)
```

## Running Tests

```bash
npm test
```

29 tests across 2 files. External API calls are mocked — no real API keys needed to run the test suite.

## License

MIT

---

## Documentation en francais

### Description
LLM API Playground est une application web interactive pour tester les API de LLM. Selectionnez un modele, entrez votre cle API, ajustez les parametres et obtenez des completions en streaming en temps reel depuis OpenAI ou Anthropic.

> **Les cles API sont necessaires.** Ce playground appelle les fournisseurs directement depuis votre navigateur via une route proxy Next.js. Vous devez fournir votre propre cle API. Les cles sont stockees uniquement dans le `localStorage` — elles ne sont jamais envoyees a un serveur autre que celui du fournisseur.

### Fonctionnalites


- **Completions en streaming** -- SSE via `/api/chat`, proxifie vers OpenAI ou Anthropic
- **Multi-modeles** -- GPT-4 Turbo, GPT-4o (OpenAI) et Claude 3 Opus/Sonnet (Anthropic)
- **Cles API par fournisseur** -- entrez votre cle dans le panneau Config ; stockee uniquement dans votre navigateur
- **Stop de generation** -- annulez un stream en cours avec le bouton Stop
- **Reglage des parametres** -- Temperature, top-p, max tokens, penalite de frequence
- **Templates de prompt systeme** -- templates pre-construits pour les cas d'usage courants
- **Export de conversations** -- telechargez l'historique du chat en JSON

### Installation

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Utilisation

1. Ouvrez le panneau **Config** (affiche par defaut dans la barre laterale gauche)
2. Entrez votre **cle API OpenAI** (`sk-...`) et/ou votre **cle API Anthropic** (`sk-ant-...`)
3. Selectionnez un modele
4. Tapez un message et appuyez sur **Entree** — les completions s'affichent en streaming token par token
5. Utilisez le bouton **Stop** pour annuler la generation en cours

### Tests

```bash
npm test
```

29 tests sur 2 fichiers. Les appels API externes sont simules — aucune cle API reelle n'est necessaire.

### Licence

MIT
