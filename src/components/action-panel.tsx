import { CloudRain, Scissors, Store } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { DieFace } from "@/components/die-face.tsx";
import { ACTION_ART, EVENT_HELP, EVENT_LABEL, GARDEN_ART, RONDEL } from "@/lib/game/data.ts";
import {
  edithActions,
  eventForRound,
  playerDieHelp,
  youAreFirst,
} from "@/lib/game/engine.ts";
import type { Die, DraftPick, GameState } from "@/lib/game/types.ts";

export function ActionPanel({
  state,
  previewDie,
  onConfirmPick,
  onContinue,
  onFinishEvent,
}: {
  state: GameState;
  previewDie: Die | null;
  onConfirmPick: () => void;
  onContinue: () => void;
  onFinishEvent: () => void;
}) {
  if (state.phase === "yourPick" || state.phase === "forcedPick") {
    return (
      <PickPreview
        die={previewDie}
        forced={state.phase === "forcedPick"}
        onConfirm={onConfirmPick}
      />
    );
  }
  if (state.phase === "yourReveal" && state.currentPick) {
    return (
      <YourReveal
        pick={state.currentPick}
        onContinue={onContinue}
        last={state.picks.length === 4}
      />
    );
  }
  if (state.phase === "edithReveal" && state.currentPick) {
    return (
      <EdithReveal
        pick={state.currentPick}
        goodsStarsBlocked={state.goodsStarsBlocked}
        onContinue={onContinue}
        last={state.picks.length === 4}
      />
    );
  }
  if (state.phase === "event") {
    return <EventCard round={state.round} onFinish={onFinishEvent} />;
  }
  if (state.phase === "planning") {
    return (
      <PromptCard
        eyebrow={youAreFirst(state.round) ? "You draft first" : "Edith drafts first"}
        title="Roll the four dice"
      >
        <p>
          They group by value and sit clockwise from Edith, lowest first. She then
          steps to the space after the highest group.
        </p>
      </PromptCard>
    );
  }
  return null;
}

function PromptCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[0_1px_2px_oklch(0.35_0.04_60/0.12)] sm:p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-display text-xl text-ink text-balance">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function PickPreview({
  die,
  forced,
  onConfirm,
}: {
  die: Die | null;
  forced: boolean;
  onConfirm: () => void;
}) {
  if (!die) {
    return (
      <PromptCard eyebrow="Your pick" title="Tap a die to preview it">
        <p>
          Nothing is taken yet. Tap another die to change the actions shown here, then
          confirm when you are ready.
        </p>
      </PromptCard>
    );
  }
  const help = playerDieHelp(asPick(die));
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <DieFace value={die.value} selected />
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
            {forced ? "Forced pick" : "Preview"}
          </p>
          <h2 className="font-display text-xl text-ink">
            {die.value} on {RONDEL[die.spaceIndex].title}
          </h2>
          <p className="text-sm text-muted">
            {forced
              ? "As first player, your second die is the lowest still on the board."
              : "Tap a different die to change this. Confirm when it looks right."}
          </p>
        </div>
      </div>
      <ol className="mt-4 space-y-3 text-sm leading-relaxed">
        <li className="flex items-start gap-3">
          <img
            src={GARDEN_ART}
            alt=""
            className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
          />
          <span>
            <span className="font-semibold text-ink">Garden.</span> {help.garden}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <img
            src={ACTION_ART[RONDEL[die.spaceIndex].id]}
            alt=""
            className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
          />
          <span>
            <span className="font-semibold text-ink">Rondel.</span> {help.rondel}
          </span>
        </li>
      </ol>
      <Button className="mt-4 w-full" size="lg" onClick={onConfirm}>
        Take this die
      </Button>
    </section>
  );
}

function asPick(die: Die): DraftPick {
  return {
    dieId: die.id,
    actor: "you",
    spaceIndex: die.spaceIndex,
    value: die.value,
    action: RONDEL[die.spaceIndex].id,
  };
}

function EdithPortrait({ className }: { className?: string }) {
  return (
    <img
      src="/edith.jpg"
      alt="Farmer Edith"
      className={`shrink-0 rounded-full object-cover object-[center_18%] ring-2 ring-danger/35 ${className ?? ""}`}
    />
  );
}
function YourReveal({
  pick,
  onContinue,
  last,
}: {
  pick: DraftPick;
  onContinue: () => void;
  last: boolean;
}) {
  const help = playerDieHelp(pick);
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <DieFace value={pick.value} />
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">You</p>
          <h2 className="font-display text-xl text-ink">
            {pick.value} on {RONDEL[pick.spaceIndex].title}
          </h2>
        </div>
      </div>
      <ol className="mt-4 space-y-3 text-sm leading-relaxed">
        <li className="flex items-start gap-3">
          <img
            src={GARDEN_ART}
            alt=""
            className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
          />
          <span>
            <span className="font-semibold text-ink">Garden.</span> {help.garden}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <img
            src={ACTION_ART[pick.action]}
            alt=""
            className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
          />
          <span>
            <span className="font-semibold text-ink">Rondel.</span> {help.rondel}
          </span>
        </li>
      </ol>
      <Button className="mt-4 w-full" size="lg" onClick={onContinue}>
        {last ? "Go to the event" : "Continue"}
      </Button>
    </section>
  );
}

function EdithReveal({
  pick,
  goodsStarsBlocked,
  onContinue,
  last,
}: {
  pick: DraftPick;
  goodsStarsBlocked: number;
  onContinue: () => void;
  last: boolean;
}) {
  const actions = edithActions(pick, goodsStarsBlocked);
  return (
    <section className="rounded-[var(--radius-lg)] border border-danger/30 bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <EdithPortrait className="size-16 sm:size-20" />
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-danger">Edith</p>
          <h2 className="font-display text-xl text-ink">
            Takes {pick.value} · {RONDEL[pick.spaceIndex].short}
          </h2>
          <p className="text-sm text-muted">Garden first, then the rondel. Cross these off your sheet.</p>
        </div>
        <DieFace value={pick.value} />
      </div>
      <ol className="mt-4 space-y-3">
        {actions.map((action, index) => (
          <li key={action.title} className="rounded-[var(--radius-md)] bg-well px-3 py-3">
            {index === 0 ? (
              <img
                src={GARDEN_ART}
                alt=""
                className="mb-2 h-24 w-full rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
              />
            ) : null}
            {index === 1 ? (
              <img
                src={ACTION_ART[pick.action]}
                alt=""
                className="mb-2 h-24 w-full rounded-[var(--radius-sm)] object-cover ring-1 ring-border"
              />
            ) : null}
            <p className="font-display text-base text-ink">{action.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{action.detail}</p>
            <p className="mt-1 text-xs text-muted">{action.passHint}</p>
          </li>
        ))}
      </ol>
      <Button className="mt-4 w-full" size="lg" variant="danger" onClick={onContinue}>
        {last ? "Marked — go to the event" : "Marked on my sheet"}
      </Button>
    </section>
  );
}

function EventCard({ round, onFinish }: { round: number; onFinish: () => void }) {
  const event = eventForRound(round);
  const Icon = event === "rain" ? CloudRain : event === "shed" ? Scissors : Store;
  const next = round >= 8 ? "See your score" : `Begin round ${round + 1}`;
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-card p-4 sm:p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
        Event · Round {round}
      </p>
      <h2 className="mt-1 flex items-center gap-2 font-display text-xl text-ink">
        <Icon className="size-5 text-primary" strokeWidth={1.75} />
        {EVENT_LABEL[event]}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{EVENT_HELP[event]}</p>
      <Button className="mt-4 w-full" size="lg" onClick={onFinish}>
        {next}
      </Button>
    </section>
  );
}
