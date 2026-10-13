"use client";

import type { BrewMethod, Range } from "@/lib/brewiq";
import { METHOD_META, METHODS } from "@/lib/brewiq";

export function Dial({
  label,
  value,
  range,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  range: Range;
  unit?: string;
  onChange: (n: number) => void;
}) {
  const step = range.step;
  const bump = (dir: -1 | 1) => {
    const next = Number((value + dir * step).toFixed(4));
    onChange(Math.min(range.max, Math.max(range.min, next)));
  };
  return (
    <div className="bq-dial">
      <label>{label}</label>
      <div className="bq-dial-read">
        <b>{Number.isInteger(step) ? value : value.toFixed(step < 0.2 ? 1 : step < 1 ? 1 : 0)}</b>
        <span>{unit ?? range.unit}</span>
      </div>
      <div className="bq-step">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => bump(-1)}>
          −
        </button>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <button type="button" aria-label={`Increase ${label}`} onClick={() => bump(1)}>
          +
        </button>
      </div>
    </div>
  );
}

export function MethodPills({ value, onChange }: { value: BrewMethod; onChange: (m: BrewMethod) => void }) {
  return (
    <div className="bq-methods" role="tablist" aria-label="Brew method">
      {METHODS.map((m) => (
        <button key={m} type="button" data-on={value === m} onClick={() => onChange(m)}>
          {METHOD_META[m].label}
        </button>
      ))}
    </div>
  );
}

export function FieldSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bq-select">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}
