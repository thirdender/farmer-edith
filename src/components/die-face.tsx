import { cn } from "@/lib/utils.ts";

const PIP_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Pumpkin() {
  return (
    <svg viewBox="0 0 24 24" className="size-[55%] text-pip" aria-hidden>
      <path
        fill="currentColor"
        d="M12 6.2c.4-1.4 1.4-2.4 2.6-2.7-.2 1.2-.8 2.1-1.6 2.8 2.6.3 4.6 2.4 4.8 5.2.2 3.2-2.2 6.3-5.8 7.2-3.6-.9-6-4-5.8-7.2.2-2.8 2.2-4.9 4.8-5.2-.8-.7-1.4-1.6-1.6-2.8 1.2.3 2.2 1.3 2.6 2.7Z"
      />
      <ellipse cx="12" cy="12.5" rx="3.2" ry="5.4" fill="var(--color-pip-deep)" opacity="0.28" />
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
        "relative grid grid-cols-3 grid-rows-3 place-items-center rounded-[var(--radius-sm)] bg-die text-pip shadow-[inset_0_1px_0_oklch(1_0_0/0.55),0_1px_2px_oklch(0.3_0.04_60/0.28)] ring-1 ring-die-ring",
        size === "sm" && "size-9 p-1",
        size === "md" && "size-11 p-1.5",
        size === "lg" && "size-14 p-2",
        dimmed && "opacity-40 grayscale",
        selected && "ring-2 ring-primary",
        className,
      )}
      aria-label={`Die showing ${value}`}
    >
      {value === 1 ? (
        <span className="col-start-2 row-start-2 grid place-items-center">
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
