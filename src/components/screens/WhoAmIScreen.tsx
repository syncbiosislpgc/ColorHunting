"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import type { GameController } from "@/hooks/useGame";
import { consumePendingJoinCode, peekPendingJoinCode } from "@/lib/utils/joinLink";
import type { PlayerId } from "@/types";

export function WhoAmIScreen({ game }: { game: GameController }) {
  const hasJoinInvite = Boolean(peekPendingJoinCode());

  const pick = (player: PlayerId) => {
    game.setLocalPlayer(player);
    const pending = consumePendingJoinCode();
    if (pending) {
      game.joinSession(pending, player);
      return;
    }
    game.go("sessionSetup");
  };

  return (
    <ScreenShell tone="sunset">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Primero
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          ¿Quién eres?
        </h2>
        <p className="mt-3 text-sm opacity-65">
          {hasJoinInvite
            ? "Te han invitado. Elige quién eres y entras a la misma aventura."
            : "Elige tu nombre. Este móvil se queda contigo, con cariño."}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Button
            className="!bg-[#1c1410] !text-[#fff4ea]"
            onClick={() => pick("gabri")}
          >
            Soy Gabri 💙
          </Button>
          <Button
            className="!bg-[#ff8a6a] !text-[#1c1410]"
            onClick={() => pick("tati")}
          >
            Soy Tati 💖
          </Button>
        </div>

        <div className="mt-auto pt-8">
          <p className="text-center text-xs opacity-45">
            {hasJoinInvite
              ? "Después de elegir, entráis a la misma aventura automáticamente."
              : "Luego podéis jugar en el mismo móvil o en dos, con las mismas pruebas."}
          </p>
        </div>
      </div>
    </ScreenShell>
  );
}
