"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  allBrewers,
  allGrinders,
  brewerById,
  brewersFor,
  coach,
  defaultState,
  freshnessFor,
  getBrewSnapshot,
  getServerBrewSnapshot,
  grinderById,
  grindersFor,
  id,
  recommendRecipe,
  saveState,
  subscribeBrewState,
  type Bag,
  type BrewEntry,
  type BrewMethod,
  type BrewState,
  type CoachAdvice,
  type Recipe,
  type Taste,
  type TasteNote,
} from "@/lib/brewiq";

export type Tab = "brew" | "bags" | "log" | "insights" | "kit";

export function useBrewIQ() {
  const state = useSyncExternalStore(subscribeBrewState, getBrewSnapshot, getServerBrewSnapshot);
  const [tab, setTab] = useState<Tab>("brew");
  const [method, setMethod] = useState<BrewMethod>("espresso");
  const [manual, setManual] = useState<{ key: string; recipe: Recipe } | null>(null);
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [tasteNote, setTasteNote] = useState<TasteNote | null>(null);
  const [score, setScore] = useState(7);

  const write = useCallback((next: BrewState) => {
    saveState(next);
  }, []);

  const grinders = useMemo(() => allGrinders(state), [state]);
  const brewers = useMemo(() => allBrewers(state), [state]);
  const bags = state.bags;
  const logs = state.logs;

  const grinder = useMemo(() => {
    const owned = grindersFor(method, state.custom.grinders).filter((g) =>
      grinders.some((item) => item.id === g.id),
    );
    const catalog = grindersFor(method, state.custom.grinders);
    const pool = owned.length ? owned : catalog;
    return (
      pool.find((g) => g.id === state.activeGrinderId) ??
      pool[0] ??
      grinderById(state.activeGrinderId, state.custom.grinders)
    );
  }, [state, method, grinders]);

  const brewer = useMemo(() => {
    const owned = brewersFor(method, state.custom.brewers).filter((b) =>
      brewers.some((item) => item.id === b.id),
    );
    const catalog = brewersFor(method, state.custom.brewers);
    const pool = owned.length ? owned : catalog;
    return (
      pool.find((b) => b.id === state.activeBrewerId) ??
      pool[0] ??
      brewerById(state.activeBrewerId, state.custom.brewers)
    );
  }, [state, method, brewers]);

  const bag = bags.find((b) => b.id === state.activeBagId) ?? bags[0];
  const kitKey = `${method}|${grinder?.id ?? "?"}|${brewer?.id ?? "?"}|${bag?.id ?? "?"}`;

  const recommended = useMemo(() => {
    if (!grinder || !brewer || !bag) return null;
    return recommendRecipe(method, grinder, brewer, bag, logs);
  }, [grinder, brewer, bag, method, logs]);

  const recipe = manual && manual.key === kitKey ? manual.recipe : recommended;

  const patchRecipe = useCallback(
    (partial: Partial<Recipe>) => {
      const base = (manual && manual.key === kitKey ? manual.recipe : recommended) ?? null;
      if (!base) return;
      setManual({ key: kitKey, recipe: { ...base, ...partial } });
      setAdvice(null);
    },
    [manual, kitKey, recommended],
  );

  const chooseMethod = useCallback(
    (next: BrewMethod) => {
      setMethod(next);
      const gPool = grindersFor(next, state.custom.grinders).filter((g) => grinders.some((o) => o.id === g.id));
      const bPool = brewersFor(next, state.custom.brewers).filter((b) => brewers.some((o) => o.id === b.id));
      write({
        ...state,
        activeGrinderId: gPool.find((g) => g.id === state.activeGrinderId)?.id ?? gPool[0]?.id ?? state.activeGrinderId,
        activeBrewerId: bPool.find((b) => b.id === state.activeBrewerId)?.id ?? bPool[0]?.id ?? state.activeBrewerId,
      });
      setAdvice(null);
    },
    [state, grinders, brewers, write],
  );

  const logBrew = useCallback(
    (actualTimeS: number, taste?: Taste, nextAdvice?: CoachAdvice) => {
      if (!recipe || !bag) return;
      const entry: BrewEntry = {
        id: id("brew"),
        at: new Date().toISOString(),
        recipe,
        phases: [],
        actualTimeS,
        taste,
        coach: nextAdvice,
      };
      write({
        ...state,
        bags: state.bags.map((b) =>
          b.id === recipe.bagId ? { ...b, remainingG: Math.max(0, Number((b.remainingG - recipe.doseG).toFixed(1))) } : b,
        ),
        logs: [...state.logs, entry],
      });
      return entry;
    },
    [state, recipe, bag, write],
  );

  const rateCurrent = useCallback(
    (actualTimeS: number) => {
      if (!recipe || !grinder || !brewer || !bag || !tasteNote) return null;
      const taste: Taste = { score, primary: tasteNote };
      const next = coach(recipe, taste, grinder, brewer, bag, logs);
      setAdvice(next);
      logBrew(actualTimeS, taste, next);
      return next;
    },
    [recipe, grinder, brewer, bag, tasteNote, score, logs, logBrew],
  );

  const applyAdvice = useCallback(() => {
    if (!advice) return;
    setManual({ key: kitKey, recipe: advice.nextRecipe });
  }, [advice, kitKey]);

  const loadEntry = useCallback(
    (entry: BrewEntry) => {
      setMethod(entry.recipe.method);
      const key = `${entry.recipe.method}|${entry.recipe.grinderId}|${entry.recipe.brewerId}|${entry.recipe.bagId}`;
      setManual({ key, recipe: entry.recipe });
      write({
        ...state,
        activeBagId: entry.recipe.bagId,
        activeGrinderId: entry.recipe.grinderId,
        activeBrewerId: entry.recipe.brewerId,
      });
      setAdvice(entry.coach ?? null);
      setTab("brew");
    },
    [state, write],
  );

  const upsertBag = useCallback(
    (bagIn: Bag) => {
      const exists = state.bags.some((b) => b.id === bagIn.id);
      write({
        ...state,
        activeBagId: bagIn.id,
        bags: exists ? state.bags.map((b) => (b.id === bagIn.id ? bagIn : b)) : [bagIn, ...state.bags],
      });
    },
    [state, write],
  );

  const removeBag = useCallback(
    (bagId: string) => {
      const bagsNext = state.bags.filter((b) => b.id !== bagId);
      write({ ...state, bags: bagsNext, activeBagId: bagsNext[0]?.id ?? state.activeBagId });
    },
    [state, write],
  );

  const setActive = useCallback(
    (partial: Partial<Pick<BrewState, "activeBagId" | "activeGrinderId" | "activeBrewerId">>) => {
      write({ ...state, ...partial });
    },
    [state, write],
  );

  const toggleOwned = useCallback(
    (kind: "grinder" | "brewer", itemId: string) => {
      const key = kind === "grinder" ? "ownedGrinderIds" : "ownedBrewerIds";
      const has = state[key].includes(itemId);
      write({ ...state, [key]: has ? state[key].filter((x) => x !== itemId) : [...state[key], itemId] });
    },
    [state, write],
  );

  const resetDemo = useCallback(() => {
    write(defaultState());
    setMethod("espresso");
    setManual(null);
    setAdvice(null);
    setTasteNote(null);
  }, [write]);

  const setRecipe = useCallback(
    (next: Recipe) => {
      setManual({ key: kitKey, recipe: next });
      setAdvice(null);
    },
    [kitKey],
  );

  return {
    ready: Boolean(recipe && grinder && brewer && bag),
    state,
    tab,
    setTab,
    method,
    chooseMethod,
    recipe,
    patchRecipe,
    setRecipe,
    grinder,
    brewer,
    bag,
    bags,
    logs,
    grinders,
    brewers,
    advice,
    tasteNote,
    setTasteNote,
    score,
    setScore,
    freshness: bag && method ? freshnessFor(bag, method) : "peak",
    logBrew,
    rateCurrent,
    applyAdvice,
    loadEntry,
    upsertBag,
    removeBag,
    setActive,
    toggleOwned,
    resetDemo,
  };
}

export type BrewIQModel = ReturnType<typeof useBrewIQ>;
