import {
  COLOR_SWAP_MAX_INDEX,
  COLOR_SWAP_MIN_INDEX,
  DEFAULT_CONFIG,
  DEFAULT_PLAYER_NAMES,
  TOTAL_MISSIONS,
} from "@/data/config";
import { getMissionById } from "@/data/missions";
import { SPECIAL_CHALLENGES } from "@/data/specialChallenges";
import { RANDOM_EVENTS } from "@/data/events";
import { pickColorForSecondPlayer, pickContrastingPair } from "@/lib/game/colorContrast";
import { buildMissionDeck } from "@/lib/game/missionSelector";
import { chance, pickOne, todayLabel, uid } from "@/lib/utils/random";
import {
  createSeededRandom,
  generateSessionCode,
  normalizeSessionCode,
  seedFromSessionCode,
} from "@/lib/utils/seed";
import type {
  CompletedMission,
  GameConfig,
  GameState,
  PhotoMeta,
  PlayMode,
  PlayerId,
  ScreenId,
} from "@/types";
import { GAME_VERSION } from "@/types";

export function createFreshGame(
  names: { gabri: string; tati: string } = DEFAULT_PLAYER_NAMES,
  config: GameConfig = DEFAULT_CONFIG,
  options?: {
    sessionCode?: string;
    isHost?: boolean;
    playMode?: PlayMode;
    localPlayer?: PlayerId | null;
    restaurantId?: string | null;
  },
): GameState {
  const sessionCode = normalizeSessionCode(options?.sessionCode || generateSessionCode());
  const sessionSeed = seedFromSessionCode(sessionCode);
  const random = createSeededRandom(sessionSeed);

  const [colorGabri, colorTati] = pickContrastingPair([], random);
  const missionIds = buildMissionDeck(random);
  const now = new Date().toISOString();

  // Decide if/when color swap happens (after completing mission at index 3..6)
  let colorSwapAtIndex: number | null = null;
  if (config.colorSwapEnabled && chance(config.colorSwapProbability, random)) {
    const optionsIdx = [];
    for (let i = COLOR_SWAP_MIN_INDEX; i <= COLOR_SWAP_MAX_INDEX; i++) {
      optionsIdx.push(i);
    }
    colorSwapAtIndex = pickOne(optionsIdx, random);
  }

  return {
    version: GAME_VERSION,
    createdAt: now,
    updatedAt: now,
    screen: "welcome",
    players: {
      gabri: {
        id: "gabri",
        name: names.gabri || DEFAULT_PLAYER_NAMES.gabri,
        initialColorId: colorGabri.id,
        currentColorId: colorGabri.id,
        score: 0,
      },
      tati: {
        id: "tati",
        name: names.tati || DEFAULT_PLAYER_NAMES.tati,
        initialColorId: colorTati.id,
        currentColorId: colorTati.id,
        score: 0,
      },
    },
    localPlayer: options?.localPlayer ?? null,
    playMode: options?.playMode ?? "together",
    sessionCode,
    sessionSeed,
    isHost: options?.isHost ?? true,
    missionIds,
    currentMissionIndex: 0,
    completed: [],
    photos: [],
    colorSwapTriggered: false,
    colorSwapPending: false,
    colorSwapAtIndex,
    events: [],
    restaurantId: options?.restaurantId ?? null,
    discardedRestaurantIds: [],
    jointBonus: 0,
    collage: {
      gabriPhotoIds: [],
      tatiPhotoIds: [],
      gabriTemplate: "editorial",
      tatiTemplate: "polaroid",
      gabriGenerated: false,
      tatiGenerated: false,
    },
    activeSpecialChallengeId: null,
    activeEventId: null,
    config: {
      ...config,
      dateLabel: config.dateLabel || todayLabel(),
    },
  };
}

export function touch(state: GameState): GameState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function setScreen(state: GameState, screen: ScreenId): GameState {
  return touch({ ...state, screen });
}

export function updatePlayerNames(
  state: GameState,
  names: { gabri: string; tati: string },
): GameState {
  return touch({
    ...state,
    players: {
      gabri: { ...state.players.gabri, name: names.gabri.trim() || DEFAULT_PLAYER_NAMES.gabri },
      tati: { ...state.players.tati, name: names.tati.trim() || DEFAULT_PLAYER_NAMES.tati },
    },
  });
}

export function setLocalPlayer(state: GameState, localPlayer: PlayerId): GameState {
  return touch({ ...state, localPlayer });
}

export function setPlayMode(state: GameState, playMode: PlayMode): GameState {
  return touch({ ...state, playMode });
}

export function photosForMission(state: GameState, missionIndex: number) {
  return state.photos.filter((p) => p.missionIndex === missionIndex);
}

export function hasPlayerPhoto(
  state: GameState,
  missionIndex: number,
  playerId: PlayerId | "both",
): boolean {
  return state.photos.some(
    (p) =>
      p.missionIndex === missionIndex &&
      (playerId === "both" ? p.isJoint || p.playerId === "both" : p.playerId === playerId || p.isJoint),
  );
}

export function canCompleteMission(state: GameState): boolean {
  const index = state.currentMissionIndex;
  const mission = getMissionById(state.missionIds[index]!);
  if (!mission.requiresPhoto) return true;
  if (index === 9) {
    return hasPlayerPhoto(state, index, "both");
  }
  if (state.playMode === "together") {
    return hasPlayerPhoto(state, index, "gabri") && hasPlayerPhoto(state, index, "tati");
  }
  const local = state.localPlayer ?? "gabri";
  return hasPlayerPhoto(state, index, local);
}

export function assignRevealedColors(state: GameState): GameState {
  // Colors already assigned at creation; this is a no-op helper for clarity
  return touch(state);
}

export function getActivePlayerForMission(state: GameState): PlayerId | "both" {
  const mission = getMissionById(state.missionIds[state.currentMissionIndex]!);
  if (mission.audience === "cooperative" || mission.targetPlayer === "both") return "both";
  // Alternate individual missions between players based on index
  return state.currentMissionIndex % 2 === 0 ? "gabri" : "tati";
}

export function applyColorSwap(state: GameState): GameState {
  if (state.colorSwapTriggered) return state;
  const prevG = state.players.gabri.currentColorId!;
  const prevT = state.players.tati.currentColorId!;
  const [nextG] = pickContrastingPair([prevG, prevT]);
  const nextT = pickColorForSecondPlayer(nextG, [prevG, prevT, nextG.id]);

  return touch({
    ...state,
    colorSwapTriggered: true,
    colorSwapPending: false,
    players: {
      gabri: {
        ...state.players.gabri,
        currentColorId: nextG.id,
      },
      tati: {
        ...state.players.tati,
        currentColorId: nextT.id,
      },
    },
    screen: "colorSwap",
  });
}

export function maybeQueueColorSwap(state: GameState): GameState {
  if (
    state.colorSwapAtIndex !== null &&
    !state.colorSwapTriggered &&
    state.currentMissionIndex === state.colorSwapAtIndex &&
    state.completed.length === state.colorSwapAtIndex + 1
  ) {
    return touch({ ...state, colorSwapPending: true, screen: "colorSwap" });
  }
  return state;
}

export function maybeTriggerEvent(state: GameState): GameState {
  if (state.currentMissionIndex >= 9) return state;
  if (state.events.length >= state.config.maxEventsPerGame) return state;
  if (state.activeEventId) return state;
  if (!chance(state.config.eventProbability)) return state;

  const used = new Set(state.events.map((e) => e.eventId));
  const pool = RANDOM_EVENTS.filter((e) => !used.has(e.id));
  if (pool.length === 0) return state;
  const event = pickOne(pool);

  return touch({
    ...state,
    activeEventId: event.id,
    events: [
      ...state.events,
      {
        eventId: event.id,
        shownAtMissionIndex: state.currentMissionIndex,
        acknowledged: false,
      },
    ],
    screen: "event",
  });
}

export function acknowledgeEvent(state: GameState): GameState {
  return touch({
    ...state,
    activeEventId: null,
    events: state.events.map((e) =>
      e.eventId === state.activeEventId ? { ...e, acknowledged: true } : e,
    ),
    screen: "mission",
  });
}

export function maybeAttachSpecial(state: GameState): GameState {
  // ~30% chance on coop/individual missions 2-8 to attach a special challenge flavor
  if (state.currentMissionIndex < 1 || state.currentMissionIndex > 7) return state;
  if (state.activeSpecialChallengeId) return state;
  if (!chance(0.28)) return state;
  const special = pickOne(SPECIAL_CHALLENGES);
  return touch({ ...state, activeSpecialChallengeId: special.id });
}

export function completeCurrentMission(
  state: GameState,
  photoId?: string,
): GameState {
  const index = state.currentMissionIndex;
  if (index < 0 || index >= TOTAL_MISSIONS) return state;
  if (state.completed.some((c) => c.index === index)) return state;

  const mission = getMissionById(state.missionIds[index]!);
  const who = getActivePlayerForMission(state);
  const points = mission.points;

  const entry: CompletedMission = {
    missionId: mission.id,
    index,
    completedAt: new Date().toISOString(),
    completedBy: who,
    pointsAwarded: points,
    photoId,
    specialChallengeId: state.activeSpecialChallengeId ?? undefined,
  };

  let players = { ...state.players };
  if (who === "both") {
    const split = Math.ceil(points / 2);
    players = {
      gabri: { ...players.gabri, score: players.gabri.score + split },
      tati: { ...players.tati, score: players.tati.score + split },
    };
  } else {
    players = {
      ...players,
      [who]: { ...players[who], score: players[who].score + points },
    };
  }

  let jointBonus = state.jointBonus;
  if (index === 9) {
    jointBonus = 5;
    players = {
      gabri: { ...players.gabri, score: players.gabri.score + jointBonus },
      tati: { ...players.tati, score: players.tati.score + jointBonus },
    };
  }

  let next: GameState = touch({
    ...state,
    players,
    completed: [...state.completed, entry],
    jointBonus,
    activeSpecialChallengeId: null,
  });

  // After completing, check color swap before advancing
  if (
    next.colorSwapAtIndex !== null &&
    !next.colorSwapTriggered &&
    index === next.colorSwapAtIndex
  ) {
    return touch({
      ...next,
      currentMissionIndex: index + 1,
      colorSwapPending: true,
      screen: "colorSwap",
    });
  }

  if (index >= 9) {
    // Prepare collage selections from photos
    const gabriIds = next.photos
      .filter((p) => p.playerId === "gabri" || p.isJoint)
      .map((p) => p.id);
    const tatiIds = next.photos
      .filter((p) => p.playerId === "tati" || p.isJoint)
      .map((p) => p.id);
    return touch({
      ...next,
      currentMissionIndex: 9,
      collage: {
        ...next.collage,
        gabriPhotoIds: gabriIds,
        tatiPhotoIds: tatiIds,
      },
      photos: next.photos.map((p) =>
        p.isJoint
          ? { ...p, selectedForGabri: true, selectedForTati: true }
          : p.playerId === "gabri"
            ? { ...p, selectedForGabri: true }
            : p.playerId === "tati"
              ? { ...p, selectedForTati: true }
              : p,
      ),
      screen: "collageGabri",
    });
  }

  next = touch({
    ...next,
    currentMissionIndex: index + 1,
    screen: "mission",
  });

  next = maybeAttachSpecial(next);
  next = maybeTriggerEvent(next);
  return next;
}

export function addPhotoMeta(
  state: GameState,
  partial: Omit<PhotoMeta, "selectedForGabri" | "selectedForTati" | "createdAt"> & {
    selectedForGabri?: boolean;
    selectedForTati?: boolean;
  },
): GameState {
  const meta: PhotoMeta = {
    ...partial,
    createdAt: new Date().toISOString(),
    selectedForGabri: partial.selectedForGabri ?? false,
    selectedForTati: partial.selectedForTati ?? false,
  };
  return touch({ ...state, photos: [...state.photos, meta] });
}

export function createPhotoId(): string {
  return uid("photo");
}

export function rivalryMessage(state: GameState): string | null {
  const g = state.players.gabri.score;
  const t = state.players.tati.score;
  const done = state.completed.length;
  if (done < 2 || done % 2 !== 0) return null;
  const diff = Math.abs(g - t);
  if (diff === 0) return "Esto está MUY igualado.";
  if (diff <= 2) return "Los dos vais demasiado bien.";
  if (g > t) return `🔥 ${state.players.gabri.name} está tomando ventaja…`;
  return `🔥 ${state.players.tati.name} está tomando ventaja…`;
}

export function getWinner(state: GameState): "gabri" | "tati" | "tie" {
  const g = state.players.gabri.score;
  const t = state.players.tati.score;
  if (g === t) return "tie";
  return g > t ? "gabri" : "tati";
}

export function discardRestaurant(state: GameState, restaurantId: string): GameState {
  if (state.discardedRestaurantIds.includes(restaurantId)) return state;
  return touch({
    ...state,
    discardedRestaurantIds: [...state.discardedRestaurantIds, restaurantId],
    restaurantId: state.restaurantId === restaurantId ? null : state.restaurantId,
  });
}

export function selectRestaurant(state: GameState, restaurantId: string): GameState {
  return touch({ ...state, restaurantId });
}
