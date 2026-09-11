import type { GameState } from "@/types";
import { STORAGE_KEY } from "@/types";

const NAMES_KEY = "gabri-tati-names-v1";

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.missionIds || parsed.missionIds.length !== 10) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("No se pudo guardar el estado", e);
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function loadSavedNames(): { gabri: string; tati: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(NAMES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { gabri: string; tati: string };
  } catch {
    return null;
  }
}

export function saveNames(names: { gabri: string; tati: string }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
}

export function hasSavedGame(): boolean {
  return loadGameState() !== null;
}
