"use client";

import { useEffect, useMemo, useState } from "react";
import { JoinQr } from "@/components/game/JoinQr";
import { VisualRoulette } from "@/components/game/VisualRoulette";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { RESTAURANTS } from "@/data/restaurants";
import type { GameController } from "@/hooks/useGame";
import { nextScreenAfterFood } from "@/lib/game/flow";
import { buildJoinUrl } from "@/lib/utils/joinLink";
import { packSharePayload } from "@/lib/utils/seed";
import { pickOne } from "@/lib/utils/random";

export function FoodRouletteScreen({ game }: { game: GameController }) {
  const s = game.state!;

  useEffect(() => {
    if (s.playMode === "twoPhones" && s.isHost) {
      game.go("waitingFood");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.playMode, s.isHost]);

  const available = useMemo(() => {
    const discardedIds = s.discardedRestaurantIds ?? [];
    return RESTAURANTS.filter((r) => !discardedIds.includes(r.id));
  }, [s.discardedRestaurantIds]);

  const [spinning, setSpinning] = useState(false);
  const [resultId, setResultId] = useState<string | null>(s.restaurantId || null);
  const [revealed, setRevealed] = useState(Boolean(s.restaurantId));
  const [shared, setShared] = useState(false);

  const twoPhonesGuest = s.playMode === "twoPhones" && !s.isHost;

  if (s.playMode === "twoPhones" && s.isHost) {
    return null;
  }

  const items = available.map((r) => ({
    id: r.id,
    label: r.name,
    color: undefined as string | undefined,
  }));

  const palette = [
    "#ff8a6a",
    "#2a9d8f",
    "#f4a261",
    "#e76f51",
    "#264653",
    "#e9c46a",
    "#9b5de5",
    "#00bbf9",
  ];
  items.forEach((item, i) => {
    item.color = palette[i % palette.length];
  });

  const result = RESTAURANTS.find((r) => r.id === resultId);
  const shareCode = resultId
    ? packSharePayload(s.sessionCode, resultId)
    : packSharePayload(s.sessionCode);
  const shareUrl = buildJoinUrl(shareCode);

  const partnerName = useMemo(() => {
    if (!s.localPlayer) return "el anfitrión";
    return s.localPlayer === "gabri" ? s.players.tati.name : s.players.gabri.name;
  }, [s]);

  const spin = () => {
    if (spinning || available.length === 0) return;
    const next = pickOne(available);
    setRevealed(false);
    setResultId(next.id);
    setSpinning(true);
  };

  const goNext = () => {
    game.go(nextScreenAfterFood(s));
  };

  const confirmAndMaybeShare = () => {
    if (!resultId) return;
    game.confirmRestaurant(resultId);
    if (twoPhonesGuest) {
      setShared(true);
      return;
    }
    goNext();
  };

  if (shared && result) {
    return (
      <ScreenShell tone="cream">
        <div className="flex flex-1 flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
            Para el anfitrión
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
            Hoy coméis en {result.name}
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-65">
            Pásale este código o QR a {partnerName}. Así el otro móvil se queda con el
            mismo sitio y puede seguir.
          </p>

          <div className="mt-6 flex justify-center">
            <JoinQr url={shareUrl} label="O pásale el código de abajo 💗" />
          </div>

          <div className="mt-5 rounded-3xl bg-[#1c1410] px-4 py-5 text-center text-[#fff4ea]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
              Código de comida
            </p>
            <p className="mt-2 break-all font-[family-name:var(--font-display)] text-2xl tracking-[0.12em]">
              {shareCode}
            </p>
          </div>

          <div className="mt-auto pt-8">
            <Button onClick={goNext}>Continuar a mi color</Button>
          </div>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Antes de nada
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          ¿Dónde comemos?
        </h2>
        <p className="mt-3 text-sm opacity-60">
          {twoPhonesGuest
            ? "Tú eliges el sitio. El anfitrión está esperando tu respuesta."
            : "Las Arenas decide… o no."}
        </p>

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
              <Button onClick={confirmAndMaybeShare}>Vale, nos quedamos con esta</Button>
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
          {!twoPhonesGuest && (
            <Button variant="ghost" onClick={goNext}>
              Saltar comida
            </Button>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}
