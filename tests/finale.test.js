import test from "node:test";
import assert from "node:assert/strict";
import { fresh } from "../src/state.js";
import {
  secureObject,
  earnDancing,
  completeEmotion,
  discoverAccessory,
} from "../src/chapters/finale-state.js";
import { DANCE, COSTUMES, EMOTIONS } from "../src/data/finale.js";
test("three secured objects and accessories stay unique", () => {
  const s = fresh("Pip", "Gray");
  assert.equal(secureObject(s, "bolt"), true);
  assert.equal(secureObject(s, "bolt"), false);
  assert.equal(discoverAccessory(s, "glasses"), true);
  assert.equal(discoverAccessory(s, "glasses"), false);
});
test("dance requires five of eight and awards only one skill entry", () => {
  const s = fresh("Pip", "Gray");
  assert.equal(DANCE.cues.length, 8);
  assert.equal(earnDancing(s, 4), false);
  assert.equal(earnDancing(s, 5), true);
  earnDancing(s, 8);
  assert.equal(s.journal.length, 1);
});
test("all nine costumes are free choices, emotion progress checkpoints independently", () => {
  assert.equal(Object.values(COSTUMES).flat().length, 9);
  const s = fresh("Pip", "Gray");
  assert.equal(completeEmotion(s, 1), false);
  for (let i = 0; i < 3; i++) {
    assert.ok(EMOTIONS[i].choices[EMOTIONS[i].correct]);
    assert.equal(completeEmotion(s, i), true);
  }
  assert.ok(s.flags.acting);
  assert.equal(completeEmotion(s, 2), false);
});
