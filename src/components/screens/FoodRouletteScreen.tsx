"use client";

import { useMemo, useState } from "react";
import { VisualRoulette } from "@/components/game/VisualRoulette";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { RESTAURANTS } from "@/data/restaurants";
import type { GameController } from "@/hooks/useGame";
import { pickOne } from "@/lib/utils/random";

export function FoodRouletteScreen({ game }: { game: GameController }) {
  const available = useMemo(() => {
    const discardedIds = game.state?.discardedRestaurantIds ?? [];
    return RESTAURANTS.filter((r) => !discardedIds.includes(r.id));
  }, [game.state?.discardedRestaurantIds]);

  const [spinning, setSpinning] = useState(false);
  const [resultId, setResultId] = useState<string | null>(game.state?.restaurantId || null);
  const [revealed, setRevealed] = useState(Boolean(game.state?.restaurantId));

  const items = available.map((r) => ({
    id: r.id,
    label: r.name,
    color: undefined as string | undefined,
  }));

  // Colorize segments
  const palette = ["#ff8a6a", "#2a9d8f", "#f4a261", "#e76f51", "#264653", "#e9c46a", "#9b5de5", "#00bbf9"];
  items.forEach((item, i) => {
    item.color = palette[i % palette.length];
  });

  const result = RESTAURANTS.find((r) => r.id === resultId);

  const spin = () => {
    if (spinning || available.length === 0) return;
    const next = pickOne(available);
    setRevealed(false);
    setResultId(next.id);
    setSpinning(true);
  };

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Antes de nada
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          ¿Dónde comemos?
        </h2>
        <p className="mt-3 text-sm opacity-60">Las Arenas decide… o no.</p>

        <div className="mt-8">
          <VisualRoulette
            items={items}
            spinning={spinning}
            resultId={resultId}
            onSpinEnd={() => {
              setSpinning(false);
              setRevealed(true);
            }}
          />
        </div>

        <div className="mt-8 min-h-[88px] text-center">
          {revealed && result ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                Hoy coméis en…
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                {result.name}
              </p>
            </>
          ) : (
            <p className="text-sm opacity-50">
              {spinning ? "Girando…" : "Dad al botón y que sea lo que sea."}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {!revealed || spinning ? (
            <Button onClick={spin} disabled={spinning || available.length === 0}>
              Girar
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  if (resultId) game.confirmRestaurant(resultId);
                  game.go("colorGabri");
                }}
              >
                Vale, nos quedamos con esta
              </Button>
              <Button
                variant="ghost"
                disabled={available.length <= 1}
                onClick={() => {
                  if (!resultId) return;
                  game.rejectRestaurant(resultId);
                  setResultId(null);
                  setRevealed(false);
                }}
              >
                No me convence
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={() => game.go("colorGabri")}>
            Saltar comida
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
