import type { PlayerId } from "@/types";

export function missionLoveLine(player: PlayerId, name: string): string {
  if (player === "gabri") {
    return `Gabri, enseña tu mirada 💕 ${name}, esto es tuyo.`;
  }
  return `Tati, captura tu momentito 💗 ${name}, con todo el cariño.`;
}

export function photoReadyLine(player: PlayerId, name: string): string {
  if (player === "gabri") {
    return `Foto de ${name} guardada con amor 💘`;
  }
  return `Foto de ${name} guardadita en el corazón 💞`;
}

export function continueLoveLine(ready: boolean): string {
  if (ready) return "Qué monada… seguimos 💫";
  return "Subid las fotitos y seguimos juntitos 💌";
}

export function jointLoveLine(): string {
  return "Ahora la foto de los dos. Un abrazo con cámara 🥰❤️";
}

export function whoAmILove(player: PlayerId): string {
  return player === "gabri"
    ? "Hola, Gabri 💙 Hoy el móvil es tuyo."
    : "Hola, Tati 💖 Hoy el móvil es tuyo.";
}
