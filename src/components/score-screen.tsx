import { Button } from "@/components/ui/button.tsx";
import { SCORE_TIERS } from "@/lib/game/data.ts";

export function ScoreScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 py-4">
      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Eight rounds in
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink text-balance">Tally your sheet</h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          Add garden, perennials, apiary, fruit, and the shed items you completed. Compare
          the total to Edith's career chart.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {SCORE_TIERS.map((tier) => (
            <li
              key={tier.range}
              className="flex items-baseline justify-between gap-3 border-t border-border pt-2"
            >
              <span className="font-display text-base text-ink">{tier.title}</span>
              <span className="tabular-nums text-muted">{tier.range}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" size="lg" onClick={onReset}>
          New season
        </Button>
      </section>
    </div>
  );
}
