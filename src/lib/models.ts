import { Model } from "./types";

export const MODELS: Model[] = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    maxOutput: 4096,
    inputPricePerMillion: 10.0,
    outputPricePerMillion: 30.0,
    capabilities: ["chat", "vision", "function-calling", "json-mode", "streaming", "code"],
    description: "Most capable GPT-4 model with vision support and 128K context window.",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: 128000,
    maxOutput: 4096,
    inputPricePerMillion: 5.0,
    outputPricePerMillion: 15.0,
    capabilities: ["chat", "vision", "function-calling", "json-mode", "streaming", "code"],
    description: "Optimized GPT-4 model. Faster and cheaper with similar capability.",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextWindow: 200000,
    maxOutput: 4096,
    inputPricePerMillion: 15.0,
    outputPricePerMillion: 75.0,
    capabilities: ["chat", "vision", "streaming", "code"],
    description: "Most powerful Claude model. Excels at complex reasoning and analysis.",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    maxOutput: 4096,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    capabilities: ["chat", "vision", "streaming", "code"],
    description: "Balanced performance and cost. Great for most tasks.",
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "Meta",
    contextWindow: 8192,
    maxOutput: 2048,
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 0.8,
    capabilities: ["chat", "streaming", "code"],
    description: "Open-source large model. Strong coding and reasoning abilities.",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    contextWindow: 32000,
    maxOutput: 4096,
    inputPricePerMillion: 4.0,
    outputPricePerMillion: 12.0,
    capabilities: ["chat", "function-calling", "json-mode", "streaming", "code"],
    description: "Top-tier reasoning model from Mistral with function calling support.",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    provider: "Mistral AI",
    contextWindow: 32000,
    maxOutput: 4096,
    inputPricePerMillion: 0.7,
    outputPricePerMillion: 0.7,
    capabilities: ["chat", "streaming", "code"],
    description: "Mixture-of-experts model. Excellent cost-to-performance ratio.",
  },
];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): Model[] {
  return MODELS.filter((m) => m.provider === provider);
}

export const PROVIDERS = [...new Set(MODELS.map((m) => m.provider))];
