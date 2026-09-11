"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import type { GameController } from "@/hooks/useGame";

export function SurpriseOneScreen({ game }: { game: GameController }) {
  return (
    <ScreenShell tone="night">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl leading-snug text-[#f7f1e8]">
          Solo tienes que hacer una cosa.
        </p>
        <div className="mt-12 w-full">
          <Button
            className="!bg-[#f7f1e8] !text-[#121826]"
            onClick={() => game.go("surpriseTwo")}
          >
            Seguir
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export function SurpriseTwoScreen({ game }: { game: GameController }) {
  return (
    <ScreenShell tone="sunset">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Pista
        </p>
        <p className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight">
          Estar preparada a las 14:00.
        </p>
        <p className="mt-4 max-w-[16rem] text-sm opacity-60">
          Solo una pista. La aventura empieza cuando vosotros queráis.
        </p>
        <div className="mt-12 w-full">
          <Button onClick={() => game.go("ready")}>Entendido</Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export function ReadyScreen({ game }: { game: GameController }) {
  return (
    <ScreenShell tone="ocean">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-[family-name:var(--font-display)] text-4xl">Perfecto.</p>
        <p className="mt-4 text-lg text-white/75">Cuando queráis, empieza la cita.</p>
        <div className="mt-12 w-full">
          <Button
            className="!bg-[#ffe1c9] !text-[#0c2f36]"
            onClick={() => game.go("players")}
          >
            Empezar
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
