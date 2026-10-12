"use client";

import { daysSinceRoast, formatRatio } from "@/lib/brewiq";
import type { BrewIQModel } from "./useBrewIQ";

export function BrewyPanel({ model }: { model: BrewIQModel }) {
  const { advice, bag, recipe, freshness, grinder, brewer } = model;

  return (
    <aside className="bq-panel bq-brewy">
      <h2>Brewy</h2>
      {!advice && (
        <>
          <h3>One lever. Your kit. This bag.</h3>
          <p>
            {bag ? (
              <>
                {bag.roaster} {bag.name} is{" "}
                <span className="bq-fresh" data-s={freshness}>
                  {freshness}
                </span>{" "}
                · {daysSinceRoast(bag.roastDate)} days off roast.{" "}
                {grinder && brewer && recipe ? (
                  <>
                    Tonight sits at grind {recipe.grindSetting} on the {grinder.brand} {grinder.name}, {recipe.tempC}°C,{" "}
                    {formatRatio(recipe)} on the {brewer.name}.
                  </>
                ) : null}
              </>
            ) : (
              "Load a bag to start."
            )}
          </p>
          <p>
            Rate the cup when you are done. I will change exactly one thing for the next brew — a real setting on this
            grinder, not “a bit finer.”
          </p>
        </>
      )}
      {advice && (
        <>
          <h3>{advice.headline}</h3>
          <p className="bq-quote">{advice.why}</p>
          <p>
            Lever: <strong>{advice.lever}</strong>
            {advice.delta ? (
              <>
                {" "}
                · {advice.direction} {advice.delta}
                {advice.unit ? ` ${advice.unit}` : ""}
              </>
            ) : null}
          </p>
          {advice.direction !== "hold" && advice.direction !== "wait" && (
            <button type="button" className="bq-btn" data-kind="primary" onClick={model.applyAdvice}>
              Load next brew
            </button>
          )}
        </>
      )}
    </aside>
  );
}
