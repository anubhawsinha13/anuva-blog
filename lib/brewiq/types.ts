export const METHODS = [
  "espresso",
  "v60",
  "kalita",
  "aeropress",
  "french-press",
  "chemex",
  "moka",
  "cold-brew",
  "batch",
] as const;

export type BrewMethod = (typeof METHODS)[number];

export const TASTE_NOTES = [
  "sour",
  "salty",
  "thin",
  "hollow",
  "bitter",
  "harsh",
  "astringent",
  "muddy",
  "balanced",
  "sweet",
  "syrupy",
] as const;

export type TasteNote = (typeof TASTE_NOTES)[number];

export const ROAST_LEVELS = ["light", "medium", "medium-dark", "dark"] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const PROCESSES = ["washed", "natural", "honey", "anaerobic", "other"] as const;
export type Process = (typeof PROCESSES)[number];

export const LEVERS = ["grind", "temp", "time", "ratio", "dose", "bloom", "wait"] as const;
export type Lever = (typeof LEVERS)[number];

export type Freshness = "degassing" | "peak" | "fading";

export interface Range {
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface Grinder {
  id: string;
  name: string;
  brand: string;
  kind: "electric" | "hand";
  grind: Partial<Record<BrewMethod, Range>>;
}

export interface Brewer {
  id: string;
  name: string;
  brand: string;
  methods: BrewMethod[];
  temp?: Range;
  pressure?: Range;
  profiling?: boolean;
}

export interface Bag {
  id: string;
  name: string;
  roaster: string;
  origin: string;
  process: Process;
  roast: RoastLevel;
  roastDate: string;
  remainingG: number;
  bagSizeG: number;
  flavorNotes: string[];
}

export interface PressurePoint {
  atS: number;
  bar: number;
}

export interface Recipe {
  method: BrewMethod;
  grinderId: string;
  brewerId: string;
  bagId: string;
  doseG: number;
  yieldG: number;
  waterG: number;
  grindSetting: number;
  tempC: number;
  bloomS: number;
  timeS: number;
  pressureBar: number;
  tds?: number;
  profile?: PressurePoint[];
}

export interface Taste {
  score: number;
  primary: TasteNote;
  note?: string;
}

export interface Phase {
  id: string;
  name: string;
  seconds: number;
  hint: string;
}

export interface CoachAdvice {
  lever: Lever;
  direction: "up" | "down" | "hold" | "wait";
  delta: number;
  unit: string;
  headline: string;
  why: string;
  nextRecipe: Recipe;
}

export interface BrewEntry {
  id: string;
  at: string;
  recipe: Recipe;
  phases: Phase[];
  actualTimeS: number;
  taste?: Taste;
  coach?: CoachAdvice;
}

export interface CustomKit {
  grinders: Grinder[];
  brewers: Brewer[];
}

export interface BrewState {
  version: 1;
  activeGrinderId: string;
  activeBrewerId: string;
  activeBagId: string;
  ownedGrinderIds: string[];
  ownedBrewerIds: string[];
  bags: Bag[];
  logs: BrewEntry[];
  custom: CustomKit;
}

export const LEVELS = [
  { id: "beginner", name: "Beginner", min: 0 },
  { id: "home", name: "Home Barista", min: 50 },
  { id: "dialled", name: "Dialled In", min: 150 },
  { id: "barista", name: "Barista", min: 350 },
  { id: "champion", name: "World Barista", min: 700 },
  { id: "god", name: "Coffee God", min: 1200 },
] as const;
