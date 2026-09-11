"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getEventById } from "@/data/events";
import type { GameController } from "@/hooks/useGame";

export function EventScreen({ game }: { game: GameController }) {
  const id = game.state?.activeEventId;
  if (!id) return null;
  const event = getEventById(id);

  return (
    <ScreenShell tone="sunset">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Evento
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl">{event.title}</h2>
        <p className="mt-5 max-w-sm text-base opacity-75">{event.description}</p>
        {event.durationHint && (
          <p className="mt-3 text-sm opacity-50">{event.durationHint}</p>
        )}
        <div className="mt-12 w-full">
          <Button onClick={() => game.dismissEvent()}>De acuerdo</Button>
        </div>
      </div>
    </ScreenShell>
  );
}
