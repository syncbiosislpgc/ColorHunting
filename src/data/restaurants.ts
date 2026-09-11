import type { RestaurantDef } from "@/types";

/** Lista fija de sitios — no añadir otros sin pedirselo a Gabri & Tati */
export function getRestaurantByIdSafe(id: string): RestaurantDef | null {
  return RESTAURANTS.find((r) => r.id === id) ?? null;
}

export const RESTAURANTS: RestaurantDef[] = [
  { id: "goiko", name: "Goiko", hint: "Hamburguesita rica" },
  { id: "kfc", name: "KFC", hint: "Pollo crujiente" },
  { id: "turca", name: "Turca", hint: "Döner / turca" },
  { id: "mcdonalds", name: "McDonald’s", hint: "Clásico" },
  { id: "splits", name: "El Splits", hint: "El de siempre" },
  { id: "kebab", name: "Kebab", hint: "El kebab de la zona" },
  { id: "scooter", name: "Scooter", hint: "Plan scooter" },
];
