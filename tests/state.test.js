import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  collectPizza,
  learn,
  releaseAction,
  dropItem,
  save,
  load,
} from "../src/state.js";
import { SCENES, MOVEMENT } from "../src/data/config.js";
test("upward release jumps and ordinary release stops", () => {
  assert.equal(releaseAction({ y: 500 }, { y: 430 }, 65), "jump");
  assert.equal(releaseAction({ y: 500 }, { y: 460 }, 65), "stop");
  assert.equal(releaseAction({ y: 500 }, { y: 550 }, 65), "stop");
});
test("collection and story rewards remain unique after reload", () => {
  const s = fresh("Pip", "Gray");
  collectPizza(s);
  collectPizza(s);
  learn(s, "audition", "goal");
  learn(s, "audition", "goal");
  const storage = {
    value: null,
    setItem(k, v) {
      this.value = v;
    },
    getItem() {
      return this.value;
    },
  };
  save(s, storage);
  const restored = load(storage);
  assert.equal(collectPizza(restored), false);
  assert.equal(learn(restored, "audition", "goal"), false);
  assert.deepEqual(restored.inventory, ["pizza"]);
  assert.deepEqual(restored.journal, ["goal"]);
});
test("invalid drops preserve inventory", () => {
  const s = fresh("Pip", "Gray");
  collectPizza(s);
  assert.equal(dropItem(s, "pizza", null).accepted, false);
  assert.deepEqual(s.inventory, ["pizza"]);
});
test("every save scene has a safe authored spawn and all transitions resolve", () => {
  for (const scene of Object.values(SCENES)) {
    assert.equal(scene.spawn.length, 2);
    if (scene.next) assert.ok(SCENES[scene.next]);
  }
  assert.ok(MOVEMENT.jump ** 2 / (2 * MOVEMENT.gravity) > 80);
});

import { validObjectClick } from "../src/interaction.js";
test("world release over billboard never opens dialogue without a matching press", () => {
  const billboard = {},
    other = {};
  const pointer = { id: 0, x: 600, y: 300 };
  assert.equal(validObjectClick(null, billboard, pointer, false), false);
  assert.equal(
    validObjectClick(
      { target: other, pointerId: 0, x: 600, y: 300 },
      billboard,
      pointer,
      false,
    ),
    false,
  );
  assert.equal(
    validObjectClick(
      { target: billboard, pointerId: 0, x: 600, y: 500 },
      billboard,
      pointer,
      false,
    ),
    false,
  );
  assert.equal(
    validObjectClick(
      { target: billboard, pointerId: 0, x: 600, y: 300 },
      billboard,
      pointer,
      true,
    ),
    false,
  );
  assert.equal(
    validObjectClick(
      { target: billboard, pointerId: 0, x: 600, y: 300 },
      billboard,
      pointer,
      false,
    ),
    true,
  );
});

import { jumpVelocity } from "../src/input/Movement.js";
test("upward jumps stay vertical near the rat and cap horizontal launch speed", () => {
  assert.equal(jumpVelocity(0), 0);
  assert.equal(jumpVelocity(MOVEMENT.jumpDeadzone - 1), 0);
  assert.equal(jumpVelocity(500), MOVEMENT.speed);
  assert.equal(jumpVelocity(-500), -MOVEMENT.speed);
  assert.ok(jumpVelocity(60) > 0 && jumpVelocity(60) < MOVEMENT.speed);
});

test("long object holds cannot masquerade as a click", () => {
  const target = {},
    press = { target, pointerId: 0, x: 10, y: 20, startedAt: 100 };
  const pointer = { id: 0, x: 10, y: 20 };
  assert.equal(validObjectClick(press, target, pointer, false, 250), true);
  assert.equal(validObjectClick(press, target, pointer, false, 700), false);
});

test("blocked browser storage cannot crash load or save", () => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() { throw new Error("Storage blocked"); },
  });
  try {
    assert.equal(load(), null);
    assert.equal(save(fresh("Pip", "Gray")), false);
  } finally {
    if (prior) Object.defineProperty(globalThis, "localStorage", prior);
    else delete globalThis.localStorage;
  }
});

test("malformed saves cannot offer a crashing Continue route", () => {
  for (const patch of [
    { name: 42 }, { scene: "missing-scene" }, { fur: "missing-fur" },
    { flags: [] }, { journal: [42] }, { inventory: [null] },
    { visited: "queens" }, { accessories: {} }, { equippedAccessories: {} },
    { securedObjects: "crate" }, { outfit: [] },
    { singingRound: -1 }, { actingRound: 8 },
  ]) {
    const storage = { getItem: () => JSON.stringify({ ...fresh("Pip", "Gray"), ...patch }) };
    assert.equal(load(storage), null, JSON.stringify(patch));
  }
});
