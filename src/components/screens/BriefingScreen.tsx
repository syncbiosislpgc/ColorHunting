"use client";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getColorById } from "@/data/colors";
import type { GameController } from "@/hooks/useGame";

export function BriefingScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const g = getColorById(s.players.gabri.currentColorId!);
  const t = getColorById(s.players.tati.currentColorId!);

  return (
    <ScreenShell tone="ink">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
          La idea
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#fff4ea]">
          Diez pruebas.
          <br />
          Dos colores.
          <br />
          Una tarde.
        </h2>
        <p className="mt-5 text-base text-white/65">
          Irán apareciendo de una en una. No miréis adelante. Solo la que toca.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/8 p-4 text-center backdrop-blur">
            <div
              className="mx-auto h-12 w-12 rounded-full ring-2 ring-white/30"
              style={{ backgroundColor: g.hex }}
            />
            <p className="mt-3 text-sm font-semibold">{s.players.gabri.name}</p>
            <p className="text-xs text-white/50">{g.name}</p>
          </div>
          <div className="rounded-3xl bg-white/8 p-4 text-center backdrop-blur">
            <div
              className="mx-auto h-12 w-12 rounded-full ring-2 ring-white/30"
              style={{ backgroundColor: t.hex }}
            />
            <p className="mt-3 text-sm font-semibold">{s.players.tati.name}</p>
            <p className="text-xs text-white/50">{t.name}</p>
          </div>
        </div>

        <div className="mt-auto pt-10">
          <Button
            className="!bg-[#ff8a6a] !text-[#1c1410]"
            onClick={() => game.go("mission")}
          >
            Primera prueba
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
