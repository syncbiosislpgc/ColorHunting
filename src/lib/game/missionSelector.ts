import { FINAL_MISSION_ID, RANDOM_MISSION_COUNT, TOTAL_MISSIONS } from "@/data/config";
import { FINAL_MISSION, getPlayableMissionPool } from "@/data/missions";
import type { Difficulty, MissionDef, MissionType } from "@/types";
import { shuffle } from "@/lib/utils/random";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "wild"];
const TYPE_PRIORITY: MissionType[] = [
  "photo",
  "observation",
  "creative",
  "coop",
  "humor",
  "interaction",
  "movement",
  "memory",
  "interpretation",
];

/**
 * Selecciona exactamente 9 misiones aleatorias con variedad de tipo/dificultad,
 * sin duplicados, y sin incluir nunca la misión final.
 */
export function selectNineRandomMissions(random: () => number = Math.random): MissionDef[] {
  const pool = getPlayableMissionPool();
  if (pool.length < RANDOM_MISSION_COUNT) {
    throw new Error(`Se necesitan al menos ${RANDOM_MISSION_COUNT} misiones en el banco`);
  }

  const selected: MissionDef[] = [];
  const usedIds = new Set<string>();
  const usedTypes = new Set<MissionType>();
  const usedDifficulties = new Set<Difficulty>();

  const tryAdd = (m: MissionDef) => {
    if (m.id === FINAL_MISSION_ID) return false;
    if (usedIds.has(m.id)) return false;
    selected.push(m);
    usedIds.add(m.id);
    usedTypes.add(m.type);
    usedDifficulties.add(m.difficulty);
    return true;
  };

  // 1) Garantizar variedad de tipos clave
  for (const type of TYPE_PRIORITY) {
    if (selected.length >= RANDOM_MISSION_COUNT) break;
    const candidates = shuffle(
      pool.filter((m) => m.type === type && !usedIds.has(m.id)),
      random,
    );
    if (candidates[0]) tryAdd(candidates[0]);
  }

  // 2) Garantizar mezcla de dificultades
  for (const diff of DIFFICULTY_ORDER) {
    if (selected.length >= RANDOM_MISSION_COUNT) break;
    if (usedDifficulties.has(diff)) continue;
    const candidates = shuffle(
      pool.filter((m) => m.difficulty === diff && !usedIds.has(m.id)),
      random,
    );
    if (candidates[0]) tryAdd(candidates[0]);
  }

  // 3) Preferir al menos 4 con foto (casi todas la requieren, pero reforzamos)
  const photoCount = selected.filter((m) => m.requiresPhoto).length;
  if (photoCount < 4) {
    const more = shuffle(
      pool.filter((m) => m.requiresPhoto && !usedIds.has(m.id)),
      random,
    );
    for (const m of more) {
      if (selected.length >= RANDOM_MISSION_COUNT) break;
      tryAdd(m);
    }
  }

  // 4) Rellenar resto aleatorio
  const remaining = shuffle(
    pool.filter((m) => !usedIds.has(m.id)),
    random,
  );
  for (const m of remaining) {
    if (selected.length >= RANDOM_MISSION_COUNT) break;
    tryAdd(m);
  }

  if (selected.length !== RANDOM_MISSION_COUNT) {
    throw new Error("No se pudieron seleccionar exactamente 9 misiones");
  }

  // Mezcla final del orden de aparición
  return shuffle(selected, random);
}

/** Construye exactamente 10 pruebas: 9 aleatorias + final fija. */
export function buildMissionDeck(random: () => number = Math.random): string[] {
  const nine = selectNineRandomMissions(random);
  const ids = [...nine.map((m) => m.id), FINAL_MISSION.id];
  if (ids.length !== TOTAL_MISSIONS) {
    throw new Error("El mazo debe tener exactamente 10 pruebas");
  }
  if (ids[ids.length - 1] !== FINAL_MISSION_ID) {
    throw new Error("La prueba 10 debe ser siempre la foto conjunta");
  }
  if (ids.slice(0, 9).includes(FINAL_MISSION_ID)) {
    throw new Error("La foto conjunta no puede aparecer entre las 9 aleatorias");
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error("Hay misiones duplicadas en el mazo");
  }
  return ids;
}
