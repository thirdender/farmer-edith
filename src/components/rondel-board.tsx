import { Pin } from "lucide-react";
import { DieFace } from "@/components/die-face.tsx";
import { ACTION_ART, GOLD_PIN_INDEX, RONDEL } from "@/lib/game/data.ts";
import type { Die } from "@/lib/game/types.ts";
import { cn } from "@/lib/utils.ts";

export function RondelBoard({
  dice,
  remainingIds,
  selectableIds,
  edithIndex,
  takenBy,
  previewId,
  onPick,
  rolling,
}: {
  dice: Die[];
  remainingIds: string[];
  selectableIds: string[];
  previewId: string | null;
  edithIndex: number;
  takenBy: Record<string, "you" | "edith">;
  onPick: (id: string) => void;
  rolling: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
        Clockwise from the gold pin
      </p>
      <ol className="flex flex-col gap-1.5">
        {RONDEL.map((space) => {
          const onSpace = dice.filter((d) => d.spaceIndex === space.index);
          const isGold = space.index === GOLD_PIN_INDEX;
          const isEdith = space.index === edithIndex;
          return (
            <li key={space.index}>
              <article
                className={cn(
                  "relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border bg-note px-3 py-2 shadow-[0_1px_1px_oklch(0.35_0.04_60/0.1)]",
                  isEdith ? "border-danger/50 ring-1 ring-danger/30" : "border-border",
                  isGold && "bg-card",
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${ACTION_ART[space.id]})`,
                    maskImage: "linear-gradient(to right, #000 0%, #000 28%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, #000 0%, #000 28%, transparent 100%)",
                  }}
                />
                <div className="relative flex w-7 flex-col items-center gap-1">
                  {isEdith ? (
                    <span className="size-2.5 rounded-full bg-danger" title="Edith" />
                  ) : (
                    <span className="size-2.5 rounded-full bg-rule/40" />
                  )}
                  {isGold ? <Pin className="size-3.5 text-pin" strokeWidth={2.2} /> : <span className="h-3.5" />}
                </div>
                <div className="relative min-w-0 flex-1 pl-[20%]">
                  <p className="font-display text-sm leading-tight text-ink [text-shadow:0_0_6px_#f6efe2,0_0_2px_#f6efe2] sm:text-base">
                    {space.short}
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-wide text-muted [text-shadow:0_0_6px_#f6efe2,0_0_2px_#f6efe2]">
                    {isEdith && dice.length === 0
                      ? "Place lowest group here"
                      : isEdith
                        ? "Pawn · next round starts here"
                        : isGold
                          ? "Gold pin · her first die"
                          : "\u00a0"}
                  </p>
                </div>
                <div className="relative flex min-h-11 min-w-24 flex-wrap items-center justify-end gap-1.5">
                  {onSpace.length === 0 ? (
                    <span className="text-xs text-muted">empty</span>
                  ) : (
                    onSpace.map((die) => {
                      const selectable = selectableIds.includes(die.id);
                      const taken = takenBy[die.id];
                      return (
                        <button
                          key={die.id}
                          type="button"
                          disabled={!selectable}
                          onClick={() => onPick(die.id)}
                          className={cn(
                            "relative shrink-0 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selectable && "cursor-pointer",
                            rolling && "animate-die-tumble",
                          )}
                        >
                          <DieFace
                            value={die.value}
                            size="md"
                            dimmed={Boolean(taken)}
                            selected={previewId === die.id}
                          />
                          {taken ? (
                            <span
                              className={cn(
                                "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[0.55rem] font-semibold uppercase tracking-wide",
                                taken === "edith"
                                  ? "bg-danger text-danger-foreground"
                                  : "bg-primary text-primary-foreground",
                              )}
                            >
                              {taken === "edith" ? "E" : "You"}
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
