import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RONDEL } from "./data.ts";
import {
  actorForPickIndex,
  advanceAfterReveal,
  applyPick,
  beginRound,
  edithActions,
  edithAfterPlacement,
  edithFirstDieId,
  eventForRound,
  lowestDieId,
  newGame,
  placeDice,
  youAreFirst,
} from "./engine.ts";

describe("placeDice", () => {
  it("groups ascending from Edith", () => {
    const dice = placeDice([4, 6, 6, 5], 0);
    const byValue = Object.fromEntries(
      dice.map((d) => [d.id, { value: d.value, space: d.spaceIndex }]),
    );
    const spaces = new Map<number, number>();
    for (const d of dice) spaces.set(d.value, d.spaceIndex);
    assert.equal(spaces.get(4), 0);
    assert.equal(spaces.get(5), 1);
    assert.equal(spaces.get(6), 2);
    assert.equal(byValue.d0.value, 4);
  });

  it("wraps around the rondel", () => {
    const dice = placeDice([1, 3, 5, 6], 5);
    const spaces = new Map(dice.map((d) => [d.value, d.spaceIndex]));
    assert.equal(spaces.get(1), 5);
    assert.equal(spaces.get(3), 6);
    assert.equal(spaces.get(5), 0);
    assert.equal(spaces.get(6), 1);
  });

  it("keeps identical values on one space", () => {
    const dice = placeDice([2, 2, 2, 5], 0);
    assert.equal(dice.filter((d) => d.value === 2).every((d) => d.spaceIndex === 0), true);
    assert.equal(dice.find((d) => d.value === 5)?.spaceIndex, 1);
    assert.equal(edithAfterPlacement([2, 2, 2, 5], 0), 2);
  });
});

describe("Edith drafting", () => {
  it("takes the gold-pin space first", () => {
    const dice = placeDice([1, 3, 4, 6], 0);
    const ids = dice.map((d) => d.id);
    const pick = edithFirstDieId(dice, ids);
    const die = dice.find((d) => d.id === pick);
    assert.equal(die?.spaceIndex, 0);
    assert.equal(die?.value, 1);
  });

  it("skips empty gold pin and walks clockwise", () => {
    const dice = placeDice([2, 4, 5, 6], 1);
    const remaining = dice.filter((d) => d.spaceIndex !== 0).map((d) => d.id);
    const pick = edithFirstDieId(dice, remaining);
    const die = dice.find((d) => d.id === pick);
    assert.equal(die?.spaceIndex, 1);
  });

  it("lowest remaining ignores taken dice", () => {
    const dice = placeDice([1, 3, 4, 6], 0);
    const withoutOne = dice.filter((d) => d.value !== 1).map((d) => d.id);
    const pick = lowestDieId(dice, withoutOne);
    assert.equal(dice.find((d) => d.id === pick)?.value, 3);
  });
});

describe("turn order", () => {
  it("you first on odd rounds", () => {
    assert.equal(youAreFirst(1), true);
    assert.equal(youAreFirst(2), false);
    assert.equal(actorForPickIndex(1, 0), "you");
    assert.equal(actorForPickIndex(1, 1), "edith");
    assert.equal(actorForPickIndex(1, 2), "you");
    assert.equal(actorForPickIndex(1, 3), "edith");
    assert.equal(actorForPickIndex(2, 0), "edith");
    assert.equal(actorForPickIndex(2, 1), "you");
    assert.equal(actorForPickIndex(2, 2), "edith");
    assert.equal(actorForPickIndex(2, 3), "you");
  });
});

describe("round events", () => {
  it("matches the solo board", () => {
    assert.deepEqual(
      [1, 2, 3, 4, 5, 6, 7, 8].map(eventForRound),
      ["shed", "rain", "market", "rain", "market", "shed", "market", "rain"],
    );
  });
});

describe("Edith rondel translation", () => {
  it("maps shears 6 to Casserole Dish", () => {
    const actions = edithActions(
      { dieId: "d0", actor: "edith", spaceIndex: 2, value: 6, action: "shedShears" },
      0,
    );
    assert.match(actions[1].detail, /Casserole Dish/);
  });

  it("maps mower 1 to Fancy Labels", () => {
    const actions = edithActions(
      { dieId: "d0", actor: "edith", spaceIndex: 5, value: 1, action: "shedMower" },
      0,
    );
    assert.match(actions[1].detail, /Fancy Labels/);
  });

  it("maps apiary 6 to Split Hive and fruit 3 to Peaches", () => {
    const hive = edithActions(
      { dieId: "d0", actor: "edith", spaceIndex: 0, value: 6, action: "apiary" },
      0,
    );
    const yard = edithActions(
      { dieId: "d0", actor: "edith", spaceIndex: 4, value: 3, action: "fruit" },
      0,
    );
    assert.match(hive[1].detail, /Split Hive/);
    assert.match(yard[1].detail, /Peaches/);
  });

  it("maps market 4 to Hyacinth", () => {
    const actions = edithActions(
      { dieId: "d0", actor: "edith", spaceIndex: 6, value: 4, action: "farmersMarket" },
      0,
    );
    assert.match(actions[1].detail, /Hyacinth/);
  });
});

describe("a full odd round", () => {
  it("lets you pick freely, then Edith from the pin, then forces the lowest", () => {
    let state = newGame(1);
    state = { ...state, phase: "planning", round: 1, edithIndex: 0 };
    state = beginRound(state, [2, 4, 5, 6], 2);
    assert.equal(state.phase, "yourPick");
    const four = state.dice.find((d) => d.value === 4);
    assert.ok(four);
    state = applyPick(state, four.id);
    assert.equal(state.currentPick?.actor, "you");
    assert.equal(state.currentPick?.action, RONDEL[four.spaceIndex].id);

    state = advanceAfterReveal(state);
    assert.equal(state.phase, "edithReveal");
    assert.equal(state.currentPick?.value, 2);
    assert.equal(state.currentPick?.actor, "edith");
  });
});
