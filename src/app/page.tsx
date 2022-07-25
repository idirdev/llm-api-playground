"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chat";
import { ChatPanel } from "@/components/ChatPanel";
import { ConfigPanel } from "@/components/ConfigPanel";
import { SystemPrompt } from "@/components/SystemPrompt";
import { MessageInput } from "@/components/MessageInput";

export default function PlaygroundPage() {
  const [showConfig, setShowConfig] = useState(true);
  const { messages, config, isStreaming, clearChat } = useChatStore();

  const handleExport = () => {
    const exportData = {
      model: config.model,
      systemPrompt: config.systemPrompt,
      parameters: {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        topP: config.topP,
        frequencyPenalty: config.frequencyPenalty,
      },
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playground-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-surface-700 bg-surface-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-surface-100">LLM Playground</h1>
          <span className="px-2 py-0.5 text-xs font-medium bg-accent-600/20 text-accent-400 rounded-full">
            {config.model}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm text-surface-200 hover:text-surface-100 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          >
            Export
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm text-surface-200 hover:text-surface-100 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 text-sm text-surface-200 hover:text-surface-100 bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          >
            {showConfig ? "Hide Config" : "Show Config"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showConfig && (
          <aside className="w-80 border-r border-surface-700 bg-surface-900/50 flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4">
              <ConfigPanel />
              <SystemPrompt />
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <ChatPanel messages={messages} isStreaming={isStreaming} />
          </div>
          <div className="border-t border-surface-700 bg-surface-900/50">
            <MessageInput />
          </div>
        </main>
      </div>

      <footer className="px-6 py-2 text-xs text-surface-200/50 border-t border-surface-700 bg-surface-950 flex justify-between">
        <span>Messages: {messages.length}</span>
        <span>
          Tokens: ~{messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0)} estimated
        </span>
      </footer>
    </div>
  );
}
