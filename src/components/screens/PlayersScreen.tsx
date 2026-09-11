"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import type { GameController } from "@/hooks/useGame";

export function PlayersScreen({ game }: { game: GameController }) {
  const [gabri, setGabri] = useState(game.state?.players.gabri.name || "Gabri");
  const [tati, setTati] = useState(game.state?.players.tati.name || "Tati");

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Jugadores
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          ¿Quién juega?
        </h2>
        <p className="mt-3 text-sm opacity-60">Podéis dejar los nombres o cambiarlos.</p>

        <div className="mt-10 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
              Jugador 1
            </span>
            <input
              value={gabri}
              onChange={(e) => setGabri(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-lg outline-none ring-[#ff8a6a]/40 focus:ring-2"
              autoCapitalize="words"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
              Jugador 2
            </span>
            <input
              value={tati}
              onChange={(e) => setTati(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-4 text-lg outline-none ring-[#2a9d8f]/40 focus:ring-2"
              autoCapitalize="words"
            />
          </label>
        </div>

        <div className="mt-auto pt-10">
          <Button
            onClick={() => {
              game.setNames({ gabri, tati });
              game.go("food");
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
