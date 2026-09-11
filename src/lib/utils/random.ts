/** Utilidades aleatorias deterministas opcionales */

export function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickOne<T>(array: T[], random: () => number = Math.random): T {
  if (array.length === 0) throw new Error("Array vacío");
  return array[Math.floor(random() * array.length)]!;
}

export function chance(probability: number, random: () => number = Math.random): boolean {
  return random() < probability;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function todayLabel(date = new Date()): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
