import { BookOpen, RotateCcw, Undo2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActionPanel } from "@/components/action-panel.tsx";
import { ReferenceSheet } from "@/components/reference-sheet.tsx";
import { RondelBoard } from "@/components/rondel-board.tsx";
import { ScoreScreen } from "@/components/score-screen.tsx";
import { TitleScreen } from "@/components/title-screen.tsx";
import { Button } from "@/components/ui/button.tsx";
import { EVENT_LABEL, ROUND_EVENTS } from "@/lib/game/data.ts";
import { selectableDieIds, youAreFirst } from "@/lib/game/engine.ts";
import { useGameStore } from "@/store/game-store.ts";

export function GameApp() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void useGameStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  const state = useGameStore((s) => s.state);
  const rolling = useGameStore((s) => s.rolling);
  const referenceOpen = useGameStore((s) => s.referenceOpen);
  const history = useGameStore((s) => s.history);
  const start = useGameStore((s) => s.start);
  const roll = useGameStore((s) => s.roll);
  const pick = useGameStore((s) => s.pick);
  const cont = useGameStore((s) => s.continue);
  const undo = useGameStore((s) => s.undo);
  const finishEvent = useGameStore((s) => s.finishEvent);
  const reset = useGameStore((s) => s.reset);
  const toggleReference = useGameStore((s) => s.toggleReference);

  const takenBy = useMemo(() => {
    const map: Record<string, "you" | "edith"> = {};
    for (const p of state.picks) map[p.dieId] = p.actor;
    return map;
  }, [state.picks]);

  if (!hydrated) {
    return (
      <Shell>
        <TitleScreen onStart={() => {}} />
      </Shell>
    );
  }

  if (state.phase === "title") {
    return (
      <Shell onReference={toggleReference}>
        <TitleScreen onStart={start} />
        <ReferenceSheet open={referenceOpen} onClose={toggleReference} />
      </Shell>
    );
  }

  if (state.phase === "gameOver") {
    return (
      <Shell onReference={toggleReference} onReset={reset}>
        <ScoreScreen onReset={reset} />
        <ReferenceSheet open={referenceOpen} onClose={toggleReference} />
      </Shell>
    );
  }

  const selectable = selectableDieIds(state);
  const event = ROUND_EVENTS[state.round - 1];

  return (
    <Shell
      onReference={toggleReference}
      onUndo={history.length ? undo : undefined}
      onReset={reset}
    >
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Round {state.round} of 8 · {EVENT_LABEL[event]}
          </p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">
            {youAreFirst(state.round) ? "You draft first" : "Edith drafts first"}
          </h1>
        </div>
        {state.phase === "planning" ? (
          <Button size="lg" onClick={roll} disabled={rolling}>
            {rolling ? "Rolling…" : "Roll four dice"}
          </Button>
        ) : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className="rounded-[var(--radius-xl)] border border-border bg-cork-panel p-3 sm:p-5">
          <RondelBoard
            dice={state.dice}
            remainingIds={state.remainingIds}
            selectableIds={selectable}
            edithIndex={state.edithIndex}
            takenBy={takenBy}
            onPick={pick}
            rolling={rolling}
          />
        </section>
        <div className="flex flex-col gap-3">
          <ActionPanel state={state} onContinue={cont} onFinishEvent={finishEvent} />
          {state.log.length > 0 ? (
            <ol className="rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3 text-xs text-muted">
              {state.log.slice(-8).map((line, i) => (
                <li key={`${line}-${i}`} className="py-0.5">
                  {line}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
      <ReferenceSheet open={referenceOpen} onClose={toggleReference} />
    </Shell>
  );
}

function Shell({
  children,
  onReference,
  onUndo,
  onReset,
}: {
  children: ReactNode;
  onReference?: () => void;
  onUndo?: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="min-h-dvh bg-cork px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl rounded-[var(--radius-frame)] border-[10px] border-frame bg-board p-3 shadow-[0_10px_30px_oklch(0.35_0.04_60/0.28)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-display text-sm text-ink">Farmer Edith</p>
          <div className="flex items-center gap-1">
            {onUndo ? (
              <Button variant="ghost" size="sm" onClick={onUndo}>
                <Undo2 className="size-4" />
                Undo
              </Button>
            ) : null}
            {onReference ? (
              <Button variant="ghost" size="sm" onClick={onReference}>
                <BookOpen className="size-4" />
                Notes
              </Button>
            ) : null}
            {onReset ? (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="size-4" />
                New
              </Button>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
