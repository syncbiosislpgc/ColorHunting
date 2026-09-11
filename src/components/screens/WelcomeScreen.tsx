"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import type { GameController } from "@/hooks/useGame";

export function WelcomeScreen({ game }: { game: GameController }) {
  return (
    <ScreenShell tone="ink" className="selection:bg-white/20">
      <div className="flex flex-1 flex-col justify-between py-8">
        <div className="pt-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
            Solo para dos
          </p>
        </div>

        <div className="text-center">
          <h1 className="font-[family-name:var(--font-display)] text-[3.4rem] leading-[0.95] tracking-[-0.03em] text-[#fff4ea]">
            Gabri
            <span className="mx-2 inline-block text-[2.2rem] text-[#ff8a6a]">×</span>
            Tati
          </h1>
          <p className="mt-5 text-base text-white/65">Una pequeña aventura para dos.</p>
        </div>

        <div className="flex flex-col gap-3 pb-4">
          {game.savedExists && (
            <Button
              variant="soft"
              className="!bg-white/15 !text-white !border-white/20"
              onClick={() => game.continueGame()}
            >
              Continuar
            </Button>
          )}
          <Button
            className="!bg-[#ff8a6a] !text-[#1c1410] hover:!bg-[#ff9d82]"
            onClick={() => game.startNew(undefined, "surpriseOne")}
          >
            {game.savedExists ? "Nueva aventura" : "Abrir"}
          </Button>
          <p className="text-center text-xs text-white/35">Todo ocurre en este teléfono.</p>
        </div>
      </div>
    </ScreenShell>
  );
}
