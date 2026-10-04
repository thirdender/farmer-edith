import type { ActionKind, EventKind, RondelSpace } from "./types.ts";

/** Clockwise from the gold pushpin (Apiary / Yard). */
export const RONDEL: RondelSpace[] = [
  { id: "apiary", index: 0, title: "Apiary or Yard", short: "Apiary" },
  { id: "plantWater", index: 1, title: "Plant or Water", short: "Plant / Water" },
  { id: "shedShears", index: 2, title: "Shed Time", short: "Shed · shears" },
  { id: "compostGoods", index: 3, title: "1 Compost & 4 Goods", short: "Compost + Goods" },
  { id: "fruit", index: 4, title: "Apiary or Yard", short: "Yard" },
  { id: "shedMower", index: 5, title: "Shed Time", short: "Shed · mower" },
  { id: "farmersMarket", index: 6, title: "Farmer's Market", short: "Market" },
];

export const GOLD_PIN_INDEX = 0;

export const ACTION_ART: Record<ActionKind, string> = {
  apiary: "/actions/apiary.jpg",
  plantWater: "/actions/plant-water.jpg",
  shedShears: "/actions/shed-shears.jpg",
  compostGoods: "/actions/compost-goods.jpg",
  fruit: "/actions/yard.jpg",
  shedMower: "/actions/shed-mower.jpg",
  farmersMarket: "/actions/market.jpg",
};

/** The garden step, taken before the rondel action. */
export const GARDEN_ART = "/actions/garden.jpg";

export const ROUND_EVENTS: EventKind[] = [
  "shed",
  "rain",
  "market",
  "rain",
  "market",
  "shed",
  "market",
  "rain",
];

export const EVENT_LABEL: Record<EventKind, string> = {
  shed: "Shed",
  rain: "Rain",
  market: "Farmer's Market",
};

export const EVENT_HELP: Record<EventKind, string> = {
  shed: "Take one shed action on your sheet. Edith does not take the event.",
  rain: "Water every garden zone, starting at 1 and ending at 6. Edith does not take the event.",
  market:
    "Consult the Farmer's Market chart using your current goods. Edith does not take the event.",
};

export const SHED_SHEARS = [
  "Mason Jars",
  "Pie Safe",
  "Shovel",
  "Fruit Bowl",
  "Rain Barrel",
  "Casserole Dish",
] as const;

export const SHED_MOWER = [
  "Fancy Labels",
  "Hive Tool",
  "Pitchfork",
  "String Trimmer",
  "Wheelbarrow",
  "Mulch",
] as const;

export const PERENNIALS = [
  "Tulip",
  "Hydrangea",
  "Iris",
  "Hyacinth",
  "Crocus",
  "Daffodil",
] as const;

export const MARKET_ROWS: { goods: string; actions: string }[] = [
  { goods: "0", actions: "1 Compost" },
  { goods: "4", actions: "1 Perennial & 1 Compost" },
  { goods: "20", actions: "1 Perennial & 1 Yard" },
  { goods: "35", actions: "2 Perennials & 1 Compost" },
  { goods: "50", actions: "2 Perennials & 1 Yard" },
  { goods: "70+", actions: "2 Perennials & 1 Bonus" },
];

export const SCORE_TIERS: { range: string; title: string }[] = [
  { range: "0–39", title: "Better luck next season" },
  { range: "40–49", title: "Ready for the county fair" },
  { range: "50–64", title: "Blue ribbon gardener" },
  { range: "65–79", title: "State champ" },
  { range: "80–99", title: "Internet-famous blogger" },
  { range: "100+", title: "Your own TV show" },
];

export const ACTION_HELP: Record<ActionKind, string> = {
  apiary: "Fill the next empty box of your apiary, or of any one fruit.",
  plantWater: "Plant or water again in the same garden zone as this die.",
  shedShears: "Fill the next empty box of any one shed item.",
  compostGoods: "Gain 1 compost and 4 goods.",
  fruit: "Fill the next empty box of your apiary, or of any one fruit.",
  shedMower: "Fill the next empty box of any one shed item.",
  farmersMarket: "Consult the Farmer's Market chart based on your goods.",
};

export function shedItem(kind: "shears" | "mower", value: number): string {
  const list = kind === "shears" ? SHED_SHEARS : SHED_MOWER;
  return list[value - 1] ?? list[0];
}

export function perennialFor(value: number): string {
  return PERENNIALS[value - 1] ?? PERENNIALS[0];
}

export function apiaryTrack(value: number): string {
  if (value <= 2) return "Honey";
  if (value <= 4) return "Wax";
  return "Split Hive";
}

export function fruitTrack(value: number): string {
  if (value <= 2) return "Apples";
  if (value === 3) return "Peaches";
  if (value <= 5) return "Blackberries";
  return "Raspberries";
}
