import { CloudRain, Scissors, Store } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { DieFace } from "@/components/die-face.tsx";
import { EVENT_HELP, EVENT_LABEL, RONDEL } from "@/lib/game/data.ts";
import {
  edithActions,
  eventForRound,
  playerDieHelp,
  youAreFirst,
} from "@/lib/game/engine.ts";
import type { DraftPick, GameState } from "@/lib/game/types.ts";

export function ActionPanel({
  state,
  onContinue,
  onFinishEvent,
}: {
  state: GameState;
  onContinue: () => void;
  onFinishEvent: () => void;
}) {
  if (state.phase === "yourPick") {
    return (
      <PromptCard eyebrow="Your pick" title="Choose any remaining die">
        <p>
          You go first this round. Each die gardens in its zone and takes the action of
          the note it sits on.
        </p>
      </PromptCard>
    );
  }
  if (state.phase === "forcedPick") {
    const live = state.dice.filter((d) => state.remainingIds.includes(d.id));
    const min = live.length ? Math.min(...live.map((x) => x.value)) : 0;
    const die = live.find((d) => d.value === min);
    return (
      <PromptCard eyebrow="Forced pick" title="Take the lowest remaining die">
        <p>
          As first player, your second die must be the lowest still on the board
          {die ? ` — a ${die.value} on ${RONDEL[die.spaceIndex].short}.` : "."}
        </p>
      </PromptCard>
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
        <li>
          <span className="font-semibold text-ink">Garden.</span> {help.garden}
        </li>
        <li>
          <span className="font-semibold text-ink">Rondel.</span> {help.rondel}
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
        <DieFace value={pick.value} />
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-danger">Edith</p>
          <h2 className="font-display text-xl text-ink">
            Takes {pick.value} · {RONDEL[pick.spaceIndex].short}
          </h2>
          <p className="text-sm text-muted">Garden first, then the rondel. Cross these off your sheet.</p>
        </div>
      </div>
      <ol className="mt-4 space-y-3">
        {actions.map((action) => (
          <li key={action.title} className="rounded-[var(--radius-md)] bg-well px-3 py-3">
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
