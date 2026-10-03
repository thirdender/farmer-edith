import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  MARKET_ROWS,
  PERENNIALS,
  SCORE_TIERS,
  SHED_MOWER,
  SHED_SHEARS,
} from "@/lib/game/data.ts";

export function ReferenceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="ref-title"
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[0_12px_40px_oklch(0.3_0.04_60/0.28)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">Solo board</p>
            <h2 id="ref-title" className="font-display text-2xl text-ink">
              Edith's notes
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close reference">
            <X className="size-5" />
          </Button>
        </div>
        <div className="mt-4 grid gap-4 text-sm">
          <Note title="Garden priority">
            Pumpkins, tallest to shortest. Then a corn of your choice. Then a bean of your
            choice. She never crosses a crop you already planted.
          </Note>
          <Note title="Shed · shears">
            <MapList items={SHED_SHEARS} />
          </Note>
          <Note title="Shed · mower">
            <MapList items={SHED_MOWER} />
          </Note>
          <Note title="Apiary">
            1–2 Honey · 3–4 Wax · 5–6 Split Hive (topmost empty box)
          </Note>
          <Note title="Yard">
            1–2 Apples · 3 Peaches · 4–5 Blackberries · 6 Raspberries (rightmost empty box)
          </Note>
          <Note title="Perennials (Market)">
            <MapList items={PERENNIALS} />
          </Note>
          <Note title="Farmer's Market">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted">
                  <th className="py-1 font-medium">Goods</th>
                  <th className="py-1 font-medium">You take</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_ROWS.map((row) => (
                  <tr key={row.goods} className="border-t border-border">
                    <td className="py-1.5 tabular-nums">{row.goods}</td>
                    <td className="py-1.5">{row.actions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Note>
          <Note title="Career chart">
            <ul className="space-y-1">
              {SCORE_TIERS.map((tier) => (
                <li key={tier.range} className="flex gap-3">
                  <span className="w-14 tabular-nums text-muted">{tier.range}</span>
                  <span>{tier.title}</span>
                </li>
              ))}
            </ul>
          </Note>
        </div>
      </div>
    </div>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-md)] bg-well px-3 py-3">
      <h3 className="font-display text-base text-ink">{title}</h3>
      <div className="mt-1.5 text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}

function MapList({ items }: { items: readonly string[] }) {
  return (
    <ol className="grid grid-cols-2 gap-x-3 gap-y-1">
      {items.map((name, i) => (
        <li key={name} className="flex gap-2">
          <span className="w-4 tabular-nums text-muted">{i + 1}</span>
          {name}
        </li>
      ))}
    </ol>
  );
}
