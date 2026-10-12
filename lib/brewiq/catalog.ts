import type { Brewer, BrewMethod, Grinder, Range } from "./types";

function r(min: number, max: number, step: number, unit = ""): Range {
  return { min, max, step, unit };
}

function grindMap(rows: Partial<Record<BrewMethod, [number, number, number]>>): Grinder["grind"] {
  const out: Grinder["grind"] = {};
  for (const [method, triple] of Object.entries(rows) as [BrewMethod, [number, number, number]][]) {
    out[method] = r(triple[0], triple[1], triple[2]);
  }
  return out;
}

export const GRINDERS: Grinder[] = [
  {
    id: "fellow-opus",
    name: "Opus",
    brand: "Fellow",
    kind: "electric",
    grind: grindMap({
      espresso: [1, 4.5, 0.5],
      moka: [3, 5.5, 0.5],
      aeropress: [4, 6.5, 0.5],
      v60: [5, 7.5, 0.5],
      kalita: [5, 7.5, 0.5],
      chemex: [6, 8.5, 0.5],
      "french-press": [8, 10.5, 0.5],
      "cold-brew": [9, 11, 0.5],
      batch: [7, 9.5, 0.5],
    }),
  },
  {
    id: "baratza-encore-esp",
    name: "Encore ESP",
    brand: "Baratza",
    kind: "electric",
    grind: grindMap({
      espresso: [1, 16, 1],
      moka: [10, 18, 1],
      aeropress: [12, 22, 1],
      v60: [15, 25, 1],
      kalita: [15, 25, 1],
      chemex: [20, 30, 1],
      "french-press": [28, 36, 1],
      "cold-brew": [32, 40, 1],
      batch: [22, 32, 1],
    }),
  },
  {
    id: "niche-zero",
    name: "Zero",
    brand: "Niche",
    kind: "electric",
    grind: grindMap({
      espresso: [4, 26, 1],
      moka: [18, 32, 1],
      aeropress: [28, 48, 1],
      v60: [40, 62, 1],
      kalita: [40, 62, 1],
      chemex: [50, 72, 1],
      "french-press": [68, 86, 1],
      "cold-brew": [74, 90, 1],
      batch: [52, 74, 1],
    }),
  },
  {
    id: "comandante-c40",
    name: "C40 MK4",
    brand: "Comandante",
    kind: "hand",
    grind: grindMap({
      espresso: [8, 14, 1],
      moka: [12, 16, 1],
      aeropress: [14, 20, 1],
      v60: [18, 26, 1],
      kalita: [18, 26, 1],
      chemex: [22, 30, 1],
      "french-press": [28, 36, 1],
      "cold-brew": [32, 40, 1],
      batch: [24, 32, 1],
    }),
  },
  {
    id: "1zpresso-jmax",
    name: "J-Max",
    brand: "1Zpresso",
    kind: "hand",
    grind: grindMap({
      espresso: [40, 90, 2],
      moka: [80, 120, 2],
      aeropress: [100, 160, 2],
      v60: [150, 210, 2],
      kalita: [150, 210, 2],
      chemex: [190, 250, 2],
      "french-press": [240, 300, 2],
      "cold-brew": [270, 330, 2],
      batch: [200, 260, 2],
    }),
  },
  {
    id: "df64",
    name: "DF64 Gen 2",
    brand: "Turin",
    kind: "electric",
    grind: grindMap({
      espresso: [8, 28, 1],
      moka: [22, 36, 1],
      aeropress: [30, 50, 1],
      v60: [42, 64, 1],
      kalita: [42, 64, 1],
      chemex: [52, 74, 1],
      "french-press": [70, 88, 1],
      "cold-brew": [78, 92, 1],
      batch: [54, 76, 1],
    }),
  },
  {
    id: "eureka-specialita",
    name: "Mignon Specialita",
    brand: "Eureka",
    kind: "electric",
    grind: grindMap({
      espresso: [1, 5, 0.1],
      moka: [3.5, 5.5, 0.1],
      aeropress: [4.5, 6.5, 0.1],
      v60: [5.5, 7.5, 0.1],
      kalita: [5.5, 7.5, 0.1],
      chemex: [6.5, 8.5, 0.1],
      "french-press": [8, 10, 0.1],
      "cold-brew": [9, 11, 0.1],
      batch: [7, 9, 0.1],
    }),
  },
  {
    id: "timemore-c3",
    name: "C3 ESP",
    brand: "Timemore",
    kind: "hand",
    grind: grindMap({
      espresso: [8, 16, 1],
      moka: [14, 18, 1],
      aeropress: [16, 22, 1],
      v60: [18, 24, 1],
      kalita: [18, 24, 1],
      chemex: [22, 28, 1],
      "french-press": [26, 34, 1],
      "cold-brew": [30, 36, 1],
      batch: [22, 30, 1],
    }),
  },
];

export const BREWERS: Brewer[] = [
  {
    id: "decent-de1",
    name: "DE1",
    brand: "Decent",
    methods: ["espresso"],
    temp: r(80, 98, 0.5, "°C"),
    pressure: r(0, 12, 0.1, "bar"),
    profiling: true,
  },
  {
    id: "gaggia-classic-pro",
    name: "Classic Pro",
    brand: "Gaggia",
    methods: ["espresso"],
    temp: r(88, 96, 1, "°C"),
    pressure: r(6, 11, 0.5, "bar"),
  },
  {
    id: "breville-bambino",
    name: "Bambino Plus",
    brand: "Breville",
    methods: ["espresso"],
    temp: r(90, 96, 1, "°C"),
    pressure: r(7, 10, 0.5, "bar"),
  },
  {
    id: "flair-58",
    name: "58",
    brand: "Flair",
    methods: ["espresso"],
    temp: r(85, 96, 1, "°C"),
    pressure: r(4, 12, 0.5, "bar"),
    profiling: true,
  },
  {
    id: "linea-mini",
    name: "Linea Mini",
    brand: "La Marzocco",
    methods: ["espresso"],
    temp: r(88, 96, 0.5, "°C"),
    pressure: r(6, 10, 0.1, "bar"),
  },
  {
    id: "hario-v60-02",
    name: "V60-02",
    brand: "Hario",
    methods: ["v60"],
    temp: r(86, 98, 1, "°C"),
  },
  {
    id: "fellow-stagg-xf",
    name: "Stagg [XF]",
    brand: "Fellow",
    methods: ["v60"],
    temp: r(86, 98, 1, "°C"),
  },
  {
    id: "kalita-wave-185",
    name: "Wave 185",
    brand: "Kalita",
    methods: ["kalita"],
    temp: r(86, 96, 1, "°C"),
  },
  {
    id: "aeropress-original",
    name: "Original",
    brand: "AeroPress",
    methods: ["aeropress"],
    temp: r(75, 96, 1, "°C"),
  },
  {
    id: "bodum-chambord",
    name: "Chambord 8-cup",
    brand: "Bodum",
    methods: ["french-press"],
    temp: r(88, 96, 1, "°C"),
  },
  {
    id: "chemex-6",
    name: "6-cup",
    brand: "Chemex",
    methods: ["chemex"],
    temp: r(90, 98, 1, "°C"),
  },
  {
    id: "bialetti-moka-6",
    name: "Moka Express 6-cup",
    brand: "Bialetti",
    methods: ["moka"],
    temp: r(90, 100, 1, "°C"),
    pressure: r(1, 2.5, 0.1, "bar"),
  },
  {
    id: "toddy-cold",
    name: "Cold Brewer",
    brand: "Toddy",
    methods: ["cold-brew"],
  },
  {
    id: "moccamaster",
    name: "KBGV Select",
    brand: "Moccamaster",
    methods: ["batch"],
    temp: r(92, 96, 1, "°C"),
  },
];

export const METHOD_META: Record<
  BrewMethod,
  { label: string; short: string; kind: "espresso" | "filter" | "immersion" }
> = {
  espresso: { label: "Espresso", short: "ES", kind: "espresso" },
  v60: { label: "V60", short: "V60", kind: "filter" },
  kalita: { label: "Kalita Wave", short: "KW", kind: "filter" },
  aeropress: { label: "AeroPress", short: "AP", kind: "immersion" },
  "french-press": { label: "French press", short: "FP", kind: "immersion" },
  chemex: { label: "Chemex", short: "CX", kind: "filter" },
  moka: { label: "Moka pot", short: "MK", kind: "espresso" },
  "cold-brew": { label: "Cold brew", short: "CB", kind: "immersion" },
  batch: { label: "Batch brew", short: "BB", kind: "filter" },
};

export function grinderById(id: string, extra: Grinder[] = []): Grinder | undefined {
  return extra.find((g) => g.id === id) ?? GRINDERS.find((g) => g.id === id);
}

export function brewerById(id: string, extra: Brewer[] = []): Brewer | undefined {
  return extra.find((b) => b.id === id) ?? BREWERS.find((b) => b.id === id);
}

export function grindersFor(method: BrewMethod, extra: Grinder[] = []): Grinder[] {
  return [...GRINDERS, ...extra].filter((g) => g.grind[method]);
}

export function brewersFor(method: BrewMethod, extra: Brewer[] = []): Brewer[] {
  return [...BREWERS, ...extra].filter((b) => b.methods.includes(method));
}
