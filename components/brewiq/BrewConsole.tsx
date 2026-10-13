"use client";

import { extractionYield, formatRatio, formatTime, grindRange, METHOD_META, recommendRecipe, type Recipe } from "@/lib/brewiq";
import { MethodPills, FieldSelect, Dial } from "./controls";
import { BrewTimer } from "./BrewTimer";
import { TastePad } from "./TastePad";
import type { BrewIQModel } from "./useBrewIQ";

export function BrewConsole({ model }: { model: BrewIQModel }) {
  const { recipe, grinder, brewer, bag, bags, grinders, brewers, method, freshness } = model;
  if (!recipe || !grinder || !brewer || !bag) return null;

  const grind = grindRange(grinder, method) ?? { min: 1, max: 10, step: 1, unit: "" };
  const tempRange = brewer.temp ?? { min: 80, max: 100, step: 1, unit: "°C" };
  const espresso = METHOD_META[method].kind === "espresso";
  const ey = extractionYield(recipe);

  const set = (partial: Partial<Recipe>) => model.patchRecipe(partial);

  const onRatioWater = (waterOrYield: number) => {
    if (espresso) set({ yieldG: waterOrYield, waterG: waterOrYield });
    else set({ waterG: waterOrYield, yieldG: Number((waterOrYield * 0.88).toFixed(1)) });
  };

  return (
    <div className="bq-panel">
      <h2>Full control</h2>
      <MethodPills value={method} onChange={model.chooseMethod} />

      <div className="bq-row">
        <FieldSelect label="Grinder" value={grinder.id} onChange={(id) => model.setActive({ activeGrinderId: id })}>
          {grinders
            .filter((g) => g.grind[method])
            .map((g) => (
              <option key={g.id} value={g.id}>
                {g.brand} {g.name}
              </option>
            ))}
        </FieldSelect>
        <FieldSelect label="Brewer" value={brewer.id} onChange={(id) => model.setActive({ activeBrewerId: id })}>
          {brewers
            .filter((b) => b.methods.includes(method))
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.brand} {b.name}
              </option>
            ))}
        </FieldSelect>
        <FieldSelect label="Bag" value={bag.id} onChange={(id) => model.setActive({ activeBagId: id })}>
          {bags.map((b) => (
            <option key={b.id} value={b.id}>
              {b.roaster} · {b.name}
            </option>
          ))}
        </FieldSelect>
      </div>

      <div className="bq-metrics">
        <div className="bq-metric">
          <em>Ratio</em>
          <strong>{formatRatio(recipe)}</strong>
        </div>
        <div className="bq-metric">
          <em>Bag</em>
          <strong className="bq-fresh" data-s={freshness}>
            {freshness}
          </strong>
        </div>
        <div className="bq-metric">
          <em>Target time</em>
          <strong>{formatTime(recipe.timeS)}</strong>
        </div>
        <div className="bq-metric">
          <em>EY</em>
          <strong>{ey ? `${ey.toFixed(1)}%` : "add TDS"}</strong>
        </div>
      </div>

      <div className="bq-dials">
        <Dial label="Dose" value={recipe.doseG} unit="g" range={{ min: 7, max: 120, step: 0.5, unit: "g" }} onChange={(doseG) => set({ doseG })} />
        <Dial
          label={`Grind · ${grinder.name}`}
          value={recipe.grindSetting}
          range={grind}
          unit="setting"
          onChange={(grindSetting) => set({ grindSetting })}
        />
        <Dial label="Temperature" value={recipe.tempC} range={tempRange} unit="°C" onChange={(tempC) => set({ tempC })} />
        <Dial
          label={espresso ? "Yield" : "Water"}
          value={espresso ? recipe.yieldG : recipe.waterG}
          unit="g"
          range={{ min: espresso ? 14 : 80, max: espresso ? 70 : 1500, step: espresso ? 0.5 : 5, unit: "g" }}
          onChange={onRatioWater}
        />
        <Dial
          label="Contact time"
          value={recipe.timeS}
          unit="s"
          range={{
            min: method === "cold-brew" ? 8 * 3600 : 10,
            max: method === "cold-brew" ? 24 * 3600 : 600,
            step: method === "cold-brew" ? 600 : 1,
            unit: "s",
          }}
          onChange={(timeS) => set({ timeS })}
        />
        <Dial label="Bloom / pre-infusion" value={recipe.bloomS} unit="s" range={{ min: 0, max: 90, step: 1, unit: "s" }} onChange={(bloomS) => set({ bloomS })} />
        {brewer.pressure && (
          <Dial
            label="Peak pressure"
            value={recipe.pressureBar}
            range={brewer.pressure}
            unit="bar"
            onChange={(pressureBar) => set({ pressureBar })}
          />
        )}
        <Dial
          label="TDS (optional)"
          value={recipe.tds ?? 0}
          unit="%"
          range={{ min: 0, max: 14, step: 0.1, unit: "%" }}
          onChange={(tds) => set({ tds: tds <= 0 ? undefined : tds })}
        />
      </div>

      <div className="bq-actions">
        <button
          type="button"
          className="bq-btn"
          onClick={() => {
            if (model.grinder && model.brewer && model.bag) {
              model.setRecipe(recommendRecipe(model.method, model.grinder, model.brewer, model.bag, model.logs));
            }
          }}
        >
          Ask Brewy for tonight’s recipe
        </button>
        <button type="button" className="bq-btn" data-kind="ghost" onClick={() => model.logBrew(recipe.timeS)}>
          Log without rating
        </button>
      </div>

      <BrewTimer recipe={recipe} onCommit={(t) => model.logBrew(t)} />

      <div style={{ marginTop: 16 }}>
        <TastePad model={model} />
      </div>

      {brewer.profiling && recipe.profile && (
        <div style={{ marginTop: 18 }}>
          <h2>Pressure profile</h2>
          <PressureProfile recipe={recipe} onChange={(profile) => set({ profile })} />
        </div>
      )}
    </div>
  );
}

function PressureProfile({
  recipe,
  onChange,
}: {
  recipe: Recipe;
  onChange: (p: NonNullable<Recipe["profile"]>) => void;
}) {
  const profile = recipe.profile ?? [];
  const maxT = Math.max(recipe.timeS, ...profile.map((p) => p.atS), 1);
  const maxP = 12;
  const pts = profile
    .map((p) => `${(p.atS / maxT) * 280 + 10},${80 - (p.bar / maxP) * 68}`)
    .join(" ");

  return (
    <div>
      <svg className="bq-profile" viewBox="0 0 300 90" role="img" aria-label="Pressure profile">
        <polyline fill="none" stroke="#e8a15a" strokeWidth="2.4" points={pts} />
        {profile.map((p, i) => (
          <circle key={i} cx={(p.atS / maxT) * 280 + 10} cy={80 - (p.bar / maxP) * 68} r="4" fill="#f4ebe0" />
        ))}
      </svg>
      <div className="bq-grid-2">
        {profile.map((p, i) => (
          <div key={i} className="bq-field">
            <label>
              Point {i + 1}
            </label>
            <div className="bq-step">
              <input
                type="number"
                value={p.atS}
                onChange={(e) => {
                  const next = profile.map((x, j) => (j === i ? { ...x, atS: Number(e.target.value) } : x));
                  onChange(next);
                }}
              />
              <input
                type="number"
                step="0.1"
                value={p.bar}
                onChange={(e) => {
                  const next = profile.map((x, j) => (j === i ? { ...x, bar: Number(e.target.value) } : x));
                  onChange(next);
                }}
              />
            </div>
            <div className="bq-meta">{p.atS}s · {p.bar} bar</div>
          </div>
        ))}
      </div>
    </div>
  );
}
