import { COLORS } from "@/data/colors";
import type { ColorDef } from "@/types";
import { pickOne, shuffle } from "@/lib/utils/random";

/** Diferencia circular de matiz (0-180) */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Contraste suficiente entre dos colores de la paleta.
 * Evita pares muy cercanos en matiz y pares problemáticos blanco/gris/negro entre sí.
 */
export function colorsHaveEnoughContrast(a: ColorDef, b: ColorDef): boolean {
  if (a.id === b.id) return false;

  const neutrals = new Set(["blanco", "negro", "gris"]);
  if (neutrals.has(a.id) && neutrals.has(b.id)) {
    // blanco+negro ok; gris con cualquiera de los otros neutrales no
    const pair = new Set([a.id, b.id]);
    if (pair.has("gris")) return false;
    return pair.has("blanco") && pair.has("negro");
  }

  // Pares cálidos muy cercanos
  const warmClose = [
    ["coral", "rojo"],
    ["coral", "naranja"],
    ["naranja", "amarillo"],
    ["rojo", "rosa"],
    ["rosa", "coral"],
    ["azul", "turquesa"],
    ["verde", "turquesa"],
    ["morado", "rosa"],
  ];
  for (const [x, y] of warmClose) {
    if ((a.id === x && b.id === y) || (a.id === y && b.id === x)) return false;
  }

  if (!neutrals.has(a.id) && !neutrals.has(b.id)) {
    if (hueDistance(a.hue, b.hue) < 45) return false;
  }

  return true;
}

export function pickContrastingPair(
  excludeIds: string[] = [],
  random: () => number = Math.random,
): [ColorDef, ColorDef] {
  const pool = COLORS.filter((c) => !excludeIds.includes(c.id));
  const shuffled = shuffle(pool, random);

  for (let i = 0; i < shuffled.length; i++) {
    for (let j = i + 1; j < shuffled.length; j++) {
      const a = shuffled[i]!;
      const b = shuffled[j]!;
      if (colorsHaveEnoughContrast(a, b)) {
        return random() < 0.5 ? [a, b] : [b, a];
      }
    }
  }

  // Fallback extremo
  const coral = COLORS.find((c) => c.id === "coral")!;
  const azul = COLORS.find((c) => c.id === "azul")!;
  return [coral, azul];
}

export function pickColorForSecondPlayer(
  first: ColorDef,
  excludeIds: string[] = [],
  random: () => number = Math.random,
): ColorDef {
  const candidates = shuffle(
    COLORS.filter((c) => c.id !== first.id && !excludeIds.includes(c.id) && colorsHaveEnoughContrast(first, c)),
    random,
  );
  if (candidates.length > 0) return pickOne(candidates, random);
  const [, second] = pickContrastingPair([first.id, ...excludeIds], random);
  return second;
}
