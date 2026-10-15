// Pure save operations: flags remain compatible with the existing version-1 save.
import { learn, dropItem } from "../state.js";
export function collectBread(state) {
  if (state.flags.breadPacked) return false;
  state.flags.breadPacked = true;
  if (!state.inventory.includes("bread")) state.inventory.push("bread");
  return true;
}
export function giveFood(state, item, target) {
  return dropItem(state, item, target).accepted;
}
export function lessonRound(state) {
  return Math.max(
    0,
    Math.min(3, Number.isInteger(state.singingRound) ? state.singingRound : 0),
  );
}
export function completeRound(state, round) {
  if (!state.flags.buskerFed || lessonRound(state) !== round || round >= 3)
    return false;
  state.singingRound = round + 1;
  if (state.singingRound === 3)
    learn(state, "singing", "Skill learned: singing.");
  return true;
}
export function awardTicket(state) {
  if (!state.flags.singing || state.flags.ferryTicketAwarded) return false;
  state.flags.ferryTicketAwarded = true;
  if (!state.inventory.includes("ticket")) state.inventory.push("ticket");
  learn(
    state,
    "ferryLead",
    "Ferry ticket received. Note on the back: “Ask for the rat with the mop.” Follow the ferry boarding passage at the right of the Brooklyn alcove.",
  );
  return true;
}
