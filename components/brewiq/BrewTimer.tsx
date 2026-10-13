"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatTime, phasesFor, type Phase, type Recipe } from "@/lib/brewiq";

export function BrewTimer({
  recipe,
  onCommit,
}: {
  recipe: Recipe;
  onCommit: (actualTimeS: number) => void;
}) {
  return (
    <TimerInner
      key={`${recipe.method}-${recipe.timeS}-${recipe.bloomS}`}
      recipe={recipe}
      onCommit={onCommit}
    />
  );
}

function TimerInner({
  recipe,
  onCommit,
}: {
  recipe: Recipe;
  onCommit: (actualTimeS: number) => void;
}) {
  const phases = useMemo(() => phasesFor(recipe), [recipe]);
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const raf = useRef<number>(0);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const tick = (t: number) => {
      const dt = (t - last.current) / 1000;
      last.current = t;
      setElapsed((e) => e + dt);
      setPhaseElapsed((e) => e + dt);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const phase: Phase | undefined = phases[idx];
  const overtime = phase ? phaseElapsed > phase.seconds + 2 : false;

  const skip = () => {
    if (idx >= phases.length - 1) {
      setRunning(false);
      onCommit(Math.round(elapsed || recipe.timeS));
      return;
    }
    setIdx((i) => i + 1);
    setPhaseElapsed(0);
  };

  return (
    <div>
      <h2>Live timer</h2>
      <div className="bq-timer">
        <div>
          <div className="bq-clock">
            {formatTime(Math.floor(elapsed))}
            <small>{phase ? `${phase.name} · ${formatTime(Math.max(0, Math.ceil(phase.seconds - phaseElapsed)))} left` : "Ready"}</small>
          </div>
          <div className="bq-actions">
            <button type="button" className="bq-btn" data-kind="primary" onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button type="button" className="bq-btn" onClick={skip} disabled={!phase}>
              {idx >= phases.length - 1 ? "Finish" : "Next phase"}
            </button>
            <button
              type="button"
              className="bq-btn"
              data-kind="ghost"
              onClick={() => {
                setRunning(false);
                setIdx(0);
                setElapsed(0);
                setPhaseElapsed(0);
              }}
            >
              Reset
            </button>
          </div>
          {overtime && <div className="bq-nudge">This phase is running long. Finish the pour or skip.</div>}
        </div>
        <div className="bq-phases">
          {phases.map((p, i) => (
            <div key={p.id} className="bq-phase" data-on={i === idx} data-done={i < idx}>
              <div>
                <strong>{p.name}</strong>
                <div className="bq-meta">{p.hint}</div>
              </div>
              <span>{formatTime(p.seconds)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
