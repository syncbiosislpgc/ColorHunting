export type PlayerId = "gabri" | "tati";

export type MissionType =
  | "photo"
  | "observation"
  | "creative"
  | "memory"
  | "interaction"
  | "movement"
  | "interpretation"
  | "humor"
  | "coop";

export type Difficulty = "easy" | "medium" | "hard" | "wild";

export type ColorTarget = "own" | "other" | "both" | "free";

export type MissionAudience = "individual" | "cooperative";

export interface ColorDef {
  id: string;
  name: string;
  hex: string;
  /** Approximate hue 0-360 for contrast checks */
  hue: number;
  lightness: "light" | "medium" | "dark";
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: Difficulty;
  points: 1 | 2 | 3 | 4 | 5;
  colorTarget: ColorTarget;
  requiresPhoto: boolean;
  audience: MissionAudience;
  targetPlayer?: PlayerId | "active" | "both";
  instructions: string;
  successMessage: string;
  celebrationMessage: string;
  /** If true, only used as special insert, not in random pool of 9 */
  specialOnly?: boolean;
}

export interface SpecialChallengeDef {
  id: string;
  title: string;
  description: string;
  durationHint?: string;
  instructions: string;
  successMessage: string;
}

export interface RandomEventDef {
  id: string;
  title: string;
  description: string;
  durationHint?: string;
}

export interface RestaurantDef {
  id: string;
  name: string;
  hint?: string;
}

export type CollageTemplateId =
  | "editorial"
  | "polaroid"
  | "film"
  | "instagram"
  | "scrapbook"
  | "contact"
  | "travel";

export interface CollageTemplateDef {
  id: CollageTemplateId;
  name: string;
  description: string;
}

export type PlayMode = "together" | "twoPhones";

export type ScreenId =
  | "welcome"
  | "surpriseOne"
  | "surpriseTwo"
  | "ready"
  | "whoAmI"
  | "sessionSetup"
  | "players"
  | "food"
  | "colorGabri"
  | "colorTati"
  | "briefing"
  | "mission"
  | "colorSwap"
  | "event"
  | "collageGabri"
  | "collageTati"
  | "collageJoint"
  | "collageTemplates"
  | "collageGenerate"
  | "results";

export interface PhotoMeta {
  id: string;
  missionId: string;
  missionIndex: number;
  playerId: PlayerId | "both";
  createdAt: string;
  isJoint: boolean;
  selectedForGabri: boolean;
  selectedForTati: boolean;
}

export interface CompletedMission {
  missionId: string;
  index: number;
  completedAt: string;
  completedBy: PlayerId | "both";
  pointsAwarded: number;
  photoId?: string;
  specialChallengeId?: string;
}

export interface ActiveEvent {
  eventId: string;
  shownAtMissionIndex: number;
  acknowledged: boolean;
}

export interface GameConfig {
  colorSwapEnabled: boolean;
  /** Probability 0-1 that a color swap occurs once between missions 4-7 */
  colorSwapProbability: number;
  /** Probability 0-1 per mission (1-9) to show a random event */
  eventProbability: number;
  maxEventsPerGame: number;
  includeSpecialInRandom: boolean;
  cityLabel: string;
  dateLabel: string;
  adventureTagline: string;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  initialColorId: string | null;
  currentColorId: string | null;
  score: number;
}

export interface GameState {
  version: number;
  createdAt: string;
  updatedAt: string;
  screen: ScreenId;
  players: Record<PlayerId, PlayerState>;
  /** Quién usa ESTE teléfono */
  localPlayer: PlayerId | null;
  /** together = un móvil; twoPhones = código compartido */
  playMode: PlayMode;
  sessionCode: string;
  sessionSeed: number;
  isHost: boolean;
  missionIds: string[]; // exactly 10: 9 random + final
  currentMissionIndex: number; // 0-9
  completed: CompletedMission[];
  photos: PhotoMeta[];
  colorSwapTriggered: boolean;
  colorSwapPending: boolean;
  colorSwapAtIndex: number | null;
  events: ActiveEvent[];
  restaurantId: string | null;
  discardedRestaurantIds: string[];
  jointBonus: number;
  collage: {
    gabriPhotoIds: string[];
    tatiPhotoIds: string[];
    gabriTemplate: CollageTemplateId;
    tatiTemplate: CollageTemplateId;
    gabriGenerated: boolean;
    tatiGenerated: boolean;
  };
  activeSpecialChallengeId: string | null;
  activeEventId: string | null;
  config: GameConfig;
}

export const STORAGE_KEY = "gabri-tati-adventure-v2";
export const DB_NAME = "gabri-tati-photos";
export const DB_STORE = "photos";
export const GAME_VERSION = 1;
