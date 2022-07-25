export type Role = "system" | "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  tokenCount?: number;
  model?: string;
  latencyMs?: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  capabilities: ModelCapability[];
  description: string;
}

export type ModelCapability = "chat" | "vision" | "function-calling" | "json-mode" | "streaming" | "code";

export interface ChatConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  stream: boolean;
}

export interface CompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: "stop" | "length" | "content_filter" | "error";
  latencyMs: number;
}

export interface StreamChunk {
  id: string;
  delta: string;
  finishReason: string | null;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<ChatConfig>;
}
