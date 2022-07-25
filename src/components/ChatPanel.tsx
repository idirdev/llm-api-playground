"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/types";

interface ChatPanelProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ChatPanel({ messages, isStreaming }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-200/50 px-4">
        <div className="text-4xl mb-4">{">"}_</div>
        <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
        <p className="text-sm text-center max-w-md">
          Configure your model and parameters in the sidebar, then type a message below to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-4 max-w-4xl mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 py-4 px-4 rounded-xl ${
            message.role === "user"
              ? "bg-surface-800/50"
              : message.role === "assistant"
              ? "bg-surface-900/30"
              : "bg-accent-600/10 border border-accent-600/20"
          }`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              message.role === "user"
                ? "bg-accent-600 text-white"
                : message.role === "assistant"
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}
          >
            {message.role === "user" ? "U" : message.role === "assistant" ? "AI" : "S"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-surface-200/70 capitalize">
                {message.role}
              </span>
              {message.model && (
                <span className="text-xs text-surface-200/40">{message.model}</span>
              )}
              <span className="text-xs text-surface-200/30">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-surface-950 prose-pre:border prose-pre:border-surface-700 prose-code:text-accent-400">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {isStreaming && (
        <div className="flex items-center gap-2 px-4 py-2 text-surface-200/50">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs">Generating response...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
