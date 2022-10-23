"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chat";

export function MessageInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { addMessage, updateLastMessage, isStreaming, config, getApiKeyForModel } =
    useChatStore();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const apiKey = getApiKeyForModel(config.model);
    if (!apiKey) {
      addMessage(
        "assistant",
        "**No API key configured.** Please enter your API key in the Config panel on the left before sending a message."
      );
      return;
    }

    // Snapshot messages before adding the new user message
    const { messages } = useChatStore.getState();

    addMessage("user", trimmed);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    useChatStore.getState().setStreaming(true);

    // Add an empty placeholder for the assistant reply that we will stream into
    addMessage("assistant", "");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
          model: config.model,
          systemPrompt: config.systemPrompt,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
          stream: true,
          apiKey,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        updateLastMessage(
          `**Error ${res.status}:** ${errorData.error ?? "Request failed."}`
        );
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        updateLastMessage("**Error:** No response body received.");
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (typeof delta === "string") {
              accumulated += delta;
              updateLastMessage(accumulated);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      if (!accumulated) {
        updateLastMessage("*(Empty response from model)*");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        updateLastMessage("*(Generation stopped)*");
      } else {
        const msg = err instanceof Error ? err.message : "Unknown error";
        updateLastMessage(`**Network error:** ${msg}`);
      }
    } finally {
      useChatStore.getState().setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto w-full">
      <div className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={isStreaming}
          className="flex-1 px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-sm text-surface-100 placeholder:text-surface-200/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={handleStop}
            className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-4 py-3 bg-accent-600 hover:bg-accent-500 disabled:bg-surface-700 disabled:text-surface-200/30 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Send
          </button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-surface-200/30 text-center">
        Press Enter to send · Shift+Enter for new line · Enter your API key in the Config panel
      </p>
    </div>
  );
}
