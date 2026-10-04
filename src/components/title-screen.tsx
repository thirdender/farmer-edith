import { Button } from "@/components/ui/button.tsx";
import { DieFace } from "@/components/die-face.tsx";
import { SCORE_TIERS } from "@/lib/game/data.ts";

export function TitleScreen({
  onStart,
  ready = true,
}: {
  onStart: () => void;
  ready?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-1 py-4">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[0_1px_2px_oklch(0.35_0.04_60/0.16)]">
        <div className="absolute -right-6 -top-8 size-28 rotate-12 rounded-[var(--radius-md)] bg-note ring-1 ring-border" />
        <p className="relative text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Three Sisters
        </p>
        <h1 className="relative mt-2 font-display text-4xl leading-none text-ink text-balance">
          Farmer Edith
        </h1>
        <p className="relative mt-3 max-w-prose text-sm leading-relaxed text-foreground">
          You keep the paper sheets. This companion rolls the four dice, seats them on
          the rondel, drafts Edith, and tells you exactly what she crosses off.
        </p>
        <div className="relative mt-5 flex gap-2">
          {[3, 1, 5, 6].map((v) => (
            <DieFace key={v} value={v} />
          ))}
        </div>
        <Button className="relative mt-6 w-full" size="lg" onClick={onStart} disabled={!ready}>
          {ready ? "Start a season" : "Loading…"}
        </Button>
      </div>
      <ol className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-card/80 p-5 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-ink">Odd rounds</span> you pick first. Edith
          always starts from the gold pin and walks clockwise for her first die.
        </li>
        <li>
          <span className="font-semibold text-ink">Second die</span> of the first player is
          the lowest still on the board. The last die goes to whoever is left.
        </li>
        <li>
          <span className="font-semibold text-ink">Edith gardens first</span>, then the
          rondel — pumpkins before corn before beans. She skips the round event.
        </li>
      </ol>
      <section className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
        <h2 className="font-display text-lg text-ink">Career chart</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {SCORE_TIERS.map((tier) => (
            <li key={tier.range} className="flex gap-3">
              <span className="w-14 tabular-nums text-muted">{tier.range}</span>
              <span>{tier.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
