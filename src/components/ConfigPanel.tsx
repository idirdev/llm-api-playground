"use client";

import { useChatStore, PRESETS } from "@/stores/chat";
import { MODELS, getModelById } from "@/lib/models";

export function ConfigPanel() {
  const { config, activePreset, setModel, setConfig, loadPreset } = useChatStore();
  const selectedModel = getModelById(config.model);

  return (
    <div className="space-y-4">
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
            Context: {(selectedModel.contextWindow / 1000).toFixed(0)}K |
            ${selectedModel.inputPricePerMillion}/M in, ${selectedModel.outputPricePerMillion}/M out
          </p>
        )}
      </div>

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
