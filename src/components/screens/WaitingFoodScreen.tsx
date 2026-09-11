"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getRestaurantByIdSafe } from "@/data/restaurants";
import type { GameController } from "@/hooks/useGame";
import { nextScreenAfterFood } from "@/lib/game/flow";
import { normalizeSessionCode, unpackSharePayload } from "@/lib/utils/seed";

export function WaitingFoodScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const partner = useMemo(() => {
    if (!s.localPlayer) return "el otro";
    return s.localPlayer === "gabri" ? s.players.tati.name : s.players.gabri.name;
  }, [s]);

  const applyCode = () => {
    setError(null);
    const { sessionCode, restaurantId } = unpackSharePayload(code);
    if (!sessionCode) {
      setError("Código incompleto.");
      return;
    }
    if (normalizeSessionCode(sessionCode) !== normalizeSessionCode(s.sessionCode)) {
      setError("Ese código no es de esta aventura.");
      return;
    }
    if (!restaurantId || !getRestaurantByIdSafe(restaurantId)) {
      setError("Falta el sitio de comida. Pide el código completo al invitado.");
      return;
    }
    game.confirmRestaurant(restaurantId);
    game.go(nextScreenAfterFood({ ...s, restaurantId }));
  };

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Anfitrión
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          Esperando la comida…
        </h2>
        <p className="mt-4 text-sm leading-relaxed opacity-65">
          {partner} elige dónde coméis en el otro móvil. Cuando confirme, te pasará un
          código. Pégalo aquí y seguís con el mismo sitio.
        </p>

        <div className="mt-8 rounded-[1.75rem] bg-black/[0.04] px-5 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-45">
            Tu código de aventura
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-[0.18em]">
            {s.sessionCode}
          </p>
        </div>

        <label className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
          Código de comida del invitado
        </label>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder={`${s.sessionCode}-GOIKO`}
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-4 text-center text-lg tracking-[0.12em] outline-none ring-[#ff8a6a]/40 focus:ring-2"
          autoCapitalize="characters"
        />
        {error && <p className="mt-2 text-center text-sm text-[#b42318]">{error}</p>}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <Button disabled={code.trim().length < 6} onClick={applyCode}>
            Continuar con ese sitio
          </Button>
          <Button variant="ghost" onClick={() => game.go("sessionSetup")}>
            Volver
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
