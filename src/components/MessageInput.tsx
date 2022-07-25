"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chat";

export function MessageInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, isStreaming } = useChatStore();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    addMessage("user", trimmed);
    setInput("");

    // Simulate assistant response (in production, this would call the LLM API)
    useChatStore.getState().setStreaming(true);
    setTimeout(() => {
      addMessage("assistant", `This is a simulated response to: "${trimmed}"\n\nConnect your API key to get real completions from the selected model.`);
      useChatStore.getState().setStreaming(false);
    }, 1500);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming}
          className="px-4 py-3 bg-accent-600 hover:bg-accent-500 disabled:bg-surface-700 disabled:text-surface-200/30 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {isStreaming ? "..." : "Send"}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-surface-200/30 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
