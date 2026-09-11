"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PLAYER_NAMES } from "@/data/config";
import {
  acknowledgeEvent,
  addPhotoMeta,
  applyColorSwap,
  canCompleteMission,
  completeCurrentMission,
  createFreshGame,
  createPhotoId,
  discardRestaurant,
  getActivePlayerForMission,
  rivalryMessage,
  selectRestaurant,
  setLocalPlayer as setLocalPlayerState,
  setPlayMode as setPlayModeState,
  setScreen,
  updatePlayerNames,
} from "@/lib/game/engine";
import {
  clearGameState,
  hasSavedGame,
  loadGameState,
  loadSavedNames,
  saveGameState,
  saveNames,
} from "@/lib/storage/localState";
import { clearAllPhotos, savePhotoBlob } from "@/lib/storage/photoDb";
import { unpackSharePayload } from "@/lib/utils/seed";
import type {
  CollageTemplateId,
  GameState,
  PlayMode,
  PlayerId,
  ScreenId,
} from "@/types";

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [savedExists, setSavedExists] = useState(false);

  useEffect(() => {
    setSavedExists(hasSavedGame());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (state) saveGameState(state);
  }, [state]);

  const patch = useCallback((updater: (s: GameState) => GameState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  }, []);

  const startNew = useCallback(
    (
      names?: { gabri: string; tati: string },
      initialScreen: ScreenId = "welcome",
    ) => {
      const savedNames = names || loadSavedNames() || DEFAULT_PLAYER_NAMES;
      saveNames(savedNames);
      void clearAllPhotos();
      clearGameState();
      const fresh = createFreshGame(savedNames);
      fresh.screen = initialScreen;
      setState(fresh);
      setSavedExists(false);
    },
    [],
  );

  const continueGame = useCallback(() => {
    const saved = loadGameState();
    if (saved) {
      setState(saved);
      setSavedExists(true);
    }
  }, []);

  const go = useCallback(
    (screen: ScreenId) => {
      patch((s) => setScreen(s, screen));
    },
    [patch],
  );

  const setNames = useCallback(
    (names: { gabri: string; tati: string }) => {
      saveNames(names);
      patch((s) => updatePlayerNames(s, names));
    },
    [patch],
  );

  const confirmRestaurant = useCallback(
    (id: string) => {
      patch((s) => selectRestaurant(s, id));
    },
    [patch],
  );

  const rejectRestaurant = useCallback(
    (id: string) => {
      patch((s) => discardRestaurant(s, id));
    },
    [patch],
  );

  const finishColorSwap = useCallback(() => {
    patch((s) => {
      const swapped = s.colorSwapTriggered ? s : applyColorSwap(s);
      return setScreen({ ...swapped, colorSwapPending: false }, "mission");
    });
  }, [patch]);

  const triggerSwapNow = useCallback(() => {
    patch((s) => applyColorSwap(s));
  }, [patch]);

  const dismissEvent = useCallback(() => {
    patch((s) => acknowledgeEvent(s));
  }, [patch]);

  const saveMissionPhoto = useCallback(
    async (blob: Blob, playerId: PlayerId | "both", isJoint = false) => {
      if (!state) return null;
      const id = createPhotoId();
      await savePhotoBlob(id, blob);
      const index = state.currentMissionIndex;
      const missionId = state.missionIds[index]!;
      patch((s) => {
        const photos = s.photos.filter((p) => {
          if (p.missionIndex !== index) return true;
          if (isJoint) return !(p.isJoint || p.playerId === "both");
          return p.playerId !== playerId;
        });
        return addPhotoMeta(
          { ...s, photos },
          {
            id,
            missionId,
            missionIndex: index,
            playerId,
            isJoint,
            selectedForGabri: playerId === "gabri" || isJoint,
            selectedForTati: playerId === "tati" || isJoint,
          },
        );
      });
      return id;
    },
    [state, patch],
  );

  const completeMission = useCallback(
    (photoId?: string) => {
      patch((s) => completeCurrentMission(s, photoId));
    },
    [patch],
  );

  const togglePhotoSelection = useCallback(
    (photoId: string, forPlayer: PlayerId) => {
      patch((s) => ({
        ...s,
        photos: s.photos.map((p) => {
          if (p.id !== photoId) return p;
          if (p.isJoint) {
            return { ...p, selectedForGabri: true, selectedForTati: true };
          }
          if (forPlayer === "gabri") {
            return { ...p, selectedForGabri: !p.selectedForGabri };
          }
          return { ...p, selectedForTati: !p.selectedForTati };
        }),
        updatedAt: new Date().toISOString(),
      }));
    },
    [patch],
  );

  const setTemplate = useCallback(
    (player: PlayerId, template: CollageTemplateId) => {
      patch((s) => ({
        ...s,
        collage: {
          ...s.collage,
          ...(player === "gabri"
            ? { gabriTemplate: template }
            : { tatiTemplate: template }),
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    [patch],
  );

  const markCollageGenerated = useCallback(
    (player: PlayerId) => {
      patch((s) => ({
        ...s,
        collage: {
          ...s.collage,
          ...(player === "gabri"
            ? { gabriGenerated: true }
            : { tatiGenerated: true }),
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    [patch],
  );

  const syncCollageSelection = useCallback(() => {
    patch((s) => ({
      ...s,
      collage: {
        ...s.collage,
        gabriPhotoIds: s.photos
          .filter((p) => p.selectedForGabri)
          .map((p) => p.id),
        tatiPhotoIds: s.photos
          .filter((p) => p.selectedForTati)
          .map((p) => p.id),
      },
      updatedAt: new Date().toISOString(),
    }));
  }, [patch]);

  const setLocalPlayer = useCallback(
    (player: PlayerId) => {
      patch((s) => setLocalPlayerState(s, player));
    },
    [patch],
  );

  const setPlayMode = useCallback(
    (mode: PlayMode) => {
      patch((s) => setPlayModeState(s, mode));
    },
    [patch],
  );

  const joinSession = useCallback(
    (rawCode: string) => {
      const { sessionCode, restaurantId } = unpackSharePayload(rawCode);
      if (!sessionCode) return;
      const names = {
        gabri:
          state?.players.gabri.name ||
          loadSavedNames()?.gabri ||
          DEFAULT_PLAYER_NAMES.gabri,
        tati:
          state?.players.tati.name ||
          loadSavedNames()?.tati ||
          DEFAULT_PLAYER_NAMES.tati,
      };
      const localPlayer = state?.localPlayer ?? null;
      void clearAllPhotos();
      clearGameState();
      const fresh = createFreshGame(names, undefined, {
        sessionCode,
        isHost: false,
        playMode: "twoPhones",
        localPlayer,
        restaurantId,
      });
      fresh.screen = "players";
      setState(fresh);
      setSavedExists(false);
    },
    [state],
  );

  const canCompleteCurrent = useCallback(() => {
    return state ? canCompleteMission(state) : false;
  }, [state]);

  const activePlayer = useMemo(
    () => (state ? getActivePlayerForMission(state) : "both"),
    [state],
  );

  const tease = useMemo(
    () => (state ? rivalryMessage(state) : null),
    [state],
  );

  return {
    state,
    hydrated,
    savedExists,
    startNew,
    continueGame,
    go,
    setNames,
    confirmRestaurant,
    rejectRestaurant,
    finishColorSwap,
    triggerSwapNow,
    dismissEvent,
    saveMissionPhoto,
    completeMission,
    togglePhotoSelection,
    setTemplate,
    markCollageGenerated,
    syncCollageSelection,
    activePlayer,
    tease,
    setLocalPlayer,
    setPlayMode,
    joinSession,
    canCompleteCurrent,
    patch,
  };
}

export type GameController = ReturnType<typeof useGame>;
