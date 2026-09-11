import type { GameConfig } from "@/types";

export const DEFAULT_PLAYER_NAMES = {
  gabri: "Gabri",
  tati: "Tati",
} as const;

export const DEFAULT_CONFIG: GameConfig = {
  colorSwapEnabled: true,
  colorSwapProbability: 0.55,
  eventProbability: 0.22,
  maxEventsPerGame: 2,
  includeSpecialInRandom: true,
  cityLabel: "Las Palmas de Gran Canaria",
  dateLabel: "", // se rellena al iniciar
  adventureTagline: "Una tarde para dos",
};

/** Índice de misión (0-based) tras el cual puede aparecer el cambio: tras completar 3..6 → antes de 4..7 */
export const COLOR_SWAP_MIN_INDEX = 3; // after mission 4 (index 3) completed → show before next
export const COLOR_SWAP_MAX_INDEX = 6; // up to before mission 7 (index 6)

export const FINAL_MISSION_ID = "final-joint-photo";

export const TOTAL_MISSIONS = 10;
export const RANDOM_MISSION_COUNT = 9;
