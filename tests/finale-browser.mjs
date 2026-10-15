import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const url = process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage({ viewport: { width: 1200, height: 675 } }),
  errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.addInitScript(() => {
  if (!localStorage.getItem("ratlantis-opening-v1"))
    localStorage.setItem(
      "ratlantis-opening-v1",
      JSON.stringify({
        version: 1,
        name: "Pip",
        fur: "Gray",
        scene: "brooklyn",
        inventory: ["ticket", "newspaper"],
        flags: { singing: true, buskerFed: true, ferryTicketAwarded: true },
        journal: [],
        sound: false,
      }),
    );
});
await p.goto(url);
await p.locator("#continue").click();
await p.waitForTimeout(500);
const at = async (x, y = 485) => {
  await p.evaluate(
    ({ x, y }) => {
      ratlantis.player.setPosition(x, y);
      ratlantis.player.body.setVelocity(0);
      ratlantis.cameras.main.setScroll(
        Math.max(0, Math.min(ratlantis.def.width - 1200, x - 600)),
        0,
      );
    },
    { x, y },
  );
  await p.waitForTimeout(350);
};
const click = async (x, y) => {
  const xy = await p.evaluate(
    ({ x, y }) => ({ x: x - ratlantis.cameras.main.scrollX, y }),
    { x, y },
  );
  await p.mouse.click(xy.x, xy.y);
};
await at(1450);
await click(1540, 500);
await p.waitForTimeout(500);
assert.equal(await p.evaluate(() => ratlantis.id), "ferry");
await at(850);
await p.screenshot({ path: "tests/ferry-final.png" });
assert.equal(await p.evaluate(() => ratlantis.deckObjects?.length || 0), 0);
assert.equal(await p.evaluate(() => !!ratlantis.storage), false);
await p.reload();
await p.locator("#continue").click();
await at(800);
await click(790, 490);
assert.match(await p.locator(".speech").innerText(), /THIS FERRY HAS ALWAYS HAD GREAT RHYTHM/i);
await p.getByRole("button", { name: "I’m not so sure...", exact: true }).click();
assert.equal(await p.locator(".speech").count(), 0);
await p.waitForTimeout(250);
await click(790, 490);
await p.getByRole("button", { name: "I guess so", exact: true }).click();
assert.equal(await p.locator(".dance-panel h2").textContent(), "Find the rhythm of the sea");
await p.waitForFunction(() => ratlantis.finale.dance?.practice === true);
await p.screenshot({ path: "tests/dance-final.png" });
async function play(hits) {
  for (let i = 0; i < hits; i++) {
    await p.waitForFunction((i) => {
      const d = ratlantis.finale.dance;
      return (
        d && !d.closed && performance.now() - d.start >= d.cues[i].due - 100
      );
    }, i);
    const type = await p.evaluate(
      (i) => ratlantis.finale.dance.cues[i].type,
      i,
    );
    await p.getByRole("button", { name: type, exact: true }).click();
  }
}
await play(3);
await p.getByRole("button", { name: "Start dance", exact: true }).click();
await p
  .getByRole("button", { name: "Try again", exact: true })
  .waitFor({ timeout: 25000 });
assert.equal(
  await p.evaluate(() => Boolean(ratlantis.state.flags.dancing)),
  false,
);
await p.getByRole("button", { name: "Try again", exact: true }).click();
await play(5);
await p.locator(".speech").waitFor({ timeout: 25000 });
assert.ok(await p.evaluate(() => ratlantis.state.flags.dancing));
await p.getByRole("button", { name: "Continue", exact: true }).click();
await at(1450);
await click(1550, 500);
await p.waitForTimeout(500);
assert.equal(await p.evaluate(() => ratlantis.id), "queens");
await at(900);
await click(1010, 490);
await p.getByRole("button", { name: "Continue", exact: true }).click();
assert.equal(await p.locator("[data-costume]").count(), 9);
await p.locator("[data-costume=helmet]").click();
await p.locator("[data-costume=cape]").click();
await p.locator("[data-costume=flower]").click();
await p.screenshot({ path: "tests/wardrobe-final.png" });
await p
  .getByRole("button", { name: "Ready for rehearsal", exact: true })
  .click();
await p
  .getByRole("button", { name: "Who dared touch my breadcrumb?", exact: true })
  .click();
assert.equal(await p.evaluate(() => ratlantis.state.actingRound || 0), 0);
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p
  .getByRole("button", {
    name: "My crumb! Oh, what a wonderful day!",
    exact: true,
  })
  .click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
assert.equal(await p.evaluate(() => ratlantis.state.actingRound), 1);
await p.reload();
await p.locator("#continue").click();
await at(900);
await click(1010, 490);
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p
  .getByRole("button", { name: "Ready for rehearsal", exact: true })
  .click();
await p
  .getByRole("button", {
    name: "My little crumb. I shall miss you.",
    exact: true,
  })
  .click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p
  .getByRole("button", {
    name: "Who took it? Return my breadcrumb!",
    exact: true,
  })
  .click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
await p.getByRole("button", { name: "Continue", exact: true }).click();
assert.ok(await p.evaluate(() => ratlantis.state.flags.acting));
await at(1450);
await click(1550, 500);
await p.waitForTimeout(500);
assert.equal(await p.evaluate(() => ratlantis.id), "auditionPipe");
await at(1650);
await click(1740, 500);
await p.waitForTimeout(500);
assert.equal(await p.evaluate(() => ratlantis.id), "vent");
await at(740);
await click(900, 480);
await p.waitForFunction(() => ratlantis.id === "auditionRoom");
await p.screenshot({ path: "tests/vent-final.png" });
await p
  .getByRole("button", { name: "Return to Ratlantis", exact: true })
  .waitFor({ timeout: 8000 });
assert.ok(await p.evaluate(() => ratlantis.state.flags.finished));
await p
  .getByRole("button", { name: "Return to Ratlantis", exact: true })
  .click();
assert.equal(await p.evaluate(() => ratlantis.id), "neighborhood");
await p.locator("#travel").click();
await p.locator("[data-travel=queens]").click();
await p.waitForTimeout(300);
assert.equal(await p.evaluate(() => ratlantis.id), "queens");
assert.equal(await p.evaluate(() => ratlantis.state.outfit.head), "helmet");
assert.deepEqual(errors, []);
await b.close();
console.log(
  "Ferry without loose objects/reload, practice, failed dance/retry/5-of-8 muted pass, all costumes, acting wrong answer/checkpoint, ending, return and travel map pass.",
);
