import type { RandomEventDef } from "@/types";

export const RANDOM_EVENTS: RandomEventDef[] = [
  {
    id: "no-color-word",
    title: "PALABRA PROHIBIDA",
    description: "Durante los próximos 5 minutos, no podéis utilizar la palabra “color”.",
    durationHint: "5 min",
  },
  {
    id: "ambos-colores",
    title: "DOBLE BÚSQUEDA",
    description: "Tenéis 3 minutos para encontrar algo de ambos colores.",
    durationHint: "3 min",
  },
  {
    id: "creativa-extra",
    title: "PUNTOS CREATIVOS",
    description: "Durante esta ronda, la foto más creativa gana puntos extra.",
  },
  {
    id: "cambio-roles",
    title: "CAMBIO DE ROLES",
    description: "Durante esta misión tenéis que ayudaros el uno al otro.",
  },
  {
    id: "fotos-abajo",
    title: "ÁNGULO BAJO",
    description: "Durante los próximos minutos, solo podéis hacer fotos desde abajo.",
    durationHint: "unos minutos",
  },
  {
    id: "elige-encuadre",
    title: "DIRECTOR/A",
    description: "Durante esta prueba, la persona que no tenga la misión debe elegir el encuadre.",
  },
  {
    id: "sin-zoom",
    title: "SIN ZOOM",
    description: "Esta foto hay que hacerla sin acercaros demasiado. Composición a distancia.",
  },
  {
    id: "una-toma",
    title: "UNA SOLA TOMA",
    description: "Solo una foto. Sin repetir. Elegid bien.",
  },
  {
    id: "narrador",
    title: "NARRADOR",
    description: "Mientras buscáis, uno narra en voz alta como si fuera un documental.",
  },
  {
    id: "mano-izquierda",
    title: "MANO TORPE",
    description: "La foto de esta ronda debe hacerse con la mano no dominante.",
  },
  {
    id: "sonrisa-obligatoria",
    title: "SONRISA OBLIGATORIA",
    description: "En esta foto, los dos tenéis que salir sonriendo. Sin excepciones.",
  },
  {
    id: "cuenta-atras",
    title: "CUENTA ATRÁS",
    description: "Tenéis 90 segundos para encontrar algo interesante y fotografiarlo.",
    durationHint: "90 s",
  },
];

export function getEventById(id: string): RandomEventDef {
  const found = RANDOM_EVENTS.find((e) => e.id === id);
  if (!found) throw new Error(`Evento no encontrado: ${id}`);
  return found;
}
