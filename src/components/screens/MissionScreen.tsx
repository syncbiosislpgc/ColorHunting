"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhotoCapture } from "@/components/game/PhotoCapture";
import { Button } from "@/components/ui/Button";
import { ProgressPill } from "@/components/ui/ProgressPill";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TOTAL_MISSIONS } from "@/data/config";
import { getColorById } from "@/data/colors";
import { getMissionById } from "@/data/missions";
import { getSpecialById } from "@/data/specialChallenges";
import type { GameController } from "@/hooks/useGame";
import {
  continueLoveLine,
  jointLoveLine,
  missionLoveLine,
  photoReadyLine,
} from "@/lib/utils/loveCopy";
import type { PlayerId } from "@/types";

export function MissionScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const index = s.currentMissionIndex;
  const mission = getMissionById(s.missionIds[index]!);
  const special = s.activeSpecialChallengeId
    ? getSpecialById(s.activeSpecialChallengeId)
    : null;

  const isFinal = index === 9;
  const gabriName = s.players.gabri.name;
  const tatiName = s.players.tati.name;

  const gabriPhoto = useMemo(
    () =>
      s.photos.find(
        (p) => p.missionIndex === index && (p.playerId === "gabri" || p.isJoint),
      ),
    [s.photos, index],
  );
  const tatiPhoto = useMemo(
    () =>
      s.photos.find(
        (p) => p.missionIndex === index && (p.playerId === "tati" || p.isJoint),
      ),
    [s.photos, index],
  );
  const jointPhoto = useMemo(
    () =>
      s.photos.find(
        (p) => p.missionIndex === index && (p.isJoint || p.playerId === "both"),
      ),
    [s.photos, index],
  );

  const [capturing, setCapturing] = useState<PlayerId | "both" | null>(null);
  const [doneFlash, setDoneFlash] = useState(false);
  const [loveToast, setLoveToast] = useState<string | null>(null);

  const localColorId = s.localPlayer
    ? s.players[s.localPlayer].currentColorId
    : null;
  const localColor = localColorId ? getColorById(localColorId) : null;
  const canContinue = game.canCompleteCurrent();

  const finish = () => {
    if (mission.requiresPhoto && !canContinue) return;
    setDoneFlash(true);
    setTimeout(() => {
      game.completeMission();
      setDoneFlash(false);
      setCapturing(null);
    }, 800);
  };

  const onConfirmPhoto = async (blob: Blob) => {
    if (!capturing) return;
    const isJoint = capturing === "both" || isFinal;
    const playerId: PlayerId | "both" = isJoint ? "both" : capturing;
    await game.saveMissionPhoto(blob, playerId, isJoint);
    setLoveToast(
      isJoint
        ? "Foto juntitos guardada 🥰❤️"
        : photoReadyLine(
            capturing as PlayerId,
            s.players[capturing as PlayerId].name,
          ),
    );
    setCapturing(null);
    setTimeout(() => setLoveToast(null), 1800);
  };

  return (
    <ScreenShell tone={isFinal ? "sunset" : "cream"}>
      <div className="flex flex-1 flex-col">
        <ProgressPill current={index + 1} total={TOTAL_MISSIONS} />

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-50">
            {isFinal
              ? "Final juntos"
              : `Prueba ${index + 1} de ${TOTAL_MISSIONS}`}
            {localColor ? ` · ${localColor.name}` : ""}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[2rem] leading-tight">
            {mission.title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed opacity-75">
            {mission.description}
          </p>
          <p className="mt-4 text-sm opacity-55">{mission.instructions}</p>
        </div>

        {localColor && !isFinal && (
          <div className="mt-5 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full shadow-md ring-2 ring-white/70"
              style={{ backgroundColor: localColor.hex }}
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
          <p className="mt-4 text-center text-sm font-medium opacity-70">
            {game.tease}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {capturing ? (
            <PhotoCapture
              label={
                capturing === "both"
                  ? "LA FOTO DE LOS DOS"
                  : `Foto de ${s.players[capturing].name}`
              }
              onConfirm={onConfirmPhoto}
              onCancel={() => setCapturing(null)}
            />
          ) : isFinal ? (
            <>
              <p className="text-center text-sm opacity-70">{jointLoveLine()}</p>
              <Button onClick={() => setCapturing("both")}>
                {jointPhoto
                  ? "Repetir foto juntos ❤️"
                  : "Hacer la foto juntos 🥰"}
              </Button>
              {jointPhoto && (
                <p className="text-center text-xs text-[#c44536]">
                  Listo el recuerdo juntos 💘
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-center text-sm opacity-65">
                Una fotito cada uno. Dos botones, dos corazones.
              </p>
              <Button onClick={() => setCapturing("gabri")}>
                {gabriPhoto
                  ? `Foto de ${gabriName} lista 💙`
                  : `Subir foto de ${gabriName} 💙`}
              </Button>
              <p className="text-center text-xs opacity-50">
                {missionLoveLine("gabri", gabriName)}
              </p>
              <Button
                className="!bg-[#ff8a6a] !text-[#1c1410]"
                onClick={() => setCapturing("tati")}
              >
                {tatiPhoto
                  ? `Foto de ${tatiName} lista 💖`
                  : `Subir foto de ${tatiName} 💖`}
              </Button>
              <p className="text-center text-xs opacity-50">
                {missionLoveLine("tati", tatiName)}
              </p>
            </>
          )}

          {!capturing && (
            <>
              <Button
                disabled={mission.requiresPhoto && !canContinue}
                onClick={finish}
              >
                {continueLoveLine(canContinue || !mission.requiresPhoto)}
              </Button>
              {s.playMode === "twoPhones" && !isFinal && (
                <p className="text-center text-xs opacity-45">
                  En dos móviles basta con tu foto. En un móvil, las dos 💌
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(doneFlash || loveToast) && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-[#1c1410]/80 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[#fff4ea]">
                {doneFlash ? mission.successMessage : loveToast}
              </p>
              {doneFlash && (
                <p className="mt-3 text-sm text-white/60">
                  {mission.celebrationMessage}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenShell>
  );
}
