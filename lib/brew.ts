export interface BrewMethod {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  defaults: {
    dose: number; // grams coffee
    ratio: number; // water:coffee, e.g. 16 means 1:16
    temp: number; // °C
    grind: number; // 1 (extra fine) – 10 (extra coarse)
    time: number; // total seconds target
    bloom: boolean;
    bloomTime: number; // seconds
    pours: number; // number of pours after bloom
    agitation: number; // 0 none – 3 vigorous
  };
  grindLabel: string;
  range: {
    dose: [number, number];
    ratio: [number, number];
    temp: [number, number];
    grind: [number, number];
    time: [number, number];
  };
  tips: string[];
}

export const GRIND_LABELS: { max: number; label: string; microns: string }[] = [
  { max: 1.5, label: "Extra fine", microns: "≈ 200 µm · powder" },
  { max: 3, label: "Fine", microns: "≈ 400 µm · table salt" },
  { max: 4.5, label: "Medium-fine", microns: "≈ 600 µm · raw sugar" },
  { max: 6, label: "Medium", microns: "≈ 800 µm · sea salt" },
  { max: 7.5, label: "Medium-coarse", microns: "≈ 1000 µm · coarse sugar" },
  { max: 10.1, label: "Coarse", microns: "≈ 1200 µm+ · breadcrumbs" },
];

export function grindLabel(v: number): { label: string; microns: string } {
  for (const g of GRIND_LABELS) if (v <= g.max) return g;
  return GRIND_LABELS[GRIND_LABELS.length - 1];
}

export const BREW_METHODS: BrewMethod[] = [
  {
    id: "v60",
    name: "V60 Pour Over",
    icon: "◍",
    tagline: "Clean, sweet, articulate",
    description:
      "Conical dripper. Full control over every pour — bloom, pulses, drawdown. The reference method for dialling in flavour.",
    defaults: { dose: 15, ratio: 16, temp: 93, grind: 4.2, time: 180, bloom: true, bloomTime: 45, pours: 3, agitation: 1 },
    grindLabel: "Medium-fine",
    range: { dose: [10, 30], ratio: [14, 18], temp: [85, 98], grind: [3, 6], time: [120, 300] },
    tips: [
      "Bloom with 2–3× coffee weight, swirl to wet all grounds.",
      "Keep water level steady — avoid pouring down the paper.",
      "Target dry bed flat at the end; craters mean channelling.",
    ],
  },
  {
    id: "aeropress",
    name: "AeroPress",
    icon: "⬢",
    tagline: "Fast, forgiving, versatile",
    description:
      "Immersion + pressure. Short brew, fine-medium grind, full control of steep time and press force.",
    defaults: { dose: 17, ratio: 13, temp: 88, grind: 3.4, time: 120, bloom: false, bloomTime: 0, pours: 1, agitation: 2 },
    grindLabel: "Fine–medium",
    range: { dose: [12, 22], ratio: [10, 16], temp: [80, 96], grind: [2, 5], time: [60, 240] },
    tips: [
      "Inverted method gives full control of steep time.",
      "Stir once at 1:00, cap and flip, press gently 20–30 s.",
      "Cooler water (85–90 °C) tames darker roasts.",
    ],
  },
  {
    id: "frenchpress",
    name: "French Press",
    icon: "▦",
    tagline: "Heavy body, round sweetness",
    description:
      "Full immersion. Coarse grind, long steep, no paper — oils stay in the cup.",
    defaults: { dose: 30, ratio: 14, temp: 94, grind: 8, time: 240, bloom: false, bloomTime: 0, pours: 1, agitation: 1 },
    grindLabel: "Coarse",
    range: { dose: [15, 60], ratio: [12, 17], temp: [90, 98], grind: [6.5, 10], time: [180, 360] },
    tips: [
      "Break the crust at 4:00 and skim foam for a cleaner cup.",
      "Plunge just to the surface — don't squeeze the bed.",
      "Decant immediately to stop extraction.",
    ],
  },
  {
    id: "espresso",
    name: "Espresso",
    icon: "●",
    tagline: "Intense, syrupy, concentrated",
    description:
      "9 bars, 25–30 s, 1:2 ratio. Grind is the steering wheel — 0.2 steps matter.",
    defaults: { dose: 18, ratio: 2, temp: 93, grind: 1.4, time: 28, bloom: false, bloomTime: 0, pours: 1, agitation: 0 },
    grindLabel: "Extra fine",
    range: { dose: [14, 22], ratio: [1.5, 3], temp: [88, 96], grind: [1, 2.5], time: [20, 40] },
    tips: [
      "Lock yield first (e.g. 36 g out), then chase time with grind.",
      "Sour + fast → grind finer. Bitter + slow → grind coarser.",
      "WDT + level tamp beats tamping harder.",
    ],
  },
  {
    id: "moka",
    name: "Moka Pot",
    icon: "▲",
    tagline: "Bold, old-school punch",
    description:
      "Stovetop pressure brewer. Hot water in, medium-low heat, pull it early to dodge bitterness.",
    defaults: { dose: 20, ratio: 10, temp: 90, grind: 2.6, time: 300, bloom: false, bloomTime: 0, pours: 1, agitation: 0 },
    grindLabel: "Fine",
    range: { dose: [12, 24], ratio: [8, 12], temp: [85, 96], grind: [2, 4], time: [180, 420] },
    tips: [
      "Fill basket loose and level — never tamp.",
      "Start with hot water in the base to shorten the cook.",
      "Cut heat when it starts to gurgle / blond.",
    ],
  },
  {
    id: "coldbrew",
    name: "Cold Brew",
    icon: "❄",
    tagline: "Smooth, low-acid, sweet",
    description:
      "Time does the extracting. Coarse grind, 12–18 h steep, dilute to taste.",
    defaults: { dose: 80, ratio: 10, temp: 20, grind: 9, time: 50400, bloom: false, bloomTime: 0, pours: 1, agitation: 0 },
    grindLabel: "Extra coarse",
    range: { dose: [40, 120], ratio: [8, 14], temp: [4, 25], grind: [7, 10], time: [28800, 64800] },
    tips: [
      "Steep 14–16 h at room temp for max sweetness.",
      "Filter twice — coarse strain then paper pass.",
      "Concentrate keeps 7–10 days refrigerated.",
    ],
  },
  {
    id: "chemex",
    name: "Chemex",
    icon: "◇",
    tagline: "Tea-like clarity",
    description:
      "Thick filter, bigger dose, coarser grind. Patient pours, sparkling cup.",
    defaults: { dose: 30, ratio: 15.5, temp: 94, grind: 6.2, time: 270, bloom: true, bloomTime: 60, pours: 4, agitation: 1 },
    grindLabel: "Medium-coarse",
    range: { dose: [20, 45], ratio: [14, 17], temp: [88, 98], grind: [5, 8], time: [180, 360] },
    tips: [
      "Rinse the thick filter with ≥ 200 g hot water first.",
      "Bloom 60 s — the bed needs it at this dose.",
      "Keep slurry temp stable; don't let it stall.",
    ],
  },
];

export interface BrewParams {
  methodId: string;
  dose: number;
  ratio: number;
  temp: number;
  grind: number;
  time: number;
  bloom: boolean;
  bloomTime: number;
  pours: number;
  agitation: number; // 0–3
  roast: number; // 0 light – 2 dark (0,1,2)
}

export interface BrewCalc {
  water: number;
  bloomWater: number;
  beverage: number;
  ey: number; // extraction yield %
  tds: number; // %
  strength: "Light" | "Balanced" | "Bold";
  extraction: "Under-extracted" | "Sweet spot" | "Over-extracted";
  caffeine: number; // mg
  cups: number;
  score: number; // 0–100 dial-in score
  verdict: string;
  fixes: string[];
}

export function calculateBrew(p: BrewParams): BrewCalc {
  const water = p.dose * p.ratio;
  const bloomWater = p.bloom ? Math.round(p.dose * 2.5) : 0;
  const absorption = p.methodId === "frenchpress" || p.methodId === "coldbrew" ? 1.6 : 2.0;
  const beverage = Math.max(water - p.dose * absorption, water * 0.7);

  // Extraction-yield model (heuristic, tuned to feel right across methods)
  let ey = 19.5;
  ey += (p.temp - 93) * 0.32;
  ey += (5.2 - p.grind) * 0.85;
  const method = BREW_METHODS.find((m) => m.id === p.methodId);
  const tRef = method?.defaults.time ?? 180;
  if (p.methodId !== "coldbrew") {
    const ratio = p.time / Math.max(tRef, 1);
    ey += (Math.min(Math.max(ratio, 0.4), 1.8) - 1) * 6.5;
  }
  ey += p.agitation * 0.45;
  if (p.roast === 2) ey += 1.1;
  if (p.roast === 0) ey -= 0.9;
  if (p.methodId === "espresso") ey += 1.5;
  if (p.methodId === "moka") ey += 0.8;
  ey = Math.min(26, Math.max(11, ey));

  const tds = beverage > 0 ? (p.dose * (ey / 100)) / beverage * 100 : 0;

  const strength: BrewCalc["strength"] =
    p.methodId === "espresso"
      ? tds < 7 ? "Light" : tds <= 10 ? "Balanced" : "Bold"
      : tds < 1.15 ? "Light" : tds <= 1.5 ? "Balanced" : "Bold";

  const extraction: BrewCalc["extraction"] =
    ey < 17.5 ? "Under-extracted" : ey <= 22 ? "Sweet spot" : "Over-extracted";

  const caffeine = Math.round(p.dose * 11.5 * (0.72 + ey / 100));

  const cups = water / 240;

  // Dial-in score: distance from ideal box (TDS target depends on method)
  const tdsTarget = p.methodId === "espresso" ? 8.5 : 1.32;
  const eyTarget = 19.8;
  const tdsErr = Math.abs(tds - tdsTarget) / tdsTarget;
  const eyErr = Math.abs(ey - eyTarget) / 6;
  const score = Math.round(Math.min(99, Math.max(35, 99 - (tdsErr * 55 + eyErr * 45))));

  const fixes: string[] = [];
  if (extraction === "Under-extracted") {
    fixes.push("Tastes sour / salty / thin? Grind a touch finer or extend the brew 15–20 s.");
    if (p.temp < 92 && p.methodId !== "coldbrew") fixes.push(`Water at ${p.temp}°C is cool — try ${Math.min(p.temp + 2, 96)}°C.`);
    if (!p.bloom && (p.methodId === "v60" || p.methodId === "chemex")) fixes.push("Add a 45 s bloom to even out extraction.");
  }
  if (extraction === "Over-extracted") {
    fixes.push("Tastes bitter / dry / hollow? Grind coarser or shorten the brew.");
    if (p.temp > 94) fixes.push(`Drop temp to ~92°C to soften harshness.`);
  }
  if (strength === "Light" && extraction !== "Under-extracted") fixes.push("Weak but not sour? Tighten the ratio (less water per gram).");
  if (strength === "Bold" && extraction !== "Over-extracted") fixes.push("Strong but not bitter? Open the ratio up (more water per gram).");
  if (fixes.length === 0) fixes.push("Dialled in. Log this recipe — change one variable at a time from here.");

  const verdict =
    extraction === "Sweet spot" && strength === "Balanced"
      ? "Dialled in — expect sweetness, clarity and a round finish."
      : extraction === "Sweet spot"
        ? `Extraction is on point; strength runs ${strength.toLowerCase()} — adjust ratio to taste.`
        : `${extraction.toLowerCase()} — ${strength.toLowerCase()} cup. ${fixes[0]}`;

  return { water: Math.round(water), bloomWater, beverage: Math.round(beverage), ey: +ey.toFixed(1), tds: +tds.toFixed(2), strength, extraction, caffeine, cups: +cups.toFixed(1), score, verdict, fixes };
}

export interface BrewStage {
  id: string;
  label: string;
  detail: string;
  pourTo: number; // cumulative grams on scale
  pourAmount: number;
  atSec: number;
  durationSec: number;
}

export function buildStages(p: BrewParams, water: number): BrewStage[] {
  if (p.methodId === "coldbrew") {
    return [
      { id: "s1", label: "Combine", detail: `Stir ${p.dose} g coarse coffee with ${water} g room-temp water until fully wet.`, pourTo: water, pourAmount: water, atSec: 0, durationSec: 120 },
      { id: "s2", label: "Steep", detail: "Cover and steep 14–16 h at room temp (or 18+ h in fridge).", pourTo: water, pourAmount: 0, atSec: 120, durationSec: 14 * 3600 },
      { id: "s3", label: "Filter & dilute", detail: "Strain, paper-filter, dilute 1:1 with water or milk over ice.", pourTo: water, pourAmount: 0, atSec: 14 * 3600 + 120, durationSec: 300 },
    ];
  }
  if (p.methodId === "espresso") {
    return [
      { id: "s1", label: "Pull", detail: `Start pump. Target ${Math.round(p.dose * p.ratio)} g out in ~${p.time} s.`, pourTo: Math.round(p.dose * p.ratio), pourAmount: Math.round(p.dose * p.ratio), atSec: 0, durationSec: p.time },
      { id: "s2", label: "Stop at yield", detail: "Stop by weight, not colour. Swirl and taste.", pourTo: Math.round(p.dose * p.ratio), pourAmount: 0, atSec: p.time, durationSec: 10 },
    ];
  }
  if (p.methodId === "frenchpress" || p.methodId === "aeropress" || p.methodId === "moka") {
    const label = p.methodId === "frenchpress" ? "Steep" : p.methodId === "aeropress" ? "Steep + press" : "Brew on heat";
    return [
      { id: "s1", label: "Pour all water", detail: `Pour ${water} g at ${p.temp}°C, start timer, ${p.agitation > 0 ? "stir gently" : "no stirring"}.`, pourTo: water, pourAmount: water, atSec: 0, durationSec: 15 },
      { id: "s2", label: label, detail: p.methodId === "moka" ? "Medium-low heat, lid open. Cut heat at first gurgle." : p.methodId === "aeropress" ? `Cap on. At 1:00 stir once, press gently at ${Math.max(p.time - 30, 60)} s.` : "Lid on (don't plunge). Break crust at 4:00, skim, then plunge.", pourTo: water, pourAmount: 0, atSec: 15, durationSec: Math.max(p.time - 15, 30) },
      { id: "s3", label: "Serve", detail: "Decant fully and immediately — every extra minute extracts.", pourTo: water, pourAmount: 0, atSec: p.time, durationSec: 15 },
    ];
  }
  // Pour-over family (v60 / chemex): bloom + N pulses spread across total time
  const stages: BrewStage[] = [];
  const bloomW = p.bloom ? Math.round(p.dose * 2.5) : 0;
  let cursor = 0;
  let cumulative = 0;
  if (p.bloom) {
    cumulative = bloomW;
    stages.push({ id: "s0", label: "Bloom", detail: `Pour to ${bloomW} g, swirl. Wait ${p.bloomTime} s — bed should bubble and rise.`, pourTo: cumulative, pourAmount: bloomW, atSec: 0, durationSec: p.bloomTime });
    cursor = p.bloomTime;
  }
  const remaining = water - cumulative;
  const n = Math.max(p.pours, 1);
  const pourWindow = Math.max(p.time - cursor - 45, 60); // leave 45 s drawdown
  const gap = pourWindow / n;
  for (let i = 0; i < n; i++) {
    const amt = Math.round(remaining / n);
    cumulative += i === n - 1 ? remaining - amt * (n - 1) : amt;
    const at = Math.round(cursor + i * gap);
    stages.push({
      id: `s${i + 1}`,
      label: `Pour ${i + 1} of ${n}`,
      detail: i === n - 1 ? `Top up to ${water} g with slow spirals. Let it draw down.` : `Pour to ${Math.round(cumulative)} g in slow spirals.`,
      pourTo: Math.round(cumulative),
      pourAmount: i === n - 1 ? Math.round(remaining - amt * (n - 1)) : amt,
      atSec: at,
      durationSec: Math.round(gap),
    });
  }
  stages.push({ id: "draw", label: "Drawdown", detail: `Dripper should run dry around ${Math.floor(p.time / 60)}:${String(p.time % 60).padStart(2, "0")}. Swirl once, serve.`, pourTo: water, pourAmount: 0, atSec: p.time - 45, durationSec: 45 });
  return stages;
}

export interface SavedRecipe extends BrewParams {
  name: string;
  savedAt: string;
  note?: string;
}

export interface BrewLog {
  id: string;
  at: string;
  methodId: string;
  dose: number;
  ratio: number;
  temp: number;
  grind: number;
  rating: number; // 1–5
  note: string;
  tds: number;
  ey: number;
}
