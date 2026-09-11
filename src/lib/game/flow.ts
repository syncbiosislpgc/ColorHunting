import type { GameState, PlayerId, ScreenId } from "@/types";

export function colorScreenForPlayer(player: PlayerId): ScreenId {
  return player === "gabri" ? "colorGabri" : "colorTati";
}

/** Tras la comida: en dos móviles solo la ruleta del jugador local. */
export function nextScreenAfterFood(state: GameState): ScreenId {
  if (state.playMode === "twoPhones" && state.localPlayer) {
    return colorScreenForPlayer(state.localPlayer);
  }
  return "colorGabri";
}

/** Tras el color: en dos móviles no se encadena la ruleta del otro. */
export function nextScreenAfterColor(state: GameState, player: PlayerId): ScreenId {
  if (state.playMode === "twoPhones") {
    return "briefing";
  }
  return player === "gabri" ? "colorTati" : "briefing";
}
