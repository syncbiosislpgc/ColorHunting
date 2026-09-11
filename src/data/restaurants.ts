import type { RestaurantDef } from "@/types";

/** Opciones de Las Arenas — fácil de ampliar */
export function getRestaurantByIdSafe(id: string): RestaurantDef | null {
  return RESTAURANTS.find((r) => r.id === id) ?? null;
}

export const RESTAURANTS: RestaurantDef[] = [
  { id: "goiko", name: "Goiko", hint: "Hamburguesa premium" },
  { id: "kfc", name: "KFC", hint: "Pollo crujiente" },
  { id: "tgb", name: "TGB", hint: "The Good Burger" },
  { id: "mcdonalds", name: "McDonald’s", hint: "Clásico rápido" },
  { id: "montaditos", name: "100 Montaditos", hint: "Para picar" },
  { id: "burger-king", name: "Burger King", hint: "A la parrilla" },
  { id: "subway", name: "Subway", hint: "Bocatas a medida" },
  { id: "pizzahut", name: "Pizza Hut", hint: "Masa y queso" },
];
