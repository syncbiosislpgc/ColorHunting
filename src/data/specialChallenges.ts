import type { SpecialChallengeDef } from "@/types";

export const SPECIAL_CHALLENGES: SpecialChallengeDef[] = [
  {
    id: "intercambio",
    title: "INTERCAMBIO",
    description: "Durante los próximos minutos, tienes que ayudar al otro a completar su misión.",
    durationHint: "≈ 10 min",
    instructions: "Cambia de rol: tú buscas para el otro.",
    successMessage: "Equipo activado.",
  },
  {
    id: "silencio",
    title: "SILENCIO",
    description: "Durante 3 minutos no podéis hablar mientras buscáis algo.",
    durationHint: "3 min",
    instructions: "Solo gestos. Solo miradas. Solo fotos.",
    successMessage: "Silencio cómplice.",
  },
  {
    id: "exploradores",
    title: "EXPLORADORES",
    description: "Caminad hasta encontrar un lugar donde ninguno de los dos haya estado antes.",
    instructions: "Calle nueva. Esquina nueva. Mundo nuevo.",
    successMessage: "Territorio descubierto.",
  },
  {
    id: "personaje",
    title: "PERSONAJE",
    description: "Durante 5 minutos uno de los dos debe actuar como guía turístico del otro.",
    durationHint: "5 min",
    instructions: "Inventad historias absurdas sobre lo que veáis.",
    successMessage: "Tour legendario.",
  },
  {
    id: "memoria-viaje",
    title: "MEMORIA",
    description: "Encontrad algo que os recuerde a un viaje que hayáis hecho juntos.",
    instructions: "Un detalle. Un olor. Una forma. Un déjà vu.",
    successMessage: "Maleta emocional abierta.",
  },
  {
    id: "recuerdo-etapa",
    title: "RECUERDO",
    description: "Haced una foto de algo que os recuerde a una etapa de vuestra relación.",
    instructions: "Sin explicar demasiado. La foto habla.",
    successMessage: "Capítulo guardado.",
  },
  {
    id: "caos",
    title: "CAOS",
    description: "Durante 5 minutos cualquier foto de vuestro color es válida.",
    durationHint: "5 min",
    instructions: "Sin reglas. Solo ritmo. Disparad.",
    successMessage: "Caos productivo.",
  },
  {
    id: "espejo",
    title: "ESPEJO",
    description: "Uno hace una pose. El otro la copia exactamente. Foto del dúo.",
    instructions: "Sincronía total. Como un espejo humano.",
    successMessage: "Clonación exitosa.",
  },
  {
    id: "pista-ciega",
    title: "PISTA CIEGA",
    description: "Uno cierra los ojos. El otro guía hasta un objeto interesante. Foto juntos.",
    instructions: "Confianza. Cuidado. Sorpresa al abrir los ojos.",
    successMessage: "Confianza nivel élite.",
  },
  {
    id: "titulo-pelicula",
    title: "TÍTULO DE PELÍCULA",
    description: "Inventad el título de una película sobre esta tarde y fotografiáis el cartel imaginario.",
    instructions: "El título va en la cabeza. La foto es el póster.",
    successMessage: "Estreno mundial.",
  },
  {
    id: "minuto-lento",
    title: "MINUTO LENTO",
    description: "Caminad muy despacio durante un minuto y fotografiáis lo que normalmente pasaríais por alto.",
    durationHint: "1 min",
    instructions: "Cámara lenta humana.",
    successMessage: "Detalle rescatado.",
  },
  {
    id: "duelo-gestos",
    title: "DUELO DE GESTOS",
    description: "Comunicad una misión secreta solo con gestos. El otro tiene que acertar y fotografiarlo.",
    instructions: "Charadas de cita.",
    successMessage: "Mensaje recibido.",
  },
  {
    id: "cambio-perspectiva",
    title: "CAMBIO DE PERSPECTIVA",
    description: "Durante esta ronda, solo podéis hacer fotos desde una altura inusual.",
    instructions: "Desde el suelo, desde arriba, desde el lateral…",
    successMessage: "Ángulo nuevo.",
  },
  {
    id: "historia-30s",
    title: "HISTORIA EN 30s",
    description: "Contad una mini historia de 30 segundos sobre un objeto y luego fotografiadlo.",
    durationHint: "30 s",
    instructions: "Narración + captura.",
    successMessage: "Cuento cerrado.",
  },
  {
    id: "reto-elegante",
    title: "RETO ELEGANTE",
    description: "Haced la foto más elegante posible con lo que tengáis a mano.",
    instructions: "Postura, luz, actitud. Modo editorial.",
    successMessage: "Portada lista.",
  },
  {
    id: "sos",
    title: "S.O.S.",
    description: "Pedid una recomendación a un desconocido amable y fotografiáis su consejo (con respeto).",
    instructions: "Una pregunta corta. Una respuesta. Una foto.",
    successMessage: "Ayuda local.",
  },
];

export function getSpecialById(id: string): SpecialChallengeDef {
  const found = SPECIAL_CHALLENGES.find((s) => s.id === id);
  if (!found) throw new Error(`Reto especial no encontrado: ${id}`);
  return found;
}
