import { learn } from "../state.js";
export function secureObject(state, id) {
  state.securedObjects ??= [];
  if (state.securedObjects.includes(id)) return false;
  state.securedObjects.push(id);
  return true;
}
export function earnDancing(state, hits) {
  if (hits < 5) return false;
  learn(
    state,
    "dancing",
    "Skill learned: dancing. Next: the electrical-cabinet theater in Queens.",
  );
  return true;
}
export function completeEmotion(state, index) {
  if ((state.actingRound || 0) !== index || index >= 3) return false;
  state.actingRound = index + 1;
  if (state.actingRound === 3)
    learn(
      state,
      "acting",
      "Skill learned: acting. Crawl through the pipes back to Manhattan. Follow the warm light to the audition-room vent.",
    );
  return true;
}
export function discoverAccessory(state, id) {
  state.accessories ??= [];
  if (state.accessories.includes(id)) return false;
  state.accessories.push(id);
  return true;
}
