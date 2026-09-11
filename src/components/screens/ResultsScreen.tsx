"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getRestaurantByIdSafe } from "@/data/restaurants";
import type { GameController } from "@/hooks/useGame";
import { getWinner } from "@/lib/game/engine";

export function ResultsScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const winner = getWinner(s);
  const restaurant = s.restaurantId ? getRestaurantByIdSafe(s.restaurantId) : null;

  return (
    <ScreenShell tone="ink">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Final
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#fff4ea]">
          {winner === "tie" ? (
            <>
              Empate técnico.
              <br />
              Claramente habéis ganado los dos.
            </>
          ) : (
            <>
              Gana {s.players[winner].name}.
              <br />
              <span className="text-2xl text-white/60">Pero la cita la habéis ganado juntos.</span>
            </>
          )}
        </h2>

        <div className="mt-10 space-y-3">
          <ScoreRow name={s.players.gabri.name} score={s.players.gabri.score} />
          <ScoreRow name={s.players.tati.name} score={s.players.tati.score} />
          <div className="rounded-3xl bg-white/8 px-4 py-4 text-sm text-white/70">
            <p>Pruebas completadas: {s.completed.length} / 10</p>
            <p className="mt-1">Bonificación conjunta: +{s.jointBonus} cada uno</p>
            {restaurant && <p className="mt-1">Comida: {restaurant.name}</p>}
            {s.colorSwapTriggered && <p className="mt-1">Hubo cambio de color ✨</p>}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/50">
          {s.config.adventureTagline} · {s.config.cityLabel}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <Button
            className="!bg-[#ff8a6a] !text-[#1c1410]"
            onClick={() => game.go("collageGenerate")}
          >
            Volver a los collages
          </Button>
          <Button
            variant="ghost"
            className="!border-white/20 !text-white"
            onClick={() => game.startNew(undefined, "welcome")}
          >
            Nueva aventura
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

function ScoreRow({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between rounded-3xl bg-white/10 px-4 py-4">
      <span className="font-semibold text-[#fff4ea]">{name}</span>
      <span className="font-[family-name:var(--font-display)] text-2xl text-[#ff8a6a]">
        {score}
      </span>
    </div>
  );
}
