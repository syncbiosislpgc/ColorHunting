/**
 * Smoke tests for mission deck and color contrast.
 * Run: npx tsx scripts/verify-game.ts
 */
import assert from "node:assert/strict";
import { FINAL_MISSION_ID, RANDOM_MISSION_COUNT, TOTAL_MISSIONS } from "../src/data/config";
import { getPlayableMissionPool, MISSIONS } from "../src/data/missions";
import { SPECIAL_CHALLENGES } from "../src/data/specialChallenges";
import { RANDOM_EVENTS } from "../src/data/events";
import { colorsHaveEnoughContrast, pickContrastingPair } from "../src/lib/game/colorContrast";
import { buildMissionDeck, selectNineRandomMissions } from "../src/lib/game/missionSelector";
import { createFreshGame, completeCurrentMission, applyColorSwap } from "../src/lib/game/engine";

assert.ok(MISSIONS.length >= 35, `Se esperaban ≥35 misiones, hay ${MISSIONS.length}`);
assert.ok(SPECIAL_CHALLENGES.length >= 15, `Se esperaban ≥15 retos especiales`);
assert.ok(RANDOM_EVENTS.length >= 10, `Se esperaban ≥10 eventos`);
assert.equal(getPlayableMissionPool().length, MISSIONS.filter((m) => !m.specialOnly).length);

for (let i = 0; i < 40; i++) {
  const nine = selectNineRandomMissions(() => Math.random());
  assert.equal(nine.length, RANDOM_MISSION_COUNT);
  assert.equal(new Set(nine.map((m) => m.id)).size, RANDOM_MISSION_COUNT);
  assert.ok(!nine.some((m) => m.id === FINAL_MISSION_ID));

  const deck = buildMissionDeck(() => Math.random());
  assert.equal(deck.length, TOTAL_MISSIONS);
  assert.equal(deck[9], FINAL_MISSION_ID);
  assert.ok(!deck.slice(0, 9).includes(FINAL_MISSION_ID));
}

for (let i = 0; i < 30; i++) {
  const [a, b] = pickContrastingPair();
  assert.ok(colorsHaveEnoughContrast(a, b), `${a.id} vs ${b.id}`);
}

let game = createFreshGame();
assert.equal(game.missionIds.length, 10);
assert.equal(game.missionIds[9], FINAL_MISSION_ID);

// Force a color swap mid-run and ensure mission count stays 10
game = { ...game, colorSwapAtIndex: 3, colorSwapTriggered: false };
for (let i = 0; i <= 3; i++) {
  game = completeCurrentMission(game);
}
assert.equal(game.screen, "colorSwap");
assert.equal(game.missionIds.length, 10);
assert.equal(game.currentMissionIndex, 4);
const beforeIds = [...game.missionIds];
game = applyColorSwap(game);
assert.equal(game.colorSwapTriggered, true);
assert.deepEqual(game.missionIds, beforeIds);
assert.equal(game.completed.length, 4);

console.log("✓ verify-game: OK");
console.log(`  misiones banco: ${MISSIONS.length}`);
console.log(`  especiales: ${SPECIAL_CHALLENGES.length}`);
console.log(`  eventos: ${RANDOM_EVENTS.length}`);
