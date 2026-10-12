"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BREW_METHODS,
  BrewLog,
  BrewParams,
  SavedRecipe,
  buildStages,
  calculateBrew,
  grindLabel,
} from "@/lib/brew";

const RECIPES_KEY = "brewiq.recipes.v1";
const LOGS_KEY = "brewiq.logs.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function fmtTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function beep(freq = 880, ms = 180) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000 + 0.05);
    setTimeout(() => void ctx.close(), ms + 200);
  } catch {
    /* audio unavailable */
  }
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">{label}</span>
        <span className="text-sm font-mono font-bold text-[var(--fg)]">
          {display ?? value}
          <span className="text-[var(--fg-subtle)] font-normal"> {unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border)]"
        style={{ accentColor: "var(--accent)" }}
      />
      <div className="flex justify-between text-[10px] font-mono text-[var(--fg-subtle)] mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function BrewStudio() {
  const [methodId, setMethodId] = useState("v60");
  const method = BREW_METHODS.find((m) => m.id === methodId) ?? BREW_METHODS[0];

  const [params, setParams] = useState<BrewParams>({
    methodId: "v60",
    dose: 15,
    ratio: 16,
    temp: 93,
    grind: 4.2,
    time: 180,
    bloom: true,
    bloomTime: 45,
    pours: 3,
    agitation: 1,
    roast: 1,
  });

  const [recipes, setRecipes] = useState<SavedRecipe[]>(() =>
    typeof window === "undefined" ? [] : load<SavedRecipe[]>(RECIPES_KEY, [])
  );
  const [logs, setLogs] = useState<BrewLog[]>(() =>
    typeof window === "undefined" ? [] : load<BrewLog[]>(LOGS_KEY, [])
  );
  const [recipeName, setRecipeName] = useState("");
  const [logNote, setLogNote] = useState("");
  const [logRating, setLogRating] = useState(4);
  const [activeTab, setActiveTab] = useState<"brew" | "recipes" | "log">("brew");

  // Timer state
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
    } catch { /* ignore */ }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch { /* ignore */ }
  }, [logs]);

  const switchMethod = (id: string) => {
    const m = BREW_METHODS.find((x) => x.id === id);
    if (!m) return;
    setMethodId(id);
    setParams((p) => ({ ...p, methodId: id, ...m.defaults }));
    setElapsed(0);
    setRunning(false);
  };

  const set = <K extends keyof BrewParams>(k: K, v: BrewParams[K]) =>
    setParams((p) => ({ ...p, [k]: v }));

  const calc = useMemo(() => calculateBrew(params), [params]);
  const stages = useMemo(() => buildStages(params, calc.water), [params, calc.water]);

  // Timer loop
  useEffect(() => {
    if (!running) return;
    lastTick.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      setElapsed((e) => {
        const next = e + dt;
        // stage-change beeps
        const prevStage = stages.findIndex((s) => next - dt < s.atSec + s.durationSec && next - dt >= s.atSec);
        const curStage = stages.findIndex((s) => next >= s.atSec && next < s.atSec + s.durationSec);
        if (curStage !== prevStage && curStage >= 0) beep(660, 140);
        if (next >= params.time) {
          setRunning(false);
          beep(880, 250);
          setTimeout(() => beep(1174, 350), 280);
          return params.time;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, stages, params.time]);

  const currentStageIdx = stages.findIndex((s) => elapsed >= s.atSec && elapsed < s.atSec + s.durationSec);
  const progress = params.time > 0 ? Math.min(elapsed / params.time, 1) : 0;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ recipes, logs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brewiq-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as { recipes?: SavedRecipe[]; logs?: BrewLog[] };
        if (data.recipes) setRecipes(data.recipes);
        if (data.logs) setLogs(data.logs);
      } catch {
        /* invalid file */
      }
    };
    reader.readAsText(file);
  };

  const g = grindLabel(params.grind);
  const isCold = methodId === "coldbrew";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: "radial-gradient(600px 220px at 15% 0%, rgba(180,120,60,.22), transparent 70%), radial-gradient(500px 200px at 90% 100%, rgba(120,70,30,.16), transparent 70%)" }}
        />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-2">
            BrewIQ · Full Control
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
            Every variable. One dialled-in cup.
          </h1>
          <p className="mt-2 text-sm text-[var(--fg-muted)] max-w-2xl leading-relaxed">
            Pick a method, take full control of dose, ratio, temperature, grind, bloom, pours and time.
            BrewIQ computes water, strength, extraction and caffeine live — then walks you through the
            brew with a stage timer. Save recipes, log tastings, export everything.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {(["dose", "ratio", "temp", "grind", "bloom", "pours", "timer", "recipes", "logs"] as const).map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] mb-6 w-fit">
        {([["brew", "Studio"], ["recipes", `Recipes (${recipes.length})`], ["log", `Brew log (${logs.length})`]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${activeTab === id ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
          >
            {label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-2 pr-1">
          <button onClick={exportJSON} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer" title="Export backup JSON">
            Export
          </button>
          <label className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer" title="Import backup JSON">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); }} />
          </label>
        </div>
      </div>

      {activeTab === "brew" && (
        <>
          {/* Method picker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
            {BREW_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => switchMethod(m.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${methodId === m.id ? "border-amber-600/60 bg-amber-600/10" : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-amber-600/40"}`}
              >
                <div className="text-xl leading-none">{m.icon}</div>
                <div className={`text-xs font-bold mt-1.5 leading-tight ${methodId === m.id ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg)]"}`}>{m.name}</div>
                <div className="text-[10px] text-[var(--fg-muted)] leading-tight mt-0.5">{m.tagline}</div>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Controls */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <h2 className="font-bold text-[var(--fg)]">{method.name}</h2>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">{method.description}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {method.tips.map((t) => (
                    <li key={t} className="text-xs text-[var(--fg-muted)] leading-relaxed">· {t}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Dose &amp; ratio — full control</p>
                <Slider label="Coffee dose" value={params.dose} min={method.range.dose[0]} max={method.range.dose[1]} step={0.5} unit="g" onChange={(v) => set("dose", v)} />
                <Slider label="Ratio (1 : x)" value={params.ratio} min={method.range.ratio[0]} max={method.range.ratio[1]} step={0.1} unit="" display={`1 : ${params.ratio.toFixed(1)}`} onChange={(v) => set("ratio", Math.round(v * 10) / 10)} />
                <div className="rounded-lg border border-amber-600/30 bg-amber-600/10 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--fg-muted)]">Water required</span>
                  <span className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">{calc.water} g</span>
                </div>
                {!isCold && (
                  <>
                    <Slider label="Water temperature" value={params.temp} min={method.range.temp[0]} max={method.range.temp[1]} step={1} unit="°C" onChange={(v) => set("temp", v)} />
                    <Slider label="Grind setting" value={params.grind} min={1} max={10} step={0.1} unit="" display={`${params.grind.toFixed(1)} · ${g.label}`} onChange={(v) => set("grind", Math.round(v * 10) / 10)} />
                    <p className="text-[11px] font-mono text-[var(--fg-subtle)] -mt-3">{g.microns}</p>
                  </>
                )}
                {isCold && (
                  <Slider label="Grind setting" value={params.grind} min={7} max={10} step={0.1} unit="" display={`${params.grind.toFixed(1)} · ${g.label}`} onChange={(v) => set("grind", Math.round(v * 10) / 10)} />
                )}
              </div>

              {!isCold && methodId !== "espresso" && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Bloom, pours &amp; time</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--fg)] font-medium">Bloom</span>
                    <button
                      onClick={() => set("bloom", !params.bloom)}
                      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${params.bloom ? "bg-amber-600" : "bg-[var(--border)]"}`}
                      aria-label="Toggle bloom"
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${params.bloom ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  {params.bloom && (
                    <Slider label="Bloom time" value={params.bloomTime} min={20} max={90} step={5} unit="s" onChange={(v) => set("bloomTime", v)} />
                  )}
                  {(methodId === "v60" || methodId === "chemex") && (
                    <Slider label="Pulses after bloom" value={params.pours} min={1} max={5} step={1} unit="pours" onChange={(v) => set("pours", v)} />
                  )}
                  <Slider label="Total brew time" value={params.time} min={method.range.time[0]} max={method.range.time[1]} step={5} unit="" display={fmtTime(params.time)} onChange={(v) => set("time", v)} />
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">Agitation</span>
                      <span className="text-sm font-bold text-[var(--fg)]">{["None", "Gentle swirl", "Stir once", "Vigorous"][params.agitation]}</span>
                    </div>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((a) => (
                        <button
                          key={a}
                          onClick={() => set("agitation", a)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-medium cursor-pointer ${params.agitation === a ? "border-amber-600/60 bg-amber-600/10 text-amber-600 dark:text-amber-400" : "border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                        >
                          {["None", "Swirl", "Stir", "Hard"][a]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">Roast level</span>
                    </div>
                    <div className="flex gap-2">
                      {(["Light", "Medium", "Dark"] as const).map((r, i) => (
                        <button
                          key={r}
                          onClick={() => set("roast", i)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-medium cursor-pointer ${params.roast === i ? "border-amber-600/60 bg-amber-600/10 text-amber-600 dark:text-amber-400" : "border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(methodId === "espresso" || isCold) && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Time &amp; profile</p>
                  {!isCold && <Slider label="Target shot time" value={params.time} min={20} max={40} step={1} unit="s" onChange={(v) => set("time", v)} />}
                  {!isCold && <Slider label="Water temperature" value={params.temp} min={88} max={96} step={1} unit="°C" onChange={(v) => set("temp", v)} />}
                  {!isCold && (
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--fg-muted)]">Roast level</span>
                      </div>
                      <div className="flex gap-2">
                        {(["Light", "Medium", "Dark"] as const).map((r, i) => (
                          <button key={r} onClick={() => set("roast", i)} className={`flex-1 py-2 rounded-lg border text-xs font-medium cursor-pointer ${params.roast === i ? "border-amber-600/60 bg-amber-600/10 text-amber-600 dark:text-amber-400" : "border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {isCold && <p className="text-xs text-[var(--fg-muted)]">Cold brew runs on time, not temperature. Steep 14–16 h, then dilute 1:1.</p>}
                </div>
              )}

              {/* Pour plan */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">Pour plan · scale reads this</p>
                <ol className="space-y-2">
                  {stages.map((s, i) => (
                    <li key={s.id} className={`flex gap-3 p-3 rounded-lg border text-sm ${i === currentStageIdx ? "border-amber-600/60 bg-amber-600/10" : "border-[var(--border)] bg-[var(--bg)]"}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === currentStageIdx ? "bg-amber-600 text-white" : "bg-[var(--bg-secondary)] text-[var(--fg-muted)] border border-[var(--border)]"}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[var(--fg)] text-[13px]">{s.label}</span>
                          <span className="text-[11px] font-mono text-[var(--fg-subtle)]">{fmtTime(s.atSec)}</span>
                          {s.pourTo > 0 && <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--fg-muted)]">→ {s.pourTo} g</span>}
                        </div>
                        <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right column: results + timer */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">Live brew math</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${calc.score >= 85 ? "text-emerald-600 border-emerald-600/40 bg-emerald-600/10" : calc.score >= 70 ? "text-amber-600 border-amber-600/40 bg-amber-600/10" : "text-red-500 border-red-500/40 bg-red-500/10"}`}>
                    {calc.score}/100
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    ["Water", `${calc.water} g`, ""],
                    ["In cup", `≈ ${calc.beverage} g`, ""],
                    ["TDS", `${calc.tds}%`, calc.strength],
                    ["Extraction", `${calc.ey}%`, calc.extraction],
                    ["Caffeine", `≈ ${calc.caffeine} mg`, ""],
                    ["Servings", `${calc.cups} cups`, "240 ml"],
                  ].map(([k, v, sub]) => (
                    <div key={k} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                      <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)] font-semibold">{k}</div>
                      <div className="text-base font-mono font-bold text-[var(--fg)]">{v}</div>
                      {sub ? <div className="text-[10px] text-[var(--fg-muted)]">{sub}</div> : null}
                    </div>
                  ))}
                </div>
                {/* Extraction map */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)] font-semibold mb-2">Strength × extraction map</div>
                  <div className="relative h-20 rounded-md overflow-hidden border border-[var(--border)]" style={{ background: "linear-gradient(90deg, rgba(239,68,68,.18) 0%, rgba(16,185,129,.22) 32%, rgba(16,185,129,.22) 68%, rgba(239,68,68,.18) 100%)" }}>
                    <div className="absolute inset-y-0 left-[32%] w-px bg-emerald-600/50" />
                    <div className="absolute inset-y-0 left-[68%] w-px bg-emerald-600/50" />
                    <div className="absolute inset-x-0 top-1 flex justify-between px-2 text-[9px] font-mono text-[var(--fg-muted)]">
                      <span>sour · under</span>
                      <span className="font-bold text-emerald-600">sweet spot 17.5–22%</span>
                      <span>bitter · over</span>
                    </div>
                    <div
                      className="absolute top-8 w-3 h-3 rounded-full bg-amber-600 border-2 border-white shadow"
                      style={{ left: `calc(${Math.min(Math.max((calc.ey - 12) / 14, 0), 1) * 100}% - 6px)` }}
                      title={`EY ${calc.ey}%`}
                    />
                    <div className="absolute bottom-1 inset-x-0 text-center text-[10px] font-mono text-[var(--fg-muted)]">
                      you: EY {calc.ey}% · TDS {calc.tds}%
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--fg)] leading-relaxed font-medium">{calc.verdict}</p>
                <ul className="mt-2 space-y-1">
                  {calc.fixes.map((f) => (
                    <li key={f} className="text-xs text-[var(--fg-muted)] leading-relaxed">→ {f}</li>
                  ))}
                </ul>
              </div>

              {/* Timer */}
              {!isCold && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">Stage timer</p>
                  <div className="text-4xl font-mono font-bold text-[var(--fg)] tabular-nums">{fmtTime(elapsed)}<span className="text-base text-[var(--fg-subtle)]"> / {fmtTime(params.time)}</span></div>
                  <div className="h-2.5 rounded-full bg-[var(--bg)] border border-[var(--border)] overflow-hidden mt-3 mb-1">
                    <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] mb-3">
                    {currentStageIdx >= 0 ? `Now: ${stages[currentStageIdx].label} — ${stages[currentStageIdx].detail}` : elapsed >= params.time ? "Done — decant and taste." : "Press start, then follow the pour plan."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => (elapsed >= params.time ? (setElapsed(0), setRunning(true)) : setRunning(!running))}
                      className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold cursor-pointer transition-colors"
                    >
                      {running ? "Pause" : elapsed > 0 && elapsed < params.time ? "Resume" : elapsed >= params.time ? "Brew again" : "Start brew"}
                    </button>
                    <button onClick={() => { setRunning(false); setElapsed(0); }} className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer">
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Save recipe */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">Save this setup</p>
                <input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="e.g. Sunday V60 — washed Ethiopia"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-amber-600/60 mb-2"
                />
                <button
                  onClick={() => {
                    if (!recipeName.trim()) return;
                    setRecipes((r) => [{ ...params, name: recipeName.trim(), savedAt: new Date().toISOString() }, ...r].slice(0, 50));
                    setRecipeName("");
                  }}
                  className="w-full py-2.5 rounded-lg border border-amber-600/50 text-amber-600 dark:text-amber-400 text-sm font-bold hover:bg-amber-600/10 cursor-pointer transition-colors"
                >
                  Save recipe
                </button>
              </div>

              {/* Log tasting */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">Log this brew</p>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setLogRating(s)} className={`text-xl cursor-pointer ${s <= logRating ? "opacity-100" : "opacity-25 grayscale"}`} aria-label={`${s} stars`}>
                      ⭐
                    </button>
                  ))}
                </div>
                <input
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="Tasting note — e.g. apricot, honey, clean finish"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-amber-600/60 mb-2"
                />
                <button
                  onClick={() => {
                    setLogs((l) => [{ id: `${Date.now()}`, at: new Date().toISOString(), methodId, dose: params.dose, ratio: params.ratio, temp: params.temp, grind: params.grind, rating: logRating, note: logNote.trim(), tds: calc.tds, ey: calc.ey }, ...l].slice(0, 100));
                    setLogNote("");
                  }}
                  className="w-full py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-[var(--fg)] hover:border-amber-600/50 cursor-pointer transition-colors"
                >
                  Log brew · {calc.tds}% TDS / {calc.ey}% EY
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "recipes" && (
        <div className="space-y-3">
          {recipes.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--fg-muted)]">
              No saved recipes yet. Dial one in on the Studio tab and hit “Save recipe”.
            </div>
          )}
          {recipes.map((r, i) => {
            const m = BREW_METHODS.find((x) => x.id === r.methodId);
            return (
              <div key={`${r.savedAt}-${i}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-bold text-sm text-[var(--fg)]">{r.name}</div>
                  <div className="text-xs font-mono text-[var(--fg-muted)] mt-0.5">
                    {m?.name} · {r.dose} g · 1:{r.ratio} · {r.temp}°C · grind {r.grind} · {fmtTime(r.time)}
                  </div>
                </div>
                <button
                  onClick={() => { setParams({ ...r }); setMethodId(r.methodId); setActiveTab("brew"); setElapsed(0); setRunning(false); }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                >
                  Load
                </button>
                <button onClick={() => setRecipes((x) => x.filter((_, j) => j !== i))} className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--fg-muted)] hover:text-red-500 cursor-pointer">
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "log" && (
        <div className="space-y-3">
          {logs.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--fg-muted)]">
              Nothing logged yet. Brew something, rate it, and build your taste history.
            </div>
          )}
          {logs.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 flex gap-6 text-sm">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)] font-semibold">Brews</span>
                <div className="text-xl font-mono font-bold text-[var(--fg)]">{logs.length}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)] font-semibold">Avg rating</span>
                <div className="text-xl font-mono font-bold text-[var(--fg)]">{(logs.reduce((a, l) => a + l.rating, 0) / logs.length).toFixed(1)} ⭐</div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--fg-subtle)] font-semibold">Top method</span>
                <div className="text-xl font-bold text-[var(--fg)]">
                  {(() => {
                    const counts = new Map<string, number>();
                    logs.forEach((l) => counts.set(l.methodId, (counts.get(l.methodId) ?? 0) + 1));
                    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
                    return BREW_METHODS.find((m) => m.id === top?.[0])?.name ?? "—";
                  })()}
                </div>
              </div>
            </div>
          )}
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[var(--fg)]">{BREW_METHODS.find((m) => m.id === l.methodId)?.name}</span>
                <span className="text-[11px] font-mono text-[var(--fg-subtle)]">{new Date(l.at).toLocaleString()}</span>
                <span className="text-[11px]">{"⭐".repeat(l.rating)}</span>
                <span className="text-[11px] font-mono text-[var(--fg-muted)] ml-auto">{l.dose} g · 1:{l.ratio} · {l.tds}% / {l.ey}%</span>
              </div>
              {l.note ? <p className="text-sm text-[var(--fg-muted)] mt-1">{l.note}</p> : null}
              <button onClick={() => setLogs((x) => x.filter((y) => y.id !== l.id))} className="mt-2 text-[11px] text-[var(--fg-subtle)] hover:text-red-500 cursor-pointer">
                Delete entry
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reference strip */}
      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        {[
          ["Golden ratio", "1:15 – 1:17 covers most pour-overs. Espresso lives at 1:1.5 – 1:2.5. Cold brew concentrate at 1:8 – 1:10."],
          ["Water matters", "93 °C is the neutral default. Lighter roasts like 94–96 °C; dark roasts calm down at 88–91 °C."],
          ["Change one thing", "Grind moves extraction fastest. Only ever change dose, grind, temp or time — never two at once."],
        ].map(([h, b]) => (
          <div key={h} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <div className="text-xs font-bold text-[var(--fg)] mb-1">{h}</div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
