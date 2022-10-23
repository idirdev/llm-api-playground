"use client";

import { useState } from "react";
import { useChatStore, PRESETS } from "@/stores/chat";
import { MODELS, getModelById } from "@/lib/models";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.606M9.88 9.88A3 3 0 0114.12 14.12M3 3l18 18" />
    </svg>
  );
}

interface ApiKeyFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}

function ApiKeyField({ label, placeholder, value, onChange, hint }: ApiKeyFieldProps) {
  const [visible, setVisible] = useState(false);
  const isSet = value.trim().length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-surface-200/70">{label}</label>
        {isSet && (
          <span className="text-xs text-emerald-400 font-medium">Set</span>
        )}
      </div>
      <div className="relative flex items-center">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full pr-8 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-200/30 focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 text-surface-200/50 hover:text-surface-200 transition-colors"
          aria-label={visible ? "Hide key" : "Show key"}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      <p className="mt-1 text-xs text-surface-200/30">{hint}</p>
    </div>
  );
}

export function ConfigPanel() {
  const { config, activePreset, apiKeys, setModel, setConfig, loadPreset, setApiKey } =
    useChatStore();
  const selectedModel = getModelById(config.model);

  return (
    <div className="space-y-4">
      {/* API Keys */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
          API Keys
        </h3>
        <ApiKeyField
          label="OpenAI API Key"
          placeholder="sk-..."
          value={apiKeys.openai}
          onChange={(v) => setApiKey("openai", v)}
          hint="Required for GPT-4 / GPT-4o models"
        />
        <ApiKeyField
          label="Anthropic API Key"
          placeholder="sk-ant-..."
          value={apiKeys.anthropic}
          onChange={(v) => setApiKey("anthropic", v)}
          hint="Required for Claude models"
        />
        <p className="text-xs text-surface-200/30 leading-relaxed">
          Keys are stored in your browser only and never sent to our servers — only directly to
          the provider.
        </p>
      </div>

      <div className="border-t border-surface-700" />

      {/* Model */}
      <div>
        <label className="block text-xs font-medium text-surface-200/70 mb-1.5">Model</label>
        <select
          value={config.model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
        {selectedModel && (
          <p className="mt-1 text-xs text-surface-200/40">
            Context: {(selectedModel.contextWindow / 1000).toFixed(0)}K |{" "}
            ${selectedModel.inputPricePerMillion}/M in, ${selectedModel.outputPricePerMillion}/M out
          </p>
        )}
      </div>

      {/* Preset */}
      <div>
        <label className="block text-xs font-medium text-surface-200/70 mb-1.5">Preset</label>
        <select
          value={activePreset || ""}
          onChange={(e) => {
            const preset = PRESETS.find((p) => p.id === e.target.value);
            if (preset) loadPreset(preset);
          }}
          className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          <option value="">Custom</option>
          {PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      {/* Parameters */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-surface-200/70">Temperature</label>
          <span className="text-xs text-accent-400 font-mono">{config.temperature.toFixed(1)}</span>
        </div>
        <input
          type="range" min="0" max="2" step="0.1"
          value={config.temperature}
          onChange={(e) => setConfig({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-accent-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-surface-200/70">Max Tokens</label>
          <span className="text-xs text-accent-400 font-mono">{config.maxTokens}</span>
        </div>
        <input
          type="range" min="256" max="4096" step="256"
          value={config.maxTokens}
          onChange={(e) => setConfig({ maxTokens: parseInt(e.target.value) })}
          className="w-full accent-accent-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-surface-200/70">Top P</label>
          <span className="text-xs text-accent-400 font-mono">{config.topP.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.05"
          value={config.topP}
          onChange={(e) => setConfig({ topP: parseFloat(e.target.value) })}
          className="w-full accent-accent-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-surface-200/70">Frequency Penalty</label>
          <span className="text-xs text-accent-400 font-mono">{config.frequencyPenalty.toFixed(1)}</span>
        </div>
        <input
          type="range" min="0" max="2" step="0.1"
          value={config.frequencyPenalty}
          onChange={(e) => setConfig({ frequencyPenalty: parseFloat(e.target.value) })}
          className="w-full accent-accent-500"
        />
      </div>
    </div>
  );
}
