"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getColorById } from "@/data/colors";
import type { GameController } from "@/hooks/useGame";
import { playReveal, vibrate } from "@/lib/utils/feedback";

export function ColorSwapScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const [phase, setPhase] = useState<"intro" | "reveal">(
    s.colorSwapTriggered ? "reveal" : "intro",
  );

  useEffect(() => {
    if (!s.colorSwapTriggered && phase === "intro") {
      // apply swap after brief beat when user continues
    }
  }, [s.colorSwapTriggered, phase]);

  const g = getColorById(s.players.gabri.currentColorId!);
  const t = getColorById(s.players.tati.currentColorId!);

  return (
    <ScreenShell tone="night">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {phase === "intro" && !s.colorSwapTriggered ? (
          <>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-[family-name:var(--font-display)] text-3xl text-[#f7f1e8]"
            >
              Algo acaba de cambiar.
            </motion.p>
            <p className="mt-4 text-white/60">Vuestros colores ya no son los mismos.</p>
            <div className="mt-12 w-full">
              <Button
                className="!bg-[#ff8a6a] !text-[#1c1410]"
                onClick={() => {
                  game.triggerSwapNow();
                  playReveal();
                  vibrate([30, 50, 30]);
                  setPhase("reveal");
                }}
              >
                Ver el giro
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Segunda mitad
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[#f7f1e8]">
              Ahora empieza la segunda mitad.
            </p>
            <div className="mt-10 grid w-full grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white/8 p-4">
                <div
                  className="mx-auto h-14 w-14 rounded-full"
                  style={{ backgroundColor: g.hex }}
                />
                <p className="mt-3 text-sm">{s.players.gabri.name}</p>
                <p className="text-xs text-white/50">{g.name}</p>
              </div>
              <div className="rounded-3xl bg-white/8 p-4">
                <div
                  className="mx-auto h-14 w-14 rounded-full"
                  style={{ backgroundColor: t.hex }}
                />
                <p className="mt-3 text-sm">{s.players.tati.name}</p>
                <p className="text-xs text-white/50">{t.name}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/50">
              Lo ya completado se conserva. La foto final no cambia.
            </p>
            <div className="mt-10 w-full">
              <Button
                className="!bg-[#f7f1e8] !text-[#121826]"
                onClick={() => game.finishColorSwap()}
              >
                Seguir
              </Button>
            </div>
          </>
        )}
      </div>
    </ScreenShell>
  );
}
