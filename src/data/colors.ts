import type { ColorDef } from "@/types";

export const COLORS: ColorDef[] = [
  { id: "coral", name: "Coral", hex: "#FF6F61", hue: 6, lightness: "medium" },
  { id: "naranja", name: "Naranja", hex: "#FF8A3D", hue: 24, lightness: "medium" },
  { id: "amarillo", name: "Amarillo", hex: "#F5C518", hue: 48, lightness: "light" },
  { id: "verde", name: "Verde", hex: "#2BB673", hue: 148, lightness: "medium" },
  { id: "turquesa", name: "Turquesa", hex: "#2EC4B6", hue: 174, lightness: "medium" },
  { id: "azul", name: "Azul", hex: "#2F6FED", hue: 220, lightness: "medium" },
  { id: "morado", name: "Morado", hex: "#7B5EA7", hue: 268, lightness: "medium" },
  { id: "rosa", name: "Rosa", hex: "#F06292", hue: 340, lightness: "medium" },
  { id: "rojo", name: "Rojo", hex: "#E53935", hue: 2, lightness: "medium" },
  { id: "marron", name: "Marrón", hex: "#8D6E63", hue: 16, lightness: "dark" },
  { id: "blanco", name: "Blanco", hex: "#F7F4EF", hue: 40, lightness: "light" },
  { id: "negro", name: "Negro", hex: "#1A1A1A", hue: 0, lightness: "dark" },
  { id: "gris", name: "Gris", hex: "#9AA0A6", hue: 210, lightness: "medium" },
];

export function getColorById(id: string): ColorDef {
  const found = COLORS.find((c) => c.id === id);
  if (!found) throw new Error(`Color no encontrado: ${id}`);
  return found;
}
