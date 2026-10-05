import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/game/idb-storage.ts";
import {
  advanceAfterReveal,
  applyPick,
  newGame,
  nextRound,
  rollAndPlace,
} from "@/lib/game/engine.ts";
import type { GameState } from "@/lib/game/types.ts";

const MAX_HISTORY = 24;

interface GameStore {
  state: GameState;
  history: GameState[];
  rolling: boolean;
  referenceOpen: boolean;
  start: () => void;
  roll: () => void;
  pick: (dieId: string) => void;
  continue: () => void;
  undo: () => void;
  finishEvent: () => void;
  reset: () => void;
  toggleReference: () => void;
}

function pushHistory(history: GameState[], snapshot: GameState): GameState[] {
  return [...history, snapshot].slice(-MAX_HISTORY);
}

const PHASES = new Set<GameState["phase"]>([
  "title",
  "planning",
  "yourPick",
  "edithReveal",
  "forcedPick",
  "yourReveal",
  "event",
  "gameOver",
]);

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const state = value as GameState;
  return (
    PHASES.has(state.phase) &&
    Array.isArray(state.dice) &&
    Array.isArray(state.picks) &&
    typeof state.round === "number"
  );
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      state: newGame(),
      history: [],
      rolling: false,
      referenceOpen: false,
      start: () => {
        set({
          state: { ...newGame(), phase: "planning" },
          history: [],
          rolling: false,
        });
      },
      roll: () => {
        const { state } = get();
        if (state.phase !== "planning") return;
        set({ rolling: true, history: pushHistory(get().history, state) });
        window.setTimeout(() => {
          const latest = get().state;
          if (latest.phase !== "planning") {
            set({ rolling: false });
            return;
          }
          set({ state: rollAndPlace(latest), rolling: false });
        }, 720);
      },
      pick: (dieId: string) => {
        const { state } = get();
        if (state.phase !== "yourPick" && state.phase !== "forcedPick") return;
        set({
          history: pushHistory(get().history, state),
          state: applyPick(state, dieId),
        });
      },
      continue: () => {
        const { state } = get();
        if (state.phase !== "yourReveal" && state.phase !== "edithReveal") return;
        set({
          history: pushHistory(get().history, state),
          state: advanceAfterReveal(state),
        });
      },
      undo: () => {
        const history = get().history;
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        set({
          state: prev,
          history: history.slice(0, -1),
          rolling: false,
        });
      },
      finishEvent: () => {
        const { state } = get();
        if (state.phase !== "event") return;
        set({
          history: pushHistory(get().history, state),
          state: nextRound(state),
        });
      },
      reset: () => set({ state: newGame(), history: [], rolling: false }),
      toggleReference: () => set((s) => ({ referenceOpen: !s.referenceOpen })),
    }),
    {
      name: "farmer-edith-solo",
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ state: s.state, history: s.history }),
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = persisted as { state?: unknown; history?: unknown } | undefined;
        if (!saved || !isGameState(saved.state)) return current;
        const history = Array.isArray(saved.history) ? saved.history.filter(isGameState) : [];
        return { ...current, state: saved.state, history };
      },
    },
  ),
);
