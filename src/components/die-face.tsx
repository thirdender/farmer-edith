import { cn } from "@/lib/utils.ts";

const PIP_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Lucide Lab pumpkin, filled so it reads as a die pip. https://lucide.dev/icons/lab/pumpkin */
function Pumpkin() {
  return (
    <svg viewBox="0 0 24 24" className="size-[84%] text-pip" aria-hidden>
      <path
        fill="currentColor"
        d="M17 4c-.9 0-1.8.4-2.5 1.2a3.32 3.32 0 0 0-5 0C8.8 4.4 7.9 4 7 4c-2.8 0-5 4-5 9s2.2 9 5 9c.9 0 1.8-.4 2.5-1.2a3.32 3.32 0 0 0 5 0c.7.8 1.6 1.2 2.5 1.2 2.8 0 5-4 5-9s-2.2-9-5-9z"
      />
      <path
        d="M12 7.2v10.6M8.3 8c.5 2.8.5 6.2 0 9M15.7 8c-.5 2.8-.5 6.2 0 9"
        fill="none"
        stroke="var(--color-die)"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M13 2c-1 1-1 2-1 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DieFace({
  value,
  size = "md",
  dimmed = false,
  selected = false,
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  dimmed?: boolean;
  selected?: boolean;
  className?: string;
}) {
  const pips = PIP_MAP[value] ?? PIP_MAP[1];
  return (
    <div
      className={cn(
        "relative box-border aspect-square shrink-0 grid grid-cols-3 grid-rows-3 place-items-center rounded-[var(--radius-sm)] bg-die text-pip shadow-[inset_0_1px_0_oklch(1_0_0/0.55),0_1px_2px_oklch(0.3_0.04_60/0.28)] ring-1 ring-die-ring",
        size === "sm" && "size-9 p-1",
        size === "md" && "size-11 p-1.5",
        size === "lg" && "size-14 p-2",
        dimmed && "opacity-40 grayscale",
        selected && "ring-2 ring-primary",
        className,
      )}
      aria-label={value === 1 ? "Die showing 1, the pumpkin" : `Die showing ${value}`}
    >
      {value === 1 ? (
        <span className="absolute inset-1 flex items-center justify-center">
          <Pumpkin />
        </span>
      ) : (
        Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "block rounded-full bg-pip",
              size === "lg" ? "size-2" : "size-1.5",
              pips.includes(i) ? "opacity-100" : "opacity-0",
            )}
          />
        ))
      )}
    </div>
  );
}
