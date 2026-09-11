"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VisualRoulette } from "@/components/game/VisualRoulette";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { COLORS, getColorById } from "@/data/colors";
import type { GameController } from "@/hooks/useGame";

export function ColorRevealScreen({
  game,
  player,
}: {
  game: GameController;
  player: "gabri" | "tati";
}) {
  const state = game.state!;
  const name = state.players[player].name;
  const colorId = state.players[player].currentColorId!;
  const color = getColorById(colorId);

  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const items = useMemo(
    () =>
      COLORS.map((c) => ({
        id: c.id,
        label: c.name,
        color: c.hex,
      })),
    [],
  );

  const isFirst = player === "gabri";

  return (
    <ScreenShell tone={isFirst ? "cream" : "ocean"}>
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          {isFirst ? "Primero" : "Ahora"}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight">
          {name}, descubre tu color
        </h2>
        <p className="mt-3 text-sm opacity-60">
          {isFirst
            ? "Gira la ruleta. No mires la del otro todavía."
            : "Tu turno. El color anterior se queda en secreto un momento más."}
        </p>

        <div className="mt-8">
          <VisualRoulette
            items={items}
            spinning={spinning}
            resultId={revealed || spinning ? colorId : null}
            onSpinEnd={() => {
              setSpinning(false);
              setRevealed(true);
            }}
          />
        </div>

        <div className="mt-8 min-h-[120px] text-center">
          {revealed ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
                Tu color es
              </p>
              <div
                className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/60"
                style={{ backgroundColor: color.hex }}
              />
              <p className="mt-4 font-[family-name:var(--font-display)] text-4xl">{color.name}</p>
            </motion.div>
          ) : (
            <p className="text-sm opacity-50">{spinning ? "La ruleta decide…" : "Cuando estés lista/o…"}</p>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          {!revealed ? (
            <Button
              className={isFirst ? "" : "!bg-[#ffe1c9] !text-[#0c2f36]"}
              onClick={() => {
                if (spinning) return;
                setSpinning(true);
              }}
              disabled={spinning}
            >
              Girar
            </Button>
          ) : (
            <Button
              className={isFirst ? "" : "!bg-[#ffe1c9] !text-[#0c2f36]"}
              onClick={() => game.go(isFirst ? "colorTati" : "briefing")}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}
