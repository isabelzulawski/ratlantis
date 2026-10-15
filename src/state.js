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
export function load(storage = localStorage) {
  try {
    const s = JSON.parse(storage.getItem(SAVE_KEY));
    return s?.version === 1 &&
      s.name &&
      s.fur &&
      Array.isArray(s.inventory) &&
      s.flags &&
      Array.isArray(s.journal)
      ? s
      : null;
  } catch {
    return null;
  }
}
export function save(state, storage = localStorage) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
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
