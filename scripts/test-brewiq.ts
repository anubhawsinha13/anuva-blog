/**
 * Engine checks for BrewIQ Full Control. Run: npx tsx scripts/test-brewiq.ts
 */
import assert from "node:assert/strict";
import { BREWERS, GRINDERS } from "../lib/brewiq/catalog";
import {
  clampRecipe,
  coach,
  daysSinceRoast,
  freshnessFor,
  formatRatio,
  phasesFor,
  pointsFor,
  ratioOf,
  recommendRecipe,
} from "../lib/brewiq/engine";
import { defaultState } from "../lib/brewiq/store";
import type { Bag, Recipe } from "../lib/brewiq/types";

const opus = GRINDERS.find((g) => g.id === "fellow-opus")!;
const decent = BREWERS.find((b) => b.id === "decent-de1")!;
const v60 = BREWERS.find((b) => b.id === "hario-v60-02")!;

const bag: Bag = {
  id: "t-bag",
  name: "Test Lot",
  roaster: "Test",
  origin: "Huila",
  process: "washed",
  roast: "light",
  roastDate: new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10),
  remainingG: 200,
  bagSizeG: 250,
  flavorNotes: ["citrus"],
};

function baseEspresso(): Recipe {
  return recommendRecipe("espresso", opus, decent, bag, []);
}

// Freshness windows
assert.equal(freshnessFor({ ...bag, roastDate: new Date().toISOString().slice(0, 10) }, "espresso"), "degassing");
assert.equal(freshnessFor(bag, "espresso"), "peak");
assert.equal(freshnessFor({ ...bag, roastDate: new Date(Date.now() - 40 * 86_400_000).toISOString().slice(0, 10) }, "espresso"), "fading");
assert.ok(daysSinceRoast(bag.roastDate) >= 9);

// Recipe stays inside kit ranges
const rec = baseEspresso();
const grind = opus.grind.espresso!;
assert.ok(rec.grindSetting >= grind.min && rec.grindSetting <= grind.max, "grind in Opus espresso range");
assert.ok(rec.tempC >= decent.temp!.min && rec.tempC <= decent.temp!.max);
assert.ok(Math.abs(ratioOf(rec) - 2) < 0.4, `espresso ratio near 1:2, got ${ratioOf(rec)}`);
assert.match(formatRatio(rec), /^1:/);

// Light roast runs hotter than dark
const darkBag = { ...bag, roast: "dark" as const };
const light = recommendRecipe("espresso", opus, decent, bag, []);
const dark = recommendRecipe("espresso", opus, decent, darkBag, []);
assert.ok(light.tempC >= dark.tempC, "light roast should not be cooler than dark");

// Coach: sour → one finer grind, nothing else material
const sour = coach(rec, { score: 5, primary: "sour" }, opus, decent, bag, []);
assert.equal(sour.lever, "grind");
assert.equal(sour.direction, "down");
assert.equal(sour.nextRecipe.tempC, rec.tempC);
assert.equal(sour.nextRecipe.doseG, rec.doseG);
assert.ok(sour.nextRecipe.grindSetting < rec.grindSetting);

// Coach: bitter → coarser, one lever
const bitter = coach(rec, { score: 4, primary: "bitter" }, opus, decent, bag, []);
assert.equal(bitter.lever, "grind");
assert.ok(bitter.nextRecipe.grindSetting > rec.grindSetting);
assert.equal(bitter.nextRecipe.tempC, rec.tempC);

// Great cup locks the recipe
const lock = coach(rec, { score: 9, primary: "syrupy" }, opus, decent, bag, []);
assert.equal(lock.direction, "hold");
assert.deepEqual(lock.nextRecipe, rec);

// If grind advice already failed, rotate lever
const failed = [
  {
    id: "x",
    at: new Date().toISOString(),
    recipe: rec,
    phases: [],
    actualTimeS: 28,
    taste: { score: 5, primary: "sour" as const },
    coach: sour,
  },
];
const rotated = coach(rec, { score: 5, primary: "sour" }, opus, decent, bag, failed);
assert.notEqual(rotated.lever, "grind", "do not repeat a failed grind lever");

// Clamp never escapes kit
const wild = clampRecipe({ ...rec, grindSetting: 99, tempC: 200, doseG: 1 }, opus, decent);
assert.ok(wild.grindSetting <= grind.max);
assert.ok(wild.tempC <= decent.temp!.max);
assert.ok(wild.doseG >= 5);

// Phases exist for every method we ship
const filter = recommendRecipe("v60", opus, v60, bag, []);
assert.ok(phasesFor(rec).length >= 2);
assert.ok(phasesFor(filter).some((p) => p.id === "bloom"));

// Seed state is coherent
const seed = defaultState();
assert.ok(seed.bags.length >= 3);
assert.ok(seed.logs.length >= 2);
assert.ok(pointsFor(seed.logs) > 0);

console.log("BrewIQ engine: all checks passed.");
