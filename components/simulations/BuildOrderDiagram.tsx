"use client";

import { useState } from "react";

interface Layer {
  id: string;
  order: string;
  phase: string;
  title: string;
  subtitle: string;
  items: string[];
  color: string;
  borderColor: string;
  tagColor: string;
  detail: string;
}

const LAYERS: Layer[] = [
  {
    id: "foundation",
    order: "BUILD FIRST",
    phase: "Phase 1 · Weeks 1–2",
    title: "Layer 1: Verification Foundation",
    subtitle: "Your ground truth. The agent's only feedback signal.",
    items: [
      "Build verifier — mvn compile + mvn test",
      "NPM verifier — npm ci + npm test",
      "Lint verifier — PMD + ESLint (new violations only)",
      "Exposed as a single verify() tool the agent calls",
      "Tested against 3+ representative repos before agent is written",
    ],
    color: "bg-emerald-500/10",
    borderColor: "border-emerald-500/50",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    detail:
      "Without this, the agent cannot determine if its output is correct. It generates code but has no way to iterate toward correctness. This is not scaffolding — it is the product.",
  },
  {
    id: "controls",
    order: "BUILD SECOND",
    phase: "Phase 2 · Weeks 2–3",
    title: "Layer 2: Discipline Controls",
    subtitle: "Defines what the agent can and cannot do.",
    items: [
      "Protected path deny list on edit_file",
      "Change budget: start at 5 files maximum",
      "read_file content sanitizer (mask secrets before LLM context)",
      "Diff validator: secret scan + test count delta + prohibited patterns",
      "LLM Judge using a different model family — not the same as the agent",
    ],
    color: "bg-amber-500/10",
    borderColor: "border-amber-500/50",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    detail:
      "The LLM Judge must use a different model family from the coding agent. Shared model families share blind spots — mistakes the agent makes, the judge will also miss.",
  },
  {
    id: "controlplane",
    order: "BUILD IN PARALLEL WITH LAYER 2",
    phase: "Phase 2 · Weeks 2–3",
    title: "Layer 3: Control Plane",
    subtitle: "Exists on day one. Not an afterthought.",
    items: [
      "Global kill switch activatable in under 60 seconds",
      "Per-domain scoped pause (surgical, without halting everything)",
      "Circuit breaker: auto-pause domain when judge veto rate exceeds threshold",
      "Dead-letter queue + human notification for failed sessions",
      "Immutable audit log threading session_id through every system",
    ],
    color: "bg-orange-500/10",
    borderColor: "border-orange-500/50",
    tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    detail:
      "If you cannot stop the agent in under 60 seconds you have no safety net. Build the kill switch before running the first session — not after the first incident.",
  },
  {
    id: "agent",
    order: "BUILD LAST",
    phase: "Phase 3 · Weeks 3–4",
    title: "The Agent",
    subtitle: "Now it has a ground truth and defined boundaries.",
    items: [
      "LLM (Claude / GPT) with constrained tool access",
      "Tools: read_file · edit_file · verify() · search_code",
      "System prompt with context-separation delimiters",
      "Orchestrator: task queue + repo clone + session ID threading",
      "MR creator: orchestrator-controlled content, signed commits, mandatory labels",
    ],
    color: "bg-[var(--accent)]/10",
    borderColor: "border-[var(--accent)]/50",
    tagColor: "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40",
    detail:
      "Start with one repo, one task type, and manually triggered runs only. Change budget at 5 files. Do not automate dispatch until you have 20+ manually reviewed sessions with good metrics.",
  },
];

const PHASES = [
  { label: "Phase 1", detail: "Verifier", weeks: "Wk 1–2", active: "foundation" },
  { label: "Phase 2", detail: "Controls + Kill Switch", weeks: "Wk 2–3", active: "controls" },
  { label: "Phase 3", detail: "Agent (1 repo, manual)", weeks: "Wk 3–4", active: "agent" },
  { label: "Phase 4", detail: "Orchestrator + MR", weeks: "Wk 4–5", active: "agent" },
  { label: "Pilot", detail: "50 sessions, measure", weeks: "Wk 5–7", active: "" },
];

export default function BuildOrderDiagram() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const selected = LAYERS.find((l) => l.id === activeLayer);

  return (
    <div className="my-8 rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--bg-subtle,#1a1a2e)] px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-mono font-semibold text-[var(--fg-muted)] uppercase tracking-wider">
          Build Order: Foundation → Controls → Agent
        </p>
        <p className="text-xs text-[var(--fg-muted)]">Click any layer for detail</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Phase timeline */}
        <div>
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            Build Sequence
          </p>
          <div className="flex items-stretch gap-0 overflow-x-auto pb-1">
            {PHASES.map((phase, i) => (
              <div key={phase.label} className="flex items-stretch min-w-0">
                <div className="flex flex-col items-center justify-center px-3 py-2 border border-[var(--border)] rounded-lg min-w-[90px] text-center">
                  <span className="text-xs font-semibold text-[var(--fg)] font-mono">
                    {phase.label}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] mt-0.5 leading-tight">
                    {phase.detail}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono mt-1 opacity-60">
                    {phase.weeks}
                  </span>
                </div>
                {i < PHASES.length - 1 && (
                  <div className="flex items-center px-1 text-[var(--fg-muted)] text-xs shrink-0">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stack — rendered top to bottom visually but bottom = foundation */}
        <div>
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            Architecture Stack (foundation at bottom)
          </p>
          <div className="flex flex-col gap-2">
            {[...LAYERS].reverse().map((layer) => {
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(isActive ? null : layer.id)}
                  className={[
                    "w-full text-left rounded-lg border px-4 py-3 transition-all duration-150",
                    layer.color,
                    isActive ? layer.borderColor : "border-[var(--border)] hover:" + layer.borderColor,
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-[var(--fg)]">
                          {layer.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${layer.tagColor}`}
                        >
                          {layer.order}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--fg-muted)]">{layer.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--fg-muted)] shrink-0 mt-0.5">
                      {layer.phase}
                    </span>
                  </div>

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                      <ul className="space-y-1">
                        {layer.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-[var(--fg)]">
                            <span className={`shrink-0 mt-0.5 ${layer.tagColor.split(" ")[1]}`}>
                              ▸
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-[var(--fg-muted)] italic border-l-2 border-[var(--border)] pl-3 mt-2">
                        {layer.detail}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* The key rule */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle,#1a1a2e)] px-4 py-3">
          <p className="text-xs font-mono text-[var(--fg-muted)] mb-1 uppercase tracking-wider">
            The rule
          </p>
          <p className="text-sm text-[var(--fg)]">
            The agent is the most exciting component.{" "}
            <span className="font-semibold">It is also the last thing you build.</span>{" "}
            Every layer below it must exist and be tested before the agent runs a single session.
          </p>
        </div>
      </div>
    </div>
  );
}
