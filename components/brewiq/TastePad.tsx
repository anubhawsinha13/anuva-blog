"use client";

import { TASTE_NOTES, type TasteNote } from "@/lib/brewiq";
import type { BrewIQModel } from "./useBrewIQ";

const FAMILY: Record<TasteNote, "under" | "over" | "good"> = {
  sour: "under",
  salty: "under",
  thin: "under",
  hollow: "under",
  bitter: "over",
  harsh: "over",
  astringent: "over",
  muddy: "over",
  balanced: "good",
  sweet: "good",
  syrupy: "good",
};

export function TastePad({ model }: { model: BrewIQModel }) {
  return (
    <div>
      <h2>Rate the cup</h2>
      <p className="bq-meta" style={{ marginBottom: 8 }}>
        One descriptor. One score. Brewy moves a single lever — never three things at once.
      </p>
      <div className="bq-taste">
        {TASTE_NOTES.map((note) => (
          <button
            key={note}
            type="button"
            data-family={FAMILY[note]}
            data-on={model.tasteNote === note}
            onClick={() => model.setTasteNote(note)}
          >
            {note}
          </button>
        ))}
      </div>
      <div className="bq-score" aria-label="Score out of 10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" data-on={model.score === n} onClick={() => model.setScore(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="bq-actions">
        <button
          type="button"
          className="bq-btn"
          data-kind="primary"
          disabled={!model.tasteNote}
          onClick={() => model.rateCurrent(model.recipe?.timeS ?? 0)}
        >
          Log taste and ask Brewy
        </button>
      </div>
    </div>
  );
}
