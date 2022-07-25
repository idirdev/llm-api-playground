"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chat";

const TEMPLATES = [
  { label: "General Assistant", prompt: "You are a helpful assistant." },
  { label: "Code Expert", prompt: "You are an expert software engineer. Write clean, efficient, well-documented code. Explain your reasoning step by step." },
  { label: "Creative Writer", prompt: "You are a creative writing assistant. Be imaginative, vivid, and original. Use varied sentence structures and rich vocabulary." },
  { label: "Data Analyst", prompt: "You are a data analyst. Analyze data thoroughly, identify patterns and trends, and provide actionable insights with clear visualizations." },
  { label: "Tutor", prompt: "You are a patient, encouraging tutor. Break down complex topics into simple steps. Use analogies and examples. Ask follow-up questions to check understanding." },
];

const MAX_CHARS = 4000;

export function SystemPrompt() {
  const { config, setConfig } = useChatStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const charCount = config.systemPrompt.length;
  const charPercent = (charCount / MAX_CHARS) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-surface-200/70">System Prompt</label>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
        >
          {showTemplates ? "Hide Templates" : "Templates"}
        </button>
      </div>

      {showTemplates && (
        <div className="mb-2 space-y-1">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setConfig({ systemPrompt: t.prompt });
                setShowTemplates(false);
              }}
              className="w-full text-left px-2 py-1.5 text-xs rounded bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={config.systemPrompt}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setConfig({ systemPrompt: e.target.value });
          }
        }}
        placeholder="Enter system prompt..."
        rows={4}
        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-200/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
      <div className="flex justify-between items-center mt-1">
        <div className="w-24 h-1 bg-surface-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${charPercent > 90 ? "bg-red-500" : "bg-accent-500"}`}
            style={{ width: `${Math.min(charPercent, 100)}%` }}
          />
        </div>
        <span className={`text-xs ${charPercent > 90 ? "text-red-400" : "text-surface-200/40"}`}>
          {charCount}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
