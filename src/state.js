import { FURS, SCENES } from "./data/config.js";

export const SAVE_KEY = "ratlantis-opening-v1";
export function fresh(name, fur) {
  return {
    version: 1,
    name,
    fur,
    scene: "street",
    inventory: [],
    flags: {},
    journal: [],
    sound: false,
  };
}
export function collectPizza(state) {
  if (state.flags.pizzaPacked) return false;
  state.flags.pizzaPacked = true;
  state.inventory.push("pizza");
  return true;
}
export function collectNewspaper(state) {
  if (state.flags.newspaperReceived) return false;
  state.flags.newspaperReceived = true;
  if (!state.inventory.includes("newspaper")) state.inventory.push("newspaper");
  return true;
}
export function learn(state, flag, text) {
  if (state.flags[flag]) return false;
  state.flags[flag] = true;
  state.journal.push(text);
  return true;
}
const stringList = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
export function load(storage) {
  try {
    // Accessing localStorage itself can throw when browser storage is blocked.
    const store = storage ?? globalThis.localStorage;
    const s = JSON.parse(store.getItem(SAVE_KEY));
    if (
      !s || s.version !== 1 || typeof s.name !== "string" || !s.name.trim() ||
      !Object.hasOwn(FURS, s.fur) || !Object.hasOwn(SCENES, s.scene) ||
      !stringList(s.inventory) || !record(s.flags) || !stringList(s.journal)
    ) return null;
    for (const key of ["visited", "accessories", "equippedAccessories", "securedObjects"])
      if (s[key] !== undefined && !stringList(s[key])) return null;
    if (s.outfit !== undefined && !record(s.outfit)) return null;
    for (const key of ["singingRound", "actingRound"])
      if (s[key] !== undefined && (!Number.isInteger(s[key]) || s[key] < 0 || s[key] > 3)) return null;
    return s;
  } catch {
    return null;
  }
}
export function save(state, storage) {
  try {
    const store = storage ?? globalThis.localStorage;
    store.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
export function releaseAction(player, pointer, threshold) {
  return player.y - pointer.y >= threshold ? "jump" : "stop";
}
export function dropItem(state, item, target) {
  const accepted =
    target === "busker" &&
    !state.flags.buskerFed &&
    ["pizza", "bread"].includes(item) &&
    state.inventory.includes(item);
  if (accepted) {
    state.inventory.splice(state.inventory.indexOf(item), 1);
    state.flags.buskerFed = true;
    state.singingRound = 0;
  }
  return { accepted, item, target, inventory: state.inventory };
}
