import { METHOD_META } from "./catalog";
import type {
  Bag,
  BrewEntry,
  BrewMethod,
  Brewer,
  CoachAdvice,
  Freshness,
  Grinder,
  Lever,
  Phase,
  Recipe,
  TasteNote,
} from "./types";
import { LEVELS } from "./types";

export interface MethodDefaults {
  doseG: number;
  ratio: number;
  tempC: number;
  timeS: number;
  bloomS: number;
  pressureBar: number;
}

export const METHOD_DEFAULTS: Record<BrewMethod, MethodDefaults> = {
  espresso: { doseG: 18, ratio: 2, tempC: 93, timeS: 28, bloomS: 6, pressureBar: 9 },
  v60: { doseG: 15, ratio: 16.7, tempC: 94, timeS: 165, bloomS: 45, pressureBar: 0 },
  kalita: { doseG: 20, ratio: 16, tempC: 93, timeS: 180, bloomS: 40, pressureBar: 0 },
  aeropress: { doseG: 15, ratio: 14.5, tempC: 85, timeS: 90, bloomS: 30, pressureBar: 0 },
  "french-press": { doseG: 30, ratio: 16.7, tempC: 94, timeS: 240, bloomS: 0, pressureBar: 0 },
  chemex: { doseG: 30, ratio: 16.5, tempC: 96, timeS: 240, bloomS: 45, pressureBar: 0 },
  moka: { doseG: 16, ratio: 5, tempC: 96, timeS: 180, bloomS: 0, pressureBar: 1.5 },
  "cold-brew": { doseG: 80, ratio: 10, tempC: 20, timeS: 16 * 3600, bloomS: 0, pressureBar: 0 },
  batch: { doseG: 60, ratio: 16.5, tempC: 94, timeS: 360, bloomS: 0, pressureBar: 0 },
};

const ROAST_TEMP: Record<Bag["roast"], number> = {
  light: 2,
  medium: 0,
  "medium-dark": -1,
  dark: -2,
};

const ROAST_GRIND_BIAS: Record<Bag["roast"], number> = {
  light: -0.15,
  medium: 0,
  "medium-dark": 0.1,
  dark: 0.2,
};

export function daysSinceRoast(roastDate: string, now = Date.now()): number {
  const then = new Date(roastDate + "T00:00:00").getTime();
  if (Number.isNaN(then)) return 10;
  return Math.max(0, Math.floor((now - then) / 86_400_000));
}

export function freshnessFor(bag: Bag, method: BrewMethod, now = Date.now()): Freshness {
  const days = daysSinceRoast(bag.roastDate, now);
  const espressoLike = METHOD_META[method].kind === "espresso";
  const naturalExtra = bag.process === "natural" || bag.process === "anaerobic" ? 2 : 0;
  const darkFaster = bag.roast === "dark" || bag.roast === "medium-dark" ? -2 : 0;
  const degasUntil = (espressoLike ? 7 : 4) + naturalExtra + darkFaster;
  const peakUntil = (espressoLike ? 21 : 28) + naturalExtra;
  if (days < Math.max(2, degasUntil)) return "degassing";
  if (days <= peakUntil) return "peak";
  return "fading";
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function snap(n: number, step: number): number {
  if (step <= 0) return n;
  const decimals = step >= 1 ? 0 : String(step).split(".")[1]?.length ?? 1;
  return Number((Math.round(n / step) * step).toFixed(decimals));
}

export function mid(min: number, max: number): number {
  return (min + max) / 2;
}

export function ratioOf(recipe: Recipe): number {
  const denom = recipe.doseG || 1;
  return METHOD_META[recipe.method].kind === "espresso"
    ? recipe.yieldG / denom
    : recipe.waterG / denom;
}

export function extractionYield(recipe: Recipe): number | null {
  if (!recipe.tds || recipe.tds <= 0 || recipe.doseG <= 0) return null;
  const beverage = METHOD_META[recipe.method].kind === "espresso" ? recipe.yieldG : recipe.waterG;
  return (recipe.tds * beverage) / recipe.doseG;
}

export function formatRatio(recipe: Recipe): string {
  return `1:${ratioOf(recipe).toFixed(2).replace(/\.?0+$/, "")}`;
}

export function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export function grindRange(grinder: Grinder, method: BrewMethod) {
  return grinder.grind[method];
}

export function recommendRecipe(
  method: BrewMethod,
  grinder: Grinder,
  brewer: Brewer,
  bag: Bag,
  history: BrewEntry[] = [],
  now = Date.now(),
): Recipe {
  const prior = [...history]
    .reverse()
    .find(
      (e) =>
        e.recipe.method === method &&
        e.recipe.bagId === bag.id &&
        e.recipe.grinderId === grinder.id &&
        (e.taste?.score ?? 0) >= 8,
    );

  if (prior) {
    return clampRecipe({ ...prior.recipe, bagId: bag.id, grinderId: grinder.id, brewerId: brewer.id }, grinder, brewer);
  }

  const lastOnBag = [...history]
    .reverse()
    .find((e) => e.recipe.method === method && e.recipe.bagId === bag.id && e.coach);

  if (lastOnBag?.coach) {
    return clampRecipe(
      { ...lastOnBag.coach.nextRecipe, bagId: bag.id, grinderId: grinder.id, brewerId: brewer.id },
      grinder,
      brewer,
    );
  }

  const d = METHOD_DEFAULTS[method];
  const range = grindRange(grinder, method) ?? { min: 1, max: 10, step: 1, unit: "" };
  const grindMid = mid(range.min, range.max);
  const grind = snap(grindMid + (range.max - range.min) * ROAST_GRIND_BIAS[bag.roast], range.step);

  let temp = d.tempC + ROAST_TEMP[bag.roast];
  if (brewer.temp) temp = clamp(temp, brewer.temp.min, brewer.temp.max);

  const fresh = freshnessFor(bag, method, now);
  let timeS = d.timeS;
  let bloomS = d.bloomS;
  let doseG = d.doseG;
  if (fresh === "degassing") {
    timeS = Math.round(d.timeS * 0.94);
    bloomS = d.bloomS ? Math.max(10, d.bloomS - 8) : 0;
  } else if (fresh === "fading") {
    temp += 1;
    doseG += method === "espresso" ? 0.5 : 1;
    timeS = Math.round(d.timeS * 1.05);
  }

  const waterG = METHOD_META[method].kind === "espresso" ? Number((doseG * d.ratio).toFixed(1)) : Number((doseG * d.ratio).toFixed(1));
  const yieldG = METHOD_META[method].kind === "espresso" ? waterG : Number((waterG * 0.88).toFixed(1));

  const recipe: Recipe = {
    method,
    grinderId: grinder.id,
    brewerId: brewer.id,
    bagId: bag.id,
    doseG,
    yieldG,
    waterG,
    grindSetting: clamp(grind, range.min, range.max),
    tempC: snap(temp, brewer.temp?.step ?? 1),
    bloomS,
    timeS,
    pressureBar: brewer.pressure ? clamp(d.pressureBar || brewer.pressure.min, brewer.pressure.min, brewer.pressure.max) : d.pressureBar,
    profile: brewer.profiling
      ? [
          { atS: 0, bar: 3 },
          { atS: d.bloomS || 6, bar: 9 },
          { atS: d.timeS, bar: 8.5 },
        ]
      : undefined,
  };

  return clampRecipe(recipe, grinder, brewer);
}

export function clampRecipe(recipe: Recipe, grinder: Grinder, brewer: Brewer): Recipe {
  const next = { ...recipe };
  const grind = grindRange(grinder, recipe.method);
  if (grind) next.grindSetting = clamp(snap(next.grindSetting, grind.step), grind.min, grind.max);
  if (brewer.temp) next.tempC = clamp(snap(next.tempC, brewer.temp.step), brewer.temp.min, brewer.temp.max);
  if (brewer.pressure) next.pressureBar = clamp(snap(next.pressureBar, brewer.pressure.step), brewer.pressure.min, brewer.pressure.max);
  next.doseG = clamp(Number(next.doseG.toFixed(1)), 5, 200);
  next.waterG = clamp(Number(next.waterG.toFixed(1)), 10, 2000);
  next.yieldG = clamp(Number(next.yieldG.toFixed(1)), 5, 2000);
  next.timeS = Math.max(1, Math.round(next.timeS));
  next.bloomS = Math.max(0, Math.round(next.bloomS));
  return next;
}

const UNDER: TasteNote[] = ["sour", "salty", "thin", "hollow"];
const OVER: TasteNote[] = ["bitter", "harsh", "astringent", "muddy"];
const GOOD: TasteNote[] = ["balanced", "sweet", "syrupy"];

function lastFailedLever(history: BrewEntry[], bagId: string, method: BrewMethod): Lever | null {
  const last = [...history].reverse().find((e) => e.recipe.bagId === bagId && e.recipe.method === method && e.coach && e.taste);
  if (!last?.coach || !last.taste) return null;
  if (GOOD.includes(last.taste.primary)) return null;
  return last.coach.lever;
}

export function coach(
  recipe: Recipe,
  taste: { score: number; primary: TasteNote },
  grinder: Grinder,
  brewer: Brewer,
  bag: Bag,
  history: BrewEntry[] = [],
): CoachAdvice {
  const grind = grindRange(grinder, recipe.method) ?? { min: 1, max: 10, step: 1, unit: "" };
  const avoided = lastFailedLever(history, recipe.bagId, recipe.method);
  const fresh = freshnessFor(bag, recipe.method);
  const espresso = METHOD_META[recipe.method].kind === "espresso";

  if (GOOD.includes(taste.primary) || taste.score >= 8) {
    return {
      lever: "wait",
      direction: "hold",
      delta: 0,
      unit: "",
      headline: "Lock this recipe.",
      why: `${taste.primary[0].toUpperCase()}${taste.primary.slice(1)} at ${taste.score}/10 — change nothing on this bag until the roast age shifts.`,
      nextRecipe: { ...recipe },
    };
  }

  if (fresh === "degassing" && (taste.primary === "sour" || taste.primary === "harsh")) {
    return {
      lever: "wait",
      direction: "wait",
      delta: Math.max(1, 7 - daysSinceRoast(bag.roastDate)),
      unit: "days",
      headline: `Park the bag ${Math.max(1, 7 - daysSinceRoast(bag.roastDate))} more day(s).`,
      why: `${bag.name} is still degassing (${daysSinceRoast(bag.roastDate)} days off roast). CO₂ fights even extraction — wait beats another grind chase.`,
      nextRecipe: { ...recipe },
    };
  }

  type Plan = { lever: Lever; direction: "up" | "down"; delta: number; unit: string; headline: string; why: string; apply: (r: Recipe) => Recipe };
  const plans: Plan[] = [];

  const grindStep = grind.step;
  const grindUp = (r0: Recipe) => ({ ...r0, grindSetting: r0.grindSetting + grindStep });
  const grindDown = (r0: Recipe) => ({ ...r0, grindSetting: r0.grindSetting - grindStep });

  if (UNDER.includes(taste.primary)) {
    plans.push({
      lever: "grind",
      direction: "down",
      delta: grindStep,
      unit: "setting",
      headline: `Go to ${snap(recipe.grindSetting - grindStep, grindStep)} on the ${grinder.brand} ${grinder.name}.`,
      why: `${taste.primary[0].toUpperCase()}${taste.primary.slice(1)} is under-extraction. One finer step stays inside ${grind.min}–${grind.max} on this grinder.`,
      apply: grindDown,
    });
    plans.push({
      lever: "temp",
      direction: "up",
      delta: 1,
      unit: "°C",
      headline: `Raise brew temp to ${recipe.tempC + 1}°C.`,
      why: "Hotter water pulls solubles the grind did not. One degree, nothing else.",
      apply: (r0) => ({ ...r0, tempC: r0.tempC + 1 }),
    });
    plans.push({
      lever: "time",
      direction: "up",
      delta: espresso ? 3 : 12,
      unit: "s",
      headline: espresso ? "Aim 3 seconds longer on the shot." : "Add 12 seconds of contact time.",
      why: "More contact without moving grind or dose — the clean next test.",
      apply: (r0) => ({ ...r0, timeS: r0.timeS + (espresso ? 3 : 12) }),
    });
    if (taste.primary === "thin") {
      plans.unshift({
        lever: "ratio",
        direction: "down",
        delta: espresso ? 2 : recipe.doseG,
        unit: "g",
        headline: espresso ? `Stop the shot 2 g earlier (${recipe.yieldG - 2} g).` : `Add ${recipe.doseG >= 20 ? 2 : 1} g more coffee.`,
        why: "Thin means strength, not just extraction. Tighten the ratio one step.",
        apply: (r0) =>
          espresso
            ? { ...r0, yieldG: r0.yieldG - 2, waterG: r0.waterG - 2 }
            : { ...r0, doseG: r0.doseG + 1, waterG: r0.waterG },
      });
    }
  } else if (OVER.includes(taste.primary)) {
    plans.push({
      lever: "grind",
      direction: "up",
      delta: grindStep,
      unit: "setting",
      headline: `Open to ${snap(recipe.grindSetting + grindStep, grindStep)} on the ${grinder.brand} ${grinder.name}.`,
      why: `${taste.primary[0].toUpperCase()}${taste.primary.slice(1)} is over-extraction. One coarser step, still inside this grinder's ${recipe.method} range.`,
      apply: grindUp,
    });
    plans.push({
      lever: "temp",
      direction: "down",
      delta: 2,
      unit: "°C",
      headline: `Drop to ${recipe.tempC - 2}°C.`,
      why: "A two-degree cut tames harshness without throwing the grind window away.",
      apply: (r0) => ({ ...r0, tempC: r0.tempC - 2 }),
    });
    plans.push({
      lever: "time",
      direction: "down",
      delta: espresso ? 3 : 12,
      unit: "s",
      headline: espresso ? "Cut the shot 3 seconds shorter." : "Pull the contact time back 12 seconds.",
      why: "Less contact, same grind — isolates whether time was the problem.",
      apply: (r0) => ({ ...r0, timeS: Math.max(8, r0.timeS - (espresso ? 3 : 12)) }),
    });
    if (taste.primary === "muddy") {
      plans.unshift({
        lever: "grind",
        direction: "up",
        delta: grindStep,
        unit: "setting",
        headline: `Coarsen to ${snap(recipe.grindSetting + grindStep, grindStep)} — muddy usually means too many fines.`,
        why: "Muddy cups are fines, not temperature. Move only the burrs.",
        apply: grindUp,
      });
    }
  } else {
    plans.push({
      lever: "bloom",
      direction: "up",
      delta: 5,
      unit: "s",
      headline: `Bloom 5 seconds longer (${recipe.bloomS + 5}s).`,
      why: "A longer bloom evens the bed when the cup is close but not locked.",
      apply: (r0) => ({ ...r0, bloomS: r0.bloomS + 5 }),
    });
  }

  if (fresh === "fading") {
    plans.unshift({
      lever: "dose",
      direction: "up",
      delta: 1,
      unit: "g",
      headline: `Add 1 g of dose (${recipe.doseG + 1} g). The bag is fading.`,
      why: `${daysSinceRoast(bag.roastDate)} days off roast — extra dose recovers strength before you chase grind.`,
      apply: (r0) => ({ ...r0, doseG: r0.doseG + 1 }),
    });
  }

  const usable = plans.filter((p) => {
    if (avoided && p.lever === avoided) return false;
    const trial = clampRecipe(p.apply({ ...recipe }), grinder, brewer);
    if (p.lever === "grind" && trial.grindSetting === recipe.grindSetting) return false;
    if (p.lever === "temp" && trial.tempC === recipe.tempC) return false;
    return true;
  });

  const pick = usable[0] ?? plans[0];
  const nextRecipe = clampRecipe(pick.apply({ ...recipe }), grinder, brewer);

  return {
    lever: pick.lever,
    direction: pick.direction,
    delta: pick.delta,
    unit: pick.unit,
    headline: pick.headline,
    why: pick.why,
    nextRecipe,
  };
}

export function phasesFor(recipe: Recipe): Phase[] {
  switch (recipe.method) {
    case "espresso":
      return [
        { id: "pre", name: "Pre-infusion", seconds: recipe.bloomS || 6, hint: "Low pressure, wet the puck" },
        { id: "shot", name: "Shot", seconds: Math.max(8, recipe.timeS - (recipe.bloomS || 6)), hint: `Target ${recipe.yieldG} g in the cup` },
      ];
    case "v60":
    case "kalita":
    case "chemex": {
      const bloom = recipe.bloomS || 40;
      const rest = Math.max(30, recipe.timeS - bloom);
      const pulse = Math.round(rest / 3);
      return [
        { id: "bloom", name: "Bloom", seconds: bloom, hint: `Pour ~${Math.round(recipe.doseG * 2)} g, swirl` },
        { id: "p1", name: "Pulse 1", seconds: pulse, hint: "Centre pour to 60%" },
        { id: "p2", name: "Pulse 2", seconds: pulse, hint: "Spiral to the wall" },
        { id: "draw", name: "Drawdown", seconds: rest - pulse * 2, hint: "Bed should finish flat" },
      ];
    }
    case "aeropress":
      return [
        { id: "bloom", name: "Bloom", seconds: recipe.bloomS || 30, hint: "Stir 3 times" },
        { id: "steep", name: "Steep", seconds: Math.max(20, recipe.timeS - (recipe.bloomS || 30) - 20), hint: "Cap on, no press" },
        { id: "press", name: "Press", seconds: 20, hint: "30 seconds, gentle" },
      ];
    case "french-press":
      return [
        { id: "steep", name: "Steep", seconds: recipe.timeS, hint: "Break crust at 4:00, then plunge" },
        { id: "plunge", name: "Plunge", seconds: 15, hint: "Slow, straight down" },
      ];
    case "moka":
      return [
        { id: "heat", name: "Heat", seconds: Math.max(60, recipe.timeS - 40), hint: "Medium flame, valve hissing" },
        { id: "cut", name: "Cut", seconds: 40, hint: "Off heat as it blondes" },
      ];
    case "cold-brew":
      return [
        { id: "steep", name: "Steep", seconds: recipe.timeS, hint: "Fridge, covered" },
        { id: "filter", name: "Filter", seconds: 600, hint: "Cloth or paper, no press" },
      ];
    case "batch":
      return [{ id: "brew", name: "Brew cycle", seconds: recipe.timeS, hint: "Do not interrupt the basket" }];
  }
}

export function pointsFor(logs: BrewEntry[]): number {
  let pts = 0;
  for (const e of logs) {
    pts += 10;
    if (e.taste) pts += 5;
    if (e.taste && e.taste.score >= 8) pts += 10;
    if (e.coach && e.coach.direction !== "hold") pts += 5;
  }
  return pts;
}

export function streakFor(logs: BrewEntry[], now = Date.now()): number {
  const days = new Set(logs.map((e) => e.at.slice(0, 10)));
  let streak = 0;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const key = new Date(start.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    if (days.has(key)) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}

export function levelFor(points: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.min) current = lvl;
  }
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  const next = LEVELS[idx + 1] as (typeof LEVELS)[number] | undefined;
  return { current, next, points };
}

export function flavorAffinity(logs: BrewEntry[], bags: Bag[]): { note: string; avg: number; n: number }[] {
  const map = new Map<string, { sum: number; n: number }>();
  for (const e of logs) {
    if (!e.taste) continue;
    const bag = bags.find((b) => b.id === e.recipe.bagId);
    for (const note of bag?.flavorNotes ?? []) {
      const cur = map.get(note) ?? { sum: 0, n: 0 };
      cur.sum += e.taste.score;
      cur.n += 1;
      map.set(note, cur);
    }
  }
  return [...map.entries()]
    .map(([note, v]) => ({ note, avg: v.sum / v.n, n: v.n }))
    .sort((a, b) => b.avg - a.avg);
}

export function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
