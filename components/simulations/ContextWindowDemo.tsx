"use client";

import { useState, useCallback } from "react";

const MAX_TOKENS = 8192;

const SYSTEM_TOKENS = 320;

const SAMPLE_EXCHANGES = [
  { role: "user",      text: "What is an LLM?",                                          tokens: 8  },
  { role: "assistant", text: "An LLM is a large language model trained on text data.",   tokens: 18 },
  { role: "user",      text: "How does it generate text?",                               tokens: 8  },
  { role: "assistant", text: "It predicts the next token based on all previous tokens.", tokens: 14 },
  { role: "user",      text: "What is a context window?",                                tokens: 8  },
  { role: "assistant", text: "It's the total number of tokens the model can see at once.", tokens: 16 },
  { role: "user",      text: "Can the model remember past conversations?",               tokens: 10 },
  { role: "assistant", text: "No — each new session starts fresh with no memory.",       tokens: 15 },
  { role: "user",      text: "How do I give it memory?",                                 tokens: 9  },
  { role: "assistant", text: "You include past messages in the context, or use RAG.",    tokens: 16 },
  { role: "user",      text: "What happens when context fills up?",                      tokens: 9  },
  { role: "assistant", text: "Oldest messages get dropped — the model forgets them.",    tokens: 14 },
  { role: "user",      text: "Is there a way to avoid that?",                            tokens: 9  },
  { role: "assistant", text: "Summarise old turns or use a longer-context model.",       tokens: 14 },
  { role: "user",      text: "What's the biggest context window available today?",       tokens: 12 },
  { role: "assistant", text: "Gemini 1.5 supports up to 1 million tokens.",              tokens: 13 },
  { role: "user",      text: "Does more context always help?",                           tokens: 9  },
  { role: "assistant", text: "Not always — models can lose focus in very long contexts.", tokens: 15 },
  { role: "user",      text: "What is 'lost in the middle'?",                            tokens: 9  },
  { role: "assistant", text: "Models attend poorly to content in the middle of long contexts.", tokens: 16 },
];

const NEW_MESSAGE_TOKENS = 24;

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  tokens: number;
  truncated?: boolean;
}

function TokenBar({ used, max, systemTokens, messages, newMsgTokens }: {
  used: number;
  max: number;
  systemTokens: number;
  messages: Message[];
  newMsgTokens: number;
}) {
  const pct = (t: number) => Math.min(100, (t / max) * 100);
  const overflowing = used > max;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="relative h-8 rounded-lg overflow-hidden bg-[var(--border)] flex">
        {/* System prompt */}
        <div
          className="h-full bg-violet-600 transition-all duration-300 flex items-center justify-center"
          style={{ width: `${pct(systemTokens)}%` }}
          title={`System prompt: ${systemTokens} tokens`}
        />
        {/* Messages */}
        {messages.filter(m => !m.truncated).map((msg, i) => (
          <div
            key={msg.id}
            className={`h-full transition-all duration-300 ${msg.role === "user" ? "bg-blue-500" : "bg-emerald-500"}`}
            style={{ width: `${pct(msg.tokens)}%` }}
            title={`${msg.role}: ${msg.tokens} tokens`}
          />
        ))}
        {/* New message */}
        {newMsgTokens > 0 && (
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${pct(newMsgTokens)}%` }}
            title={`New message: ${newMsgTokens} tokens`}
          />
        )}
        {/* Overflow indicator */}
        {overflowing && (
          <div className="absolute inset-0 border-2 border-rose-500 rounded-lg animate-pulse" />
        )}
      </div>

      {/* Token counter */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 inline-block" />
            <span className="text-[var(--fg-muted)]">System ({systemTokens})</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-[var(--fg-muted)]">User</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-[var(--fg-muted)]">Assistant</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span className="text-[var(--fg-muted)]">New message</span>
          </span>
        </div>
        <span className={`font-bold ${overflowing ? "text-rose-500" : used > max * 0.85 ? "text-amber-500" : "text-[var(--fg-muted)]"}`}>
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>

      {/* Warning */}
      {overflowing && (
        <div className="text-xs text-rose-500 font-medium flex items-center gap-1">
          ⚠ Context overflow — oldest messages are being truncated
        </div>
      )}
      {!overflowing && used > max * 0.85 && (
        <div className="text-xs text-amber-500 font-medium flex items-center gap-1">
          ⚡ Context window is {Math.round((used / max) * 100)}% full
        </div>
      )}
    </div>
  );
}

export default function ContextWindowDemo() {
  const [messageCount, setMessageCount] = useState(4);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageCount(Number(e.target.value));
  }, []);

  // Build visible messages list
  const allMessages: Message[] = SAMPLE_EXCHANGES.slice(0, messageCount).map((m, i) => ({
    id: i,
    role: m.role as "user" | "assistant",
    text: m.text,
    tokens: m.tokens,
  }));

  // Calculate running totals and figure out truncation
  const historyTokens = allMessages.reduce((s, m) => s + m.tokens, 0);
  const totalUsed = SYSTEM_TOKENS + historyTokens + NEW_MESSAGE_TOKENS;
  const overflow = totalUsed - MAX_TOKENS;

  // Mark messages as truncated from oldest if overflow
  let truncatedTokens = 0;
  const processedMessages = allMessages.map((m) => {
    if (overflow > 0 && truncatedTokens < overflow) {
      truncatedTokens += m.tokens;
      return { ...m, truncated: true };
    }
    return m;
  });

  const truncatedCount = processedMessages.filter(m => m.truncated).length;
  const visibleMessages = processedMessages.filter(m => !m.truncated);
  const usedAfterTruncation = SYSTEM_TOKENS + visibleMessages.reduce((s, m) => s + m.tokens, 0) + NEW_MESSAGE_TOKENS;

  return (
    <div className="sim-block not-prose">
      <div className="sim-label">Live context window</div>

      {/* Token bar */}
      <TokenBar
        used={Math.min(totalUsed, MAX_TOKENS + (overflow > 0 ? 0 : 0))}
        max={MAX_TOKENS}
        systemTokens={SYSTEM_TOKENS}
        messages={processedMessages}
        newMsgTokens={NEW_MESSAGE_TOKENS}
      />

      {/* Conversation slider */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
          <span>Conversation length</span>
          <span className="font-mono">{messageCount} messages</span>
        </div>
        <input
          type="range"
          min={1}
          max={SAMPLE_EXCHANGES.length}
          value={messageCount}
          onChange={handleSlider}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-[10px] text-[var(--fg-subtle)] mt-0.5">
          <span>1 msg</span>
          <span>{SAMPLE_EXCHANGES.length} msgs</span>
        </div>
      </div>

      {/* Message list */}
      <div className="mt-4 space-y-1.5 max-h-64 overflow-y-auto">
        {truncatedCount > 0 && (
          <div className="text-xs text-rose-500 text-center py-1.5 border border-rose-500/30 rounded bg-rose-500/5 font-medium">
            ✂ {truncatedCount} message{truncatedCount > 1 ? "s" : ""} truncated — model can no longer see these
          </div>
        )}
        {processedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 items-start text-xs rounded-lg px-3 py-2 transition-all duration-300 ${
              msg.truncated
                ? "opacity-25 line-through bg-rose-500/5 border border-rose-500/20"
                : msg.role === "user"
                ? "bg-blue-500/10 border border-blue-500/20"
                : "bg-emerald-500/10 border border-emerald-500/20"
            }`}
          >
            <span className={`shrink-0 font-mono font-bold text-[10px] mt-0.5 ${
              msg.role === "user" ? "text-blue-500" : "text-emerald-500"
            }`}>
              {msg.role === "user" ? "USR" : "AST"}
            </span>
            <span className="text-[var(--fg-muted)] flex-1">{msg.text}</span>
            <span className="shrink-0 font-mono text-[var(--fg-subtle)]">{msg.tokens}t</span>
          </div>
        ))}
        {/* New incoming message */}
        <div className="flex gap-2 items-start text-xs rounded-lg px-3 py-2 bg-amber-500/10 border border-amber-500/30">
          <span className="shrink-0 font-mono font-bold text-[10px] mt-0.5 text-amber-500">NEW</span>
          <span className="text-[var(--fg-muted)] flex-1 italic">How do I prevent context overflow in production?</span>
          <span className="shrink-0 font-mono text-[var(--fg-subtle)]">{NEW_MESSAGE_TOKENS}t</span>
        </div>
      </div>
    </div>
  );
}
