import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Message, ChatConfig, Preset } from "@/lib/types";

export interface ApiKeys {
  openai: string;
  anthropic: string;
}

interface ChatState {
  messages: Message[];
  config: ChatConfig;
  apiKeys: ApiKeys;
  isStreaming: boolean;
  activePreset: string | null;
  addMessage: (role: Message["role"], content: string) => void;
  updateLastMessage: (content: string) => void;
  clearChat: () => void;
  setModel: (model: string) => void;
  setConfig: (partial: Partial<ChatConfig>) => void;
  setStreaming: (streaming: boolean) => void;
  loadPreset: (preset: Preset) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  getApiKeyForModel: (model: string) => string;
}

const defaultConfig: ChatConfig = {
  model: "gpt-4-turbo",
  systemPrompt: "You are a helpful assistant.",
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  stopSequences: [],
  stream: true,
};

const defaultApiKeys: ApiKeys = {
  openai: "",
  anthropic: "",
};

export const PRESETS: Preset[] = [
  {
    id: "creative",
    name: "Creative Writer",
    description: "High temperature for creative and diverse outputs",
    config: { temperature: 1.2, topP: 0.95, frequencyPenalty: 0.5, systemPrompt: "You are a creative writing assistant. Be imaginative, vivid, and original in your responses." },
  },
  {
    id: "precise",
    name: "Precise & Factual",
    description: "Low temperature for deterministic, factual responses",
    config: { temperature: 0.1, topP: 0.9, frequencyPenalty: 0.0, systemPrompt: "You are a precise, factual assistant. Provide accurate, well-sourced information." },
  },
  {
    id: "coder",
    name: "Code Assistant",
    description: "Optimized for code generation and debugging",
    config: { temperature: 0.3, topP: 0.95, frequencyPenalty: 0.0, systemPrompt: "You are an expert software engineer. Write clean, well-documented code. Always explain your approach." },
  },
  {
    id: "analyst",
    name: "Data Analyst",
    description: "Balanced settings for analytical tasks",
    config: { temperature: 0.4, topP: 0.9, frequencyPenalty: 0.2, systemPrompt: "You are a data analyst. Provide thorough analysis with insights, patterns, and actionable recommendations." },
  },
];

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getProviderForModel(model: string): keyof ApiKeys | null {
  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  return null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      config: { ...defaultConfig },
      apiKeys: { ...defaultApiKeys },
      isStreaming: false,
      activePreset: null,

      addMessage: (role, content) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: generateId(),
              role,
              content,
              timestamp: Date.now(),
              model: role === "assistant" ? state.config.model : undefined,
            },
          ],
        })),

      updateLastMessage: (content) =>
        set((state) => {
          const updated = [...state.messages];
          if (updated.length > 0) {
            updated[updated.length - 1] = { ...updated[updated.length - 1], content };
          }
          return { messages: updated };
        }),

      clearChat: () => set({ messages: [] }),

      setModel: (model) =>
        set((state) => ({ config: { ...state.config, model }, activePreset: null })),

      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial }, activePreset: null })),

      setStreaming: (isStreaming) => set({ isStreaming }),

      loadPreset: (preset) =>
        set((state) => ({
          config: { ...state.config, ...preset.config },
          activePreset: preset.id,
        })),

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      getApiKeyForModel: (model) => {
        const provider = getProviderForModel(model);
        if (!provider) return "";
        return get().apiKeys[provider] ?? "";
      },
    }),
    {
      name: "llm-playground-storage",
      partialize: (state) => ({
        config: state.config,
        apiKeys: state.apiKeys,
        activePreset: state.activePreset,
      }),
    }
  )
);
