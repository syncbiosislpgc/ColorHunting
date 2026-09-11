"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import type { GameController } from "@/hooks/useGame";
import { packSharePayload } from "@/lib/utils/seed";

export function SessionSetupScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"choose" | "host" | "join">("choose");

  const shareCode = useMemo(
    () => packSharePayload(s.sessionCode, s.restaurantId),
    [s.sessionCode, s.restaurantId],
  );

  const localName = s.localPlayer ? s.players[s.localPlayer].name : "tú";

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Hola, {localName}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          ¿Cómo jugáis?
        </h2>
        <p className="mt-3 text-sm opacity-65">
          Misma aventura, mismas pruebas. Podéis compartir un móvil o usar dos.
        </p>

        {mode === "choose" && (
          <div className="mt-10 flex flex-col gap-3">
            <Button
              onClick={() => {
                game.setPlayMode("together");
                game.go("food");
              }}
            >
              Juntos en un móvil 💞
            </Button>
            <Button
              variant="soft"
              onClick={() => {
                game.setPlayMode("twoPhones");
                setMode("host");
              }}
            >
              Crear aventura (este móvil)
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                game.setPlayMode("twoPhones");
                setMode("join");
              }}
            >
              Unirme con código
            </Button>
          </div>
        )}

        {mode === "host" && (
          <div className="mt-8 flex flex-1 flex-col">
            <p className="text-sm opacity-70">
              Comparte este código con el otro. Así las 10 pruebas salen iguales.
            </p>
            <div className="mt-6 rounded-3xl bg-[#1c1410] px-4 py-8 text-center text-[#fff4ea]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Código
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-[0.2em]">
                {shareCode}
              </p>
            </div>
            <p className="mt-4 text-center text-xs opacity-50">
              El otro abre la app → Unirme con código → pega esto.
            </p>
            <div className="mt-auto flex flex-col gap-2 pt-8">
              <Button
                onClick={() => {
                  game.setPlayMode("twoPhones");
                  game.go("food");
                }}
              >
                Seguir como anfitrión 💘
              </Button>
              <Button variant="ghost" onClick={() => setMode("choose")}>
                Volver
              </Button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="mt-8 flex flex-1 flex-col">
            <p className="text-sm opacity-70">
              Escribe el código del otro móvil. Las pruebas serán las mismas.
            </p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="mt-6 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-4 text-center text-2xl tracking-[0.25em] outline-none ring-[#ff8a6a]/40 focus:ring-2"
              autoCapitalize="characters"
            />
            <div className="mt-auto flex flex-col gap-2 pt-8">
              <Button
                disabled={joinCode.trim().length < 4}
                onClick={() => game.joinSession(joinCode)}
              >
                Unirme 💗
              </Button>
              <Button variant="ghost" onClick={() => setMode("choose")}>
                Volver
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
