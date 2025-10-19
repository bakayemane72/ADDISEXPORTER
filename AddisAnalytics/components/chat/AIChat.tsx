"use client";

import { useState } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me anything about your imported coffee data - quality metrics, shipments, trends, or specific insights.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Failed to get response: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-card rounded-card border border-border shadow-default">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-gold/10 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-accent-gold" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">AI Data Assistant</h3>
            <p className="text-xs text-text-muted">Ask questions about your data</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-accent-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-accent-gold" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-card p-3 ${
                msg.role === "user"
                  ? "bg-accent-gold text-bg-base"
                  : "bg-bg-surface text-text-primary"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 bg-accent-copper/10 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-accent-copper" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-accent-gold/10 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-gold animate-pulse" />
            </div>
            <div className="bg-bg-surface text-text-muted rounded-card p-3">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your coffee data..."
            className="flex-1 input-field"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Try: "What's the average quality score?" or "Show me shipments by region"
        </p>
      </div>
    </div>
  );
}
