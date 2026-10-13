"use client";

import Link from "next/link";
import { levelFor, pointsFor, streakFor } from "@/lib/brewiq";
import { BrewConsole } from "./BrewConsole";
import { BrewyPanel } from "./BrewyPanel";
import { BagShelf, BrewLog, Insights, KitStudio } from "./Library";
import { useBrewIQ, type Tab } from "./useBrewIQ";

const TABS: { id: Tab; label: string }[] = [
  { id: "brew", label: "Brew" },
  { id: "bags", label: "Bags" },
  { id: "log", label: "Log" },
  { id: "insights", label: "Insights" },
  { id: "kit", label: "Kit" },
];

export default function BrewIQApp() {
  const model = useBrewIQ();
  const pts = pointsFor(model.logs);
  const level = levelFor(pts);
  const streak = streakFor(model.logs);
  const remaining = model.bag ? `${Math.round(model.bag.remainingG)}g left` : "No bag";

  return (
    <div className="bq-app">
      <header className="bq-top">
        <div className="bq-brand">
          <Link className="bq-back" href="/">
            ← anuva.blog
          </Link>
          <div className="bq-kicker">Interactive project</div>
          <div className="bq-title">BrewIQ Full Control</div>
          <div className="bq-sub">Every lever on the bench. Brewy moves only one.</div>
        </div>
        <div className="bq-stats">
          <div className="bq-chip">
            Streak <strong>{streak}d</strong>
          </div>
          <div className="bq-chip">
            {level.current.name} <strong>{pts} pts</strong>
          </div>
          <div className="bq-chip">
            {model.bag?.name ?? "Bag"} <strong>{remaining}</strong>
          </div>
        </div>
      </header>

      {!model.ready ? (
        <div className="bq-panel">Loading the bench…</div>
      ) : (
        <div className="bq-shell">
          <nav className="bq-nav" aria-label="BrewIQ">
            {TABS.map((t) => (
              <button key={t.id} type="button" data-on={model.tab === t.id} onClick={() => model.setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div>
            {model.tab === "brew" && <BrewConsole model={model} />}
            {model.tab === "bags" && <BagShelf model={model} />}
            {model.tab === "log" && <BrewLog model={model} />}
            {model.tab === "insights" && <Insights model={model} />}
            {model.tab === "kit" && <KitStudio model={model} />}
          </div>
          <BrewyPanel model={model} />
        </div>
      )}
    </div>
  );
}
