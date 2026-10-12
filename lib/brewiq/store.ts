import { BREWERS, GRINDERS } from "./catalog";
import { daysSinceRoast } from "./engine";
import type { Bag, BrewState } from "./types";

export const STORAGE_KEY = "brewiq-full-control-v1";

const SEED_NOW = Date.UTC(2026, 9, 12, 15, 0, 0);

function isoDaysAgo(days: number): string {
  return new Date(SEED_NOW - days * 86_400_000).toISOString().slice(0, 10);
}

function isoHoursAgo(hours: number): string {
  return new Date(SEED_NOW - hours * 3_600_000).toISOString();
}

export const SEED_BAGS: Bag[] = [
  {
    id: "bag-huila",
    name: "El Paraiso Pink Bourbon",
    roaster: "Sey",
    origin: "Huila, Colombia",
    process: "washed",
    roast: "light",
    roastDate: isoDaysAgo(9),
    remainingG: 186,
    bagSizeG: 250,
    flavorNotes: ["jasmine", "bergamot", "cane sugar"],
  },
  {
    id: "bag-yirg",
    name: "Idido Natural",
    roaster: "Onyx",
    origin: "Yirgacheffe, Ethiopia",
    process: "natural",
    roast: "light",
    roastDate: isoDaysAgo(4),
    remainingG: 210,
    bagSizeG: 250,
    flavorNotes: ["blueberry", "cocoa", "floral"],
  },
  {
    id: "bag-brazil",
    name: "Cerrado Pulped Natural",
    roaster: "Square Mile",
    origin: "Cerrado, Brazil",
    process: "honey",
    roast: "medium",
    roastDate: isoDaysAgo(14),
    remainingG: 412,
    bagSizeG: 500,
    flavorNotes: ["chocolate", "hazelnut", "orange"],
  },
];

export function defaultState(): BrewState {
  const bags = SEED_BAGS.map((b) => ({ ...b }));
  return {
    version: 1,
    activeGrinderId: "fellow-opus",
    activeBrewerId: "decent-de1",
    activeBagId: bags[0].id,
    ownedGrinderIds: ["fellow-opus", "comandante-c40", "niche-zero"],
    ownedBrewerIds: [
      "decent-de1",
      "gaggia-classic-pro",
      "hario-v60-02",
      "kalita-wave-185",
      "aeropress-original",
      "bodum-chambord",
      "chemex-6",
      "bialetti-moka-6",
      "toddy-cold",
      "moccamaster",
    ],
    bags,
    custom: { grinders: [], brewers: [] },
    logs: [
      {
        id: "brew-seed-1",
        at: isoHoursAgo(26),
        recipe: {
          method: "espresso",
          grinderId: "fellow-opus",
          brewerId: "decent-de1",
          bagId: "bag-brazil",
          doseG: 18,
          yieldG: 36,
          waterG: 36,
          grindSetting: 2.5,
          tempC: 93,
          bloomS: 6,
          timeS: 29,
          pressureBar: 9,
        },
        phases: [],
        actualTimeS: 29,
        taste: { score: 8, primary: "sweet", note: "Hazelnut, clean finish" },
      },
      {
        id: "brew-seed-2",
        at: isoHoursAgo(20),
        recipe: {
          method: "v60",
          grinderId: "comandante-c40",
          brewerId: "hario-v60-02",
          bagId: "bag-huila",
          doseG: 15,
          yieldG: 220,
          waterG: 250,
          grindSetting: 22,
          tempC: 96,
          bloomS: 45,
          timeS: 168,
          pressureBar: 0,
        },
        phases: [],
        actualTimeS: 171,
        taste: { score: 6, primary: "sour", note: "Bright but lean" },
      },
      {
        id: "brew-seed-3",
        at: isoHoursAgo(3),
        recipe: {
          method: "espresso",
          grinderId: "fellow-opus",
          brewerId: "decent-de1",
          bagId: "bag-huila",
          doseG: 18,
          yieldG: 34,
          waterG: 34,
          grindSetting: 2,
          tempC: 94,
          bloomS: 7,
          timeS: 26,
          pressureBar: 8.5,
        },
        phases: [],
        actualTimeS: 26,
        taste: { score: 5, primary: "sour" },
      },
    ],
  };
}

const SERVER_STATE = defaultState();
const listeners = new Set<() => void>();
let cachedRaw = "UNSET";
let cachedState: BrewState = SERVER_STATE;

function emit() {
  for (const listener of listeners) listener();
}

export function parseState(raw: string | null): BrewState {
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as BrewState;
    if (parsed.version !== 1 || !Array.isArray(parsed.bags) || !Array.isArray(parsed.logs)) {
      return defaultState();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

export function subscribeBrewState(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

export function getBrewSnapshot(): BrewState {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
  const key = raw ?? "";
  if (key === cachedRaw) return cachedState;
  cachedRaw = key;
  cachedState = raw ? parseState(raw) : SERVER_STATE;
  return cachedState;
}

export function getServerBrewSnapshot(): BrewState {
  return SERVER_STATE;
}

export function loadState(): BrewState {
  if (typeof window === "undefined") return SERVER_STATE;
  return getBrewSnapshot();
}

export function saveState(state: BrewState): void {
  cachedState = state;
  cachedRaw = JSON.stringify(state);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  }
  emit();
}

export function allGrinders(state: BrewState) {
  const owned = new Set(state.ownedGrinderIds);
  return [...GRINDERS, ...state.custom.grinders].filter((g) => owned.has(g.id) || state.custom.grinders.some((c) => c.id === g.id));
}

export function allBrewers(state: BrewState) {
  const owned = new Set(state.ownedBrewerIds);
  return [...BREWERS, ...state.custom.brewers].filter((b) => owned.has(b.id) || state.custom.brewers.some((c) => c.id === b.id));
}

export function bagFreshnessLabel(bag: Bag): string {
  const days = daysSinceRoast(bag.roastDate);
  return `${days}d off roast`;
}
