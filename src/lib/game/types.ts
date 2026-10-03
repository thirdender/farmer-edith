export const SPACE_COUNT = 7;
export const DICE_COUNT = 4;
export const ROUND_COUNT = 8;

export type ActionKind =
  | "apiary"
  | "plantWater"
  | "shedShears"
  | "compostGoods"
  | "fruit"
  | "shedMower"
  | "farmersMarket";

export type EventKind = "shed" | "rain" | "market";

export type Actor = "you" | "edith";

export interface RondelSpace {
  id: ActionKind;
  index: number;
  title: string;
  short: string;
}

export interface Die {
  id: string;
  value: number;
  spaceIndex: number;
}

export interface DraftPick {
  dieId: string;
  actor: Actor;
  spaceIndex: number;
  value: number;
  action: ActionKind;
}

export type Phase =
  | "title"
  | "planning"
  | "yourPick"
  | "edithReveal"
  | "forcedPick"
  | "yourReveal"
  | "event"
  | "gameOver";

export interface EdithAction {
  title: string;
  detail: string;
  passHint: string;
}

export interface GameState {
  round: number;
  edithIndex: number;
  dice: Die[];
  remainingIds: string[];
  picks: DraftPick[];
  currentPick: DraftPick | null;
  phase: Phase;
  goodsStarsBlocked: number;
  log: string[];
  rngSeed: number;
}
