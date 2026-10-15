import test from "node:test";
import assert from "node:assert/strict";
import { fresh, save, load } from "../src/state.js";
import {
  collectBread,
  giveFood,
  lessonRound,
  completeRound,
  awardTicket,
} from "../src/chapters/brooklyn-state.js";
import { SINGING } from "../src/data/brooklyn.js";
test("old saves require no migration and fixed melodies have 3/4/5 notes", () => {
  const s = fresh("Pip", "Gray");
  assert.equal(lessonRound(s), 0);
  assert.deepEqual(
    SINGING.melodies.map((m) => m.length),
    [3, 4, 5],
  );
  assert.ok(SINGING.melodies.flat().every((n) => n >= 0 && n < 4));
});
test("either food is accepted once, only intended food is consumed", () => {
  for (const food of ["pizza", "bread"]) {
    const s = fresh("Pip", "Gray");
    s.inventory = [food, "newspaper", "ticket"];
    assert.equal(giveFood(s, "newspaper", "busker"), false);
    assert.equal(giveFood(s, food, "other"), false);
    assert.equal(giveFood(s, food, "busker"), true);
    assert.deepEqual(s.inventory, ["newspaper", "ticket"]);
    s.inventory.push(food);
    assert.equal(giveFood(s, food, "busker"), false);
    assert.ok(s.inventory.includes(food));
  }
});
test("bread fallback is unique across reload and round/ticket checkpoints persist", () => {
  const s = fresh("Pip", "Gray");
  assert.equal(collectBread(s), true);
  assert.equal(collectBread(s), false);
  giveFood(s, "bread", "busker");
  assert.equal(awardTicket(s), false);
  assert.equal(completeRound(s, 1), false);
  assert.equal(completeRound(s, 0), true);
  assert.equal(completeRound(s, 0), false);
  const store = {
    value: null,
    setItem(k, v) {
      this.value = v;
    },
    getItem() {
      return this.value;
    },
  };
  save(s, store);
  const r = load(store);
  assert.equal(lessonRound(r), 1);
  assert.equal(collectBread(r), false);
  completeRound(r, 1);
  completeRound(r, 2);
  assert.ok(r.flags.singing);
  assert.equal(awardTicket(r), true);
  assert.equal(awardTicket(r), false);
  assert.equal(r.inventory.filter((i) => i === "ticket").length, 1);
  assert.equal(r.journal.filter((j) => j.includes("Skill learned")).length, 1);
});
