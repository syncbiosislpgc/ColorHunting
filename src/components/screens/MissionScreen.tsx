"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCapture } from "@/components/game/PhotoCapture";
import { Button } from "@/components/ui/Button";
import { ProgressPill } from "@/components/ui/ProgressPill";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { getColorById } from "@/data/colors";
import { getMissionById } from "@/data/missions";
import { getSpecialById } from "@/data/specialChallenges";
import { TOTAL_MISSIONS } from "@/data/config";
import type { GameController } from "@/hooks/useGame";

export function MissionScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const index = s.currentMissionIndex;
  const mission = getMissionById(s.missionIds[index]!);
  const who = game.activePlayer;
  const playerName =
    who === "both"
      ? `${s.players.gabri.name} & ${s.players.tati.name}`
      : s.players[who].name;
  const colorId =
    who === "both"
      ? null
      : s.players[who].currentColorId;
  const color = colorId ? getColorById(colorId) : null;
  const special = s.activeSpecialChallengeId
    ? getSpecialById(s.activeSpecialChallengeId)
    : null;

  const [showCamera, setShowCamera] = useState(false);
  const [doneFlash, setDoneFlash] = useState(false);
  const [noPhotoMode, setNoPhotoMode] = useState(false);

  const isFinal = index === 9;

  const finish = (photoId?: string) => {
    setDoneFlash(true);
    setTimeout(() => {
      game.completeMission(photoId);
      setDoneFlash(false);
      setShowCamera(false);
      setNoPhotoMode(false);
    }, 700);
  };

  return (
    <ScreenShell tone={isFinal ? "sunset" : "cream"}>
      <div className="flex flex-1 flex-col">
        <ProgressPill current={index + 1} total={TOTAL_MISSIONS} />

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
            {isFinal ? "Final" : playerName}
            {color ? ` · ${color.name}` : ""}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] leading-tight">
            {mission.title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed opacity-75">
            {mission.description}
          </p>
          <p className="mt-4 text-sm opacity-55">{mission.instructions}</p>
        </div>

        {color && (
          <div className="mt-6 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full shadow-md ring-2 ring-white/70"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-sm opacity-60">Tu color de esta prueba</p>
          </div>
        )}

        {special && (
          <div className="mt-5 rounded-3xl bg-[#1c1410] px-4 py-4 text-[#fff8f1]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Extra · {special.title}
            </p>
            <p className="mt-2 text-sm text-white/85">{special.description}</p>
          </div>
        )}

        {game.tease && (
          <p className="mt-5 text-center text-sm font-medium opacity-70">{game.tease}</p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          {showCamera ? (
            <PhotoCapture
              label={isFinal ? "LA FOTO" : "Captura la prueba"}
              onConfirm={async (blob) => {
                const photoId = await game.saveMissionPhoto(
                  blob,
                  isFinal ? "both" : who === "both" ? "both" : who,
                  isFinal,
                );
                finish(photoId || undefined);
              }}
              onCancel={() => setShowCamera(false)}
            />
          ) : noPhotoMode ? (
            <>
              <p className="mb-2 text-center text-sm opacity-60">
                ¿Seguro que esta prueba no necesita foto?
              </p>
              <Button onClick={() => finish()}>Marcar completada</Button>
              <Button variant="ghost" onClick={() => setNoPhotoMode(false)}>
                Volver
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setShowCamera(true)}>
                {mission.requiresPhoto ? "Hacer / elegir foto" : "Completar"}
              </Button>
              {mission.requiresPhoto && (
                <Button variant="ghost" onClick={() => setNoPhotoMode(true)}>
                  Completar sin foto
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {doneFlash && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[#1c1410]/80 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[#fff4ea]">
                {mission.successMessage}
              </p>
              <p className="mt-3 text-sm text-white/60">{mission.celebrationMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  );
}
