import {
  ACTION_HELP,
  apiaryTrack,
  fruitTrack,
  GOLD_PIN_INDEX,
  perennialFor,
  RONDEL,
  ROUND_EVENTS,
  shedItem,
} from "./data.ts";
import {
  DICE_COUNT,
  ROUND_COUNT,
  SPACE_COUNT,
  type Actor,
  type Die,
  type DraftPick,
  type EdithAction,
  type GameState,
  type Phase,
} from "./types.ts";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollValues(seed: number): { values: number[]; nextSeed: number } {
  const rand = mulberry32(seed);
  const values = Array.from({ length: DICE_COUNT }, () => 1 + Math.floor(rand() * 6));
  return { values, nextSeed: (seed + 1) >>> 0 };
}

export function placeDice(values: number[], edithIndex: number): Die[] {
  const groups = new Map<number, number>();
  for (const v of values) groups.set(v, (groups.get(v) ?? 0) + 1);
  const sorted = [...groups.keys()].sort((a, b) => a - b);
  const dice: Die[] = [];
  let n = 0;
  sorted.forEach((value, groupOffset) => {
    const count = groups.get(value) ?? 0;
    const spaceIndex = (edithIndex + groupOffset) % SPACE_COUNT;
    for (let i = 0; i < count; i += 1) {
      dice.push({ id: `d${n++}`, value, spaceIndex });
    }
  });
  return dice;
}

export function edithAfterPlacement(values: number[], edithIndex: number): number {
  const unique = new Set(values).size;
  return (edithIndex + unique) % SPACE_COUNT;
}

export function remainingDice(state: Pick<GameState, "dice" | "remainingIds">): Die[] {
  return state.dice.filter((d) => state.remainingIds.includes(d.id));
}

/** Edith's first die: gold pin, then clockwise. */
export function edithFirstDieId(dice: Die[], remainingIds: string[]): string | null {
  const live = dice.filter((d) => remainingIds.includes(d.id));
  if (live.length === 0) return null;
  for (let step = 0; step < SPACE_COUNT; step += 1) {
    const idx = (GOLD_PIN_INDEX + step) % SPACE_COUNT;
    const here = live.filter((d) => d.spaceIndex === idx);
    if (here.length > 0) return here[0].id;
  }
  return live[0].id;
}

/** Lowest remaining die (ties share a space). */
export function lowestDieId(dice: Die[], remainingIds: string[]): string | null {
  const live = dice.filter((d) => remainingIds.includes(d.id));
  if (live.length === 0) return null;
  const min = Math.min(...live.map((d) => d.value));
  return live.find((d) => d.value === min)?.id ?? null;
}

export function youAreFirst(round: number): boolean {
  return round % 2 === 1;
}

export function pickCount(state: GameState): number {
  return state.picks.length;
}

export function actorForPickIndex(round: number, index: number): Actor {
  const first: Actor = youAreFirst(round) ? "you" : "edith";
  const second: Actor = first === "you" ? "edith" : "you";
  return index % 2 === 0 ? first : second;
}

export function isForcedSecondPick(round: number, index: number): boolean {
  return index === 2 && actorForPickIndex(round, index) === (youAreFirst(round) ? "you" : "edith");
}

function makePick(die: Die, actor: Actor): DraftPick {
  const space = RONDEL[die.spaceIndex];
  return {
    dieId: die.id,
    actor,
    spaceIndex: die.spaceIndex,
    value: die.value,
    action: space.id,
  };
}

export function applyPick(state: GameState, dieId: string): GameState {
  const die = state.dice.find((d) => d.id === dieId);
  if (!die || !state.remainingIds.includes(dieId)) return state;
  const actor = actorForPickIndex(state.round, state.picks.length);
  const pick = makePick(die, actor);
  const remainingIds = state.remainingIds.filter((id) => id !== dieId);
  const picks = [...state.picks, pick];
  const goodsStarsBlocked =
    actor === "edith" && pick.action === "compostGoods"
      ? state.goodsStarsBlocked + 1
      : state.goodsStarsBlocked;
  const logLine =
    actor === "edith"
      ? `R${state.round}: Edith takes ${die.value} on ${RONDEL[die.spaceIndex].short}`
      : `R${state.round}: You take ${die.value} on ${RONDEL[die.spaceIndex].short}`;
  const next: GameState = {
    ...state,
    remainingIds,
    picks,
    currentPick: pick,
    goodsStarsBlocked,
    log: [...state.log, logLine],
  };
  if (actor === "edith") {
    next.phase = "edithReveal";
  } else {
    next.phase = "yourReveal";
  }
  return next;
}

export function autoPickId(state: GameState): string | null {
  const index = state.picks.length;
  if (index >= DICE_COUNT) return null;
  const actor = actorForPickIndex(state.round, index);
  if (actor === "edith" && index !== 2) return edithFirstDieId(state.dice, state.remainingIds);
  if (index === 2) return lowestDieId(state.dice, state.remainingIds);
  return null;
}

export function advanceAfterReveal(state: GameState): GameState {
  if (state.picks.length >= DICE_COUNT) {
    return { ...state, currentPick: null, phase: "event" };
  }
  if (state.remainingIds.length === 1) {
    return applyPick(state, state.remainingIds[0]);
  }
  const index = state.picks.length;
  const actor = actorForPickIndex(state.round, index);
  if (actor === "you" && index !== 2) {
    return { ...state, currentPick: null, phase: "yourPick" };
  }
  if (actor === "you" && index === 2) {
    return { ...state, currentPick: null, phase: "forcedPick" };
  }
  const id = autoPickId(state);
  if (!id) return { ...state, currentPick: null, phase: "event" };
  return applyPick(state, id);
}

export function beginRound(state: GameState, values: number[], nextSeed: number): GameState {
  const dice = placeDice(values, state.edithIndex);
  const edithIndex = edithAfterPlacement(values, state.edithIndex);
  const remainingIds = dice.map((d) => d.id);
  const placed: GameState = {
    ...state,
    dice,
    remainingIds,
    picks: [],
    currentPick: null,
    edithIndex,
    rngSeed: nextSeed,
    phase: "planning",
  };
  if (youAreFirst(state.round)) {
    return { ...placed, phase: "yourPick" };
  }
  const id = edithFirstDieId(dice, remainingIds);
  if (!id) return { ...placed, phase: "event" };
  return applyPick(placed, id);
}

export function nextRound(state: GameState): GameState {
  if (state.round >= ROUND_COUNT) {
    return { ...state, phase: "gameOver", currentPick: null };
  }
  return {
    ...state,
    round: state.round + 1,
    dice: [],
    remainingIds: [],
    picks: [],
    currentPick: null,
    phase: "planning",
  };
}

export function newGame(seed = Date.now() >>> 0): GameState {
  return {
    round: 1,
    edithIndex: GOLD_PIN_INDEX,
    dice: [],
    remainingIds: [],
    picks: [],
    currentPick: null,
    phase: "title",
    goodsStarsBlocked: 0,
    log: [],
    rngSeed: seed,
  };
}

export function rollAndPlace(state: GameState): GameState {
  const { values, nextSeed } = rollValues(state.rngSeed);
  return beginRound(state, values, nextSeed);
}

export function playerDieHelp(pick: DraftPick): { garden: string; rondel: string } {
  const space = RONDEL[pick.spaceIndex];
  return {
    garden: `Garden in zone ${pick.value}: plant two crops, or water every planted crop in that zone. Compost may adjust the value.`,
    rondel: `${space.title} — ${ACTION_HELP[pick.action]}`,
  };
}

export function edithActions(pick: DraftPick, goodsStarsBlocked: number): EdithAction[] {
  const garden: EdithAction = {
    title: `Garden · zone ${pick.value}`,
    detail: `Cross off one unplanted crop in zone ${pick.value}. Priority: tallest pumpkin, then a corn of your choice, then a bean of your choice.`,
    passHint: "If every crop in that zone is already planted, she passes.",
  };
  const rondel = rondelEdithAction(pick, goodsStarsBlocked);
  return [garden, rondel];
}

function rondelEdithAction(pick: DraftPick, goodsStarsBlocked: number): EdithAction {
  switch (pick.action) {
    case "plantWater":
      return {
        title: "Plant or Water",
        detail: `Cross off a second crop in zone ${pick.value}, same pumpkin → corn → bean priority.`,
        passHint: "If the zone is fully planted, she passes.",
      };
    case "shedShears": {
      const item = shedItem("shears", pick.value);
      return {
        title: `Shed Time · shears`,
        detail: `Cross off ${item}.`,
        passHint: `If you already completed ${item} (or she already blocked it), she passes.`,
      };
    }
    case "shedMower": {
      const item = shedItem("mower", pick.value);
      return {
        title: `Shed Time · mower`,
        detail: `Cross off ${item}.`,
        passHint: `If you already completed ${item} (or she already blocked it), she passes.`,
      };
    }
    case "compostGoods":
      return {
        title: "1 Compost & 4 Goods",
        detail: `Cross off the next unused bonus star on your goods track (star #${goodsStarsBlocked} this game). Skip that box when you reach it.`,
        passHint: "If no bonus stars remain, she passes.",
      };
    case "apiary": {
      const track = apiaryTrack(pick.value);
      return {
        title: "Apiary",
        detail: `Cross the topmost empty ${track} box. (${track} is Edith's pick for a ${pick.value}.)`,
        passHint: `If ${track} has no empty boxes, she passes.`,
      };
    }
    case "fruit": {
      const track = fruitTrack(pick.value);
      return {
        title: "Yard",
        detail: `Cross the rightmost empty ${track} box. (${track} is Edith's pick for a ${pick.value}.)`,
        passHint: `If ${track} has no empty boxes, she passes.`,
      };
    }
    case "farmersMarket": {
      const flower = perennialFor(pick.value);
      return {
        title: "Farmer's Market",
        detail: `Cross the topmost empty ${flower} box.`,
        passHint: `If ${flower} has no empty boxes, she passes.`,
      };
    }
    default:
      return {
        title: "Pass",
        detail: "No rondel action.",
        passHint: "",
      };
  }
}

export function eventForRound(round: number) {
  return ROUND_EVENTS[round - 1] ?? "shed";
}

export function selectableDieIds(state: GameState): string[] {
  if (state.phase === "yourPick") return state.remainingIds;
  if (state.phase === "forcedPick") {
    const id = lowestDieId(state.dice, state.remainingIds);
    return id ? [id] : [];
  }
  return [];
}

export function canUndo(state: GameState): boolean {
  return (
    state.phase === "yourPick" ||
    state.phase === "forcedPick" ||
    state.phase === "yourReveal" ||
    state.phase === "edithReveal" ||
    state.phase === "event"
  );
}

export type Snapshot = GameState;

export function phaseLabel(phase: Phase): string {
  switch (phase) {
    case "title":
      return "Ready";
    case "planning":
      return "Planning";
    case "yourPick":
      return "Your pick";
    case "forcedPick":
      return "Lowest die";
    case "yourReveal":
      return "Your actions";
    case "edithReveal":
      return "Edith acts";
    case "event":
      return "Event";
    case "gameOver":
      return "Final score";
    default:
      return "";
  }
}
