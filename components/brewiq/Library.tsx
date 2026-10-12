"use client";

import { useState } from "react";
import {
  BREWERS,
  GRINDERS,
  METHOD_META,
  PROCESSES,
  ROAST_LEVELS,
  bagFreshnessLabel,
  flavorAffinity,
  formatRatio,
  formatTime,
  freshnessFor,
  id,
  levelFor,
  pointsFor,
  streakFor,
  type Bag,
} from "@/lib/brewiq";
import type { BrewIQModel } from "./useBrewIQ";

export function BagShelf({ model }: { model: BrewIQModel }) {
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<Partial<Bag>>({
    process: "washed",
    roast: "medium",
    bagSizeG: 250,
    remainingG: 250,
    roastDate: new Date().toISOString().slice(0, 10),
  });

  const add = () => {
    if (!draft.name || !draft.roaster) return;
    model.upsertBag({
      id: id("bag"),
      name: draft.name,
      roaster: draft.roaster,
      origin: draft.origin || "Unknown",
      process: draft.process ?? "washed",
      roast: draft.roast ?? "medium",
      roastDate: draft.roastDate ?? new Date().toISOString().slice(0, 10),
      remainingG: Number(draft.remainingG ?? 250),
      bagSizeG: Number(draft.bagSizeG ?? 250),
      flavorNotes: notes.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setNotes("");
    setDraft({ process: "washed", roast: "medium", bagSizeG: 250, remainingG: 250, roastDate: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="bq-panel">
      <h2>Bags</h2>
      <div className="bq-list">
        {model.bags.map((bag) => {
          const fresh = freshnessFor(bag, model.method);
          return (
            <article key={bag.id} className="bq-card">
              <h3>
                {bag.roaster} — {bag.name}
              </h3>
              <div className="bq-meta">
                {bag.origin} · {bag.process} · {bag.roast} ·{" "}
                <span className="bq-fresh" data-s={fresh}>
                  {fresh} · {bagFreshnessLabel(bag)}
                </span>
              </div>
              <div className="bq-meta">{bag.flavorNotes.join(" · ") || "No notes"}</div>
              <div className="bq-bar" aria-label="Remaining">
                <i style={{ width: `${Math.max(0, Math.min(100, (bag.remainingG / bag.bagSizeG) * 100))}%` }} />
              </div>
              <div className="bq-meta">
                {bag.remainingG}g / {bag.bagSizeG}g left
              </div>
              <div className="bq-actions">
                <button type="button" className="bq-btn" data-kind="primary" onClick={() => model.setActive({ activeBagId: bag.id })}>
                  Brew this
                </button>
                <button type="button" className="bq-btn" data-kind="ghost" onClick={() => model.removeBag(bag.id)}>
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <form
        className="bq-form"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <h2>New bag</h2>
        <div className="bq-grid-2">
          <div className="bq-field">
            <label>Roaster</label>
            <input value={draft.roaster ?? ""} onChange={(e) => setDraft({ ...draft, roaster: e.target.value })} />
          </div>
          <div className="bq-field">
            <label>Coffee</label>
            <input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="bq-field">
            <label>Origin</label>
            <input value={draft.origin ?? ""} onChange={(e) => setDraft({ ...draft, origin: e.target.value })} />
          </div>
          <div className="bq-field">
            <label>Roast date</label>
            <input type="date" value={draft.roastDate ?? ""} onChange={(e) => setDraft({ ...draft, roastDate: e.target.value })} />
          </div>
          <div className="bq-field">
            <label>Process</label>
            <select value={draft.process} onChange={(e) => setDraft({ ...draft, process: e.target.value as Bag["process"] })}>
              {PROCESSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="bq-field">
            <label>Roast</label>
            <select value={draft.roast} onChange={(e) => setDraft({ ...draft, roast: e.target.value as Bag["roast"] })}>
              {ROAST_LEVELS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="bq-field">
            <label>Bag size (g)</label>
            <input type="number" value={draft.bagSizeG} onChange={(e) => setDraft({ ...draft, bagSizeG: Number(e.target.value), remainingG: Number(e.target.value) })} />
          </div>
          <div className="bq-field">
            <label>Notes (comma)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="bq-btn" data-kind="primary">
          Add bag
        </button>
      </form>
    </div>
  );
}

export function BrewLog({ model }: { model: BrewIQModel }) {
  const [q, setQ] = useState("");
  const rows = [...model.logs].reverse().filter((e) => {
    if (!q) return true;
    const bag = model.bags.find((b) => b.id === e.recipe.bagId);
    const hay = `${e.recipe.method} ${e.taste?.primary ?? ""} ${bag?.name ?? ""} ${bag?.roaster ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="bq-panel">
      <h2>Log</h2>
      <div className="bq-field" style={{ marginBottom: 12 }}>
        <input placeholder="Filter by method, taste, bag…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="bq-list">
        {rows.length === 0 && <p className="bq-empty">No brews match.</p>}
        {rows.map((e) => {
          const bag = model.bags.find((b) => b.id === e.recipe.bagId);
          return (
            <article key={e.id} className="bq-card">
              <h3>
                {METHOD_META[e.recipe.method].label} · {formatRatio(e.recipe)}
              </h3>
              <div className="bq-meta">
                {new Date(e.at).toLocaleString()} · {bag ? `${bag.roaster} ${bag.name}` : "retired bag"} · grind{" "}
                {e.recipe.grindSetting} · {e.recipe.tempC}°C · {formatTime(e.actualTimeS)}
              </div>
              {e.taste && (
                <div className="bq-meta">
                  {e.taste.score}/10 · {e.taste.primary}
                  {e.taste.note ? ` — ${e.taste.note}` : ""}
                </div>
              )}
              {e.coach && <div className="bq-meta">Brewy: {e.coach.headline}</div>}
              <div className="bq-actions">
                <button type="button" className="bq-btn" onClick={() => model.loadEntry(e)}>
                  Brew this again
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function Insights({ model }: { model: BrewIQModel }) {
  const pts = pointsFor(model.logs);
  const streak = streakFor(model.logs);
  const level = levelFor(pts);
  const flavors = flavorAffinity(model.logs, model.bags);
  const scored = model.logs.filter((e) => e.taste);
  const maxScore = 10;
  const w = 300;
  const h = 110;
  const ptsSvg = scored.map((e, i) => {
    const x = scored.length === 1 ? w / 2 : (i / (scored.length - 1)) * (w - 16) + 8;
    const y = h - 12 - ((e.taste!.score - 1) / (maxScore - 1)) * (h - 24);
    return `${x},${y}`;
  });

  return (
    <div className="bq-panel">
      <h2>Insights</h2>
      <div className="bq-metrics">
        <div className="bq-metric">
          <em>Points</em>
          <strong>{pts}</strong>
        </div>
        <div className="bq-metric">
          <em>Level</em>
          <strong>{level.current.name}</strong>
        </div>
        <div className="bq-metric">
          <em>Streak</em>
          <strong>{streak}d</strong>
        </div>
        <div className="bq-metric">
          <em>Logged</em>
          <strong>{model.logs.length}</strong>
        </div>
      </div>
      {level.next && (
        <p className="bq-meta">
          {level.next.min - pts} points to {level.next.name}
        </p>
      )}
      <h2>Score over time</h2>
      {scored.length === 0 ? (
        <p className="bq-empty">Rate a few cups to see the line.</p>
      ) : (
        <svg className="bq-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Score history">
          <polyline fill="none" stroke="#e8a15a" strokeWidth="2.2" points={ptsSvg.join(" ")} />
        </svg>
      )}
      <h2>What you actually like</h2>
      <div className="bq-list">
        {flavors.length === 0 && <p className="bq-empty">Flavor notes appear after rated brews on tagged bags.</p>}
        {flavors.map((f) => (
          <div key={f.note} className="bq-card">
            <strong>{f.note}</strong>
            <div className="bq-meta">
              avg {f.avg.toFixed(1)} / 10 · {f.n} cups
            </div>
            <div className="bq-bar">
              <i style={{ width: `${(f.avg / 10) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KitStudio({ model }: { model: BrewIQModel }) {
  const ownedG = new Set(model.state?.ownedGrinderIds ?? []);
  const ownedB = new Set(model.state?.ownedBrewerIds ?? []);

  return (
    <div className="bq-panel">
      <h2>Kit — grinders</h2>
      <div className="bq-list">
        {GRINDERS.map((g) => (
          <label key={g.id} className="bq-card" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={ownedG.has(g.id)} onChange={() => model.toggleOwned("grinder", g.id)} />
            <div>
              <strong>
                {g.brand} {g.name}
              </strong>
              <div className="bq-meta">{g.kind} · {Object.keys(g.grind).length} method ranges</div>
            </div>
          </label>
        ))}
      </div>
      <h2>Kit — brewers</h2>
      <div className="bq-list">
        {BREWERS.map((b) => (
          <label key={b.id} className="bq-card" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={ownedB.has(b.id)} onChange={() => model.toggleOwned("brewer", b.id)} />
            <div>
              <strong>
                {b.brand} {b.name}
              </strong>
              <div className="bq-meta">
                {b.methods.map((m) => METHOD_META[m].label).join(", ")}
                {b.profiling ? " · profiling" : ""}
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="bq-actions">
        <button type="button" className="bq-btn" onClick={model.resetDemo}>
          Reset demo data
        </button>
      </div>
    </div>
  );
}

