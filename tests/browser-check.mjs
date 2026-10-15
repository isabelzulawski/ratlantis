import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 675 } }),
  errors = [];
page.on("pageerror", (e) => {
  errors.push(e.message);
  console.log("browser error", e.message);
});
await page.goto(process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173");
await page.getByRole("button", { name: "Begin", exact: true }).waitFor();
assert.equal(
  await page.getByText("A city beneath the city", { exact: true }).count(),
  0,
);
assert.equal(
  await page
    .getByText("A small rat. A very large ambition.", { exact: true })
    .count(),
  0,
);
assert.equal(
  await page
    .getByText("First playable section · illustrated prototype", {
      exact: true,
    })
    .count(),
  0,
);
assert.equal(
  await page.evaluate(
    () =>
      getComputedStyle(document.querySelector(".panel"), "::before").content,
  ),
  "none",
);
await page.screenshot({ path: "tests/title-v3.png" });
await page.getByRole("button", { name: "Begin", exact: true }).click();
assert.equal(
  await page.getByText("Your little traveler", { exact: true }).count(),
  0,
);
assert.equal(
  await page
    .getByText("Fabric backpack · string straps · button closure", {
      exact: true,
    })
    .count(),
  0,
);
await page.locator("#name").fill("Pip");
await page.screenshot({ path: "tests/creation-v3.png" });
await page.getByRole("button", { name: "Explore" }).click();
await page.waitForTimeout(1000);
const pos = () =>
  page.evaluate(() => ({
    x: ratlantis.player.x,
    y: ratlantis.player.y,
    vx: ratlantis.player.body.velocity.x,
    vy: ratlantis.player.body.velocity.y,
    id: ratlantis.id,
  }));
const screen = async (x, y) =>
  page.evaluate(
    ({ x, y }) => ({
      x: x - ratlantis.cameras.main.scrollX,
      y: y - ratlantis.cameras.main.scrollY,
    }),
    { x, y },
  );
const click = async (x, y) => {
  const p = await screen(x, y);
  await page.mouse.click(p.x, p.y);
};
const at = async (x, y) => {
  await page.evaluate(
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
  await page.waitForTimeout(600);
};
await page.screenshot({ path: "tests/street-v3.png" });
// Real mouse hold, upward release, stop, and no second jump in mid-air.
await page.mouse.move(400, 575);
await page.mouse.down();
await page.waitForTimeout(380);
await page.mouse.move(400, 400);
await page.mouse.up();
await page.waitForTimeout(70);
assert.ok((await pos()).vy < 0, "upward release jumps");
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(70);
assert.ok((await pos()).vy > -425, "airborne release does not double jump");
await page.waitForTimeout(1000);
await page.mouse.move(600, 575);
await page.mouse.down();
await page.waitForTimeout(200);
await page.mouse.up();
assert.equal((await pos()).vx, 0);
// Pizza can only move by the rat approaching and gripping it; release never jumps.
await at(140, 550);
let pizzaX = await page.evaluate(() => ratlantis.pizza.x);
let p = await screen(pizzaX, 555);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.mouse.move(p.x + 280, p.y, { steps: 15 });
await page.waitForTimeout(3500);
assert.ok(
  await page.evaluate(() => ratlantis.pizzaControl.attached),
  "rat grips crust",
);
assert.ok(
  await page.evaluate(
    () => Math.abs(ratlantis.player.body.center.x - ratlantis.pizza.x - 82) < 3,
  ),
  "pizza remains attached at the mouth",
);
assert.ok(
  await page.evaluate(
    () =>
      Math.abs(ratlantis.pizza.y - 594) < 1 &&
      Math.abs(ratlantis.player.body.bottom - 580) < 3,
  ),
  "pizza rests on pavement in front of curb",
);
await page.screenshot({ path: "tests/pizza-drag-v3.png" });
await page.mouse.up();
assert.equal((await pos()).vx, 0);
assert.ok(Math.abs((await pos()).vy) < 10);
pizzaX = await page.evaluate(() => ratlantis.pizza.x);
await click(pizzaX, 555);
await page.getByRole("button", { name: "Pack a piece" }).click();
await page.getByRole("button", { name: "Continue", exact: true }).click();
await click(pizzaX, 555);
await page.getByRole("button", { name: "Pack a piece" }).click();
await page.getByRole("button", { name: "Continue", exact: true }).click();
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
]);
await page.getByRole("button", { name: "Backpack", exact: true }).click();
const item = await page.locator(".item").boundingBox();
await page.mouse.move(item.x + 30, item.y + 30);
await page.mouse.down();
await page.mouse.move(50, 600, { steps: 8 });
await page.mouse.up();
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
]);
await page.getByRole("button", { name: "Close backpack" }).click();
// Releasing a movement gesture over the actual billboard does not inspect.
await at(1400, 550);
assert.ok(await page.evaluate(() => ratlantis.cameras.main.scrollX > 200));
p = await screen(1450, 575);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
p = await screen(1450, 240);
await page.mouse.move(p.x, p.y);
await page.mouse.up();
assert.equal(await page.locator(".speech").count(), 0);
await page.waitForTimeout(1000);
await at(1400, 550);
p = await screen(1450, 240);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.waitForTimeout(600);
await page.mouse.up();
assert.equal(
  await page.locator(".speech").count(),
  0,
  "long poster hold must not inspect",
);
await click(1450, 240);
await page.getByRole("button", { name: "Maybe I could try." }).click();
await page.waitForTimeout(130);
await click(1450, 240);
assert.equal(
  await page.locator(".panel").count(),
  0,
  "completed poster never reopens",
);
assert.equal(
  await page.evaluate(() => Boolean(ratlantis.rat.halo)),
  false,
  "rat halo removed",
);
assert.equal(
  await page.evaluate(() => ratlantis.rat.sprite.preFX.list.length),
  0,
  "rat glow removed",
);
await click(1180, 440);
assert.equal(await page.locator(".speech").count(), 0);
await page.getByRole("button", { name: "Backpack", exact: true }).click();
await page.getByRole("button", { name: "Close backpack" }).click();
await click(1180, 440);
assert.equal(await page.locator(".speech").count(), 0);
await page.screenshot({ path: "tests/billboard-v3.png" });
// Downtown travel leads to a separate, small park scene.
await at(2010, 550);
p = await screen(2180, 575);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.waitForTimeout(1100);
await page.mouse.up();
assert.equal((await pos()).id, "downtown");
await page.waitForTimeout(6400);
assert.equal((await pos()).id, "park");
await at(395, 550);
await click(410, 550);
for (const line of [
  "Finally, another rodent! Can you help me find Broadway?",
  "Ah yes, show biz! You need connections. Personally, the humans love me.",
  "They do?",
  "Of course, they bring me nuts. Very established relationship.",
  "But you should see what they say about you rats. Check that lamppost to the right.",
]) {
  assert.ok(
    (await page.locator(".speech").innerText()).includes(line.toUpperCase()),
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
assert.equal(
  await page.evaluate(() => ratlantis.state.inventory.includes("newspaper")),
  false,
);
await at(1050, 550);
const parked = await pos();
await click(1310, 300);
await page.locator(".paper-pages").waitFor();
assert.equal(
  await page.locator(".bar-row,.borough-controls,.metric-controls").count(),
  0,
);
assert.equal((await pos()).x, parked.x);
await page.getByRole("button", { name: "Close City Records" }).click();
for (const line of [
  "I never knew! Why are they so obsessed with us?",
  "Beats me. I’ve never seen any bad press about me!",
  "Here. Keep this extra newspaper in your backpack in case you need it.",
  "Wow, thanks! Now I see why everyone loves squirrels.",
]) {
  assert.ok(
    (await page.locator(".speech").innerText()).includes(line.toUpperCase()),
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
await page.getByRole("button", { name: "Close City Records" }).click();
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
  "newspaper",
]);
await page.reload();
await page.getByRole("button", { name: "Continue", exact: true }).click();
await page.waitForTimeout(600);
assert.equal((await pos()).id, "park");
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
  "newspaper",
]);
await at(1050, 550);
await page.getByRole("button", { name: "Backpack", exact: true }).click();
await page.locator("[data-item=newspaper]").click();
await page.locator(".paper-pages").waitFor();
await page.getByRole("button", { name: "Close City Records" }).click();
await page.getByRole("button", { name: "Close backpack" }).click();
await page.waitForTimeout(150);
await click(1060, 560);
await page.screenshot({ path: "tests/map-dialogue-v4.png" });
assert.ok(
  (await page.locator(".speech").innerText()).includes(
    "We're near Broadway-Lafayette station. Lafayette... like from that musical? Let's go!".toUpperCase(),
  ),
);
await page.getByRole("button", { name: "Continue", exact: true }).click();
assert.ok(await page.evaluate(() => ratlantis.state.flags.map));
// Natural walk-through exit, rather than relying on a label.
await at(1310, 550);
p = await screen(1440, 575);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.waitForTimeout(1100);
await page.mouse.up();
assert.equal((await pos()).id, "station");
assert.equal(
  await page.evaluate(() => ratlantis.background.frame.name),
  "__BASE",
  "station uses full artwork, not tunnel texture crop",
);
await page.screenshot({ path: "tests/station-v3.png" });
await at(1700, 550);
await click(1710, 430);
await page.waitForTimeout(420);
assert.equal((await pos()).id, "ride");
// Help pauses both the ride timer and window animation.
await page.getByRole("button", { name: "Pause / Help" }).click();
const elapsed = await page.evaluate(() => ratlantis.rideElapsed);
await page.waitForTimeout(400);
assert.equal(await page.evaluate(() => ratlantis.rideElapsed), elapsed);
await page.getByRole("button", { name: "Resume", exact: true }).click();
await click(1060, 90);
await page.waitForTimeout(420);
assert.equal((await pos()).id, "arrivalStation");
await at(1230, 550);
await click(1248, 548);
await page.waitForTimeout(450);
await page.screenshot({ path: "tests/pipe-v4.png" });
assert.equal(
  await page.evaluate(() => ratlantis.background.texture.key),
  "art-pipe",
);
await page.waitForTimeout(1650);
assert.equal((await pos()).id, "sewer");
await page.waitForTimeout(500);
if (await page.locator('[data-plot-thought="arrival"]').count()) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForTimeout(150);
}
await page.waitForFunction(() => ratlantis.player.body.blocked.down);
p = await screen(390, 545);
await page.mouse.move(p.x, p.y);
await page.mouse.down();
await page.waitForTimeout(200);
p = await screen(440, 370);
await page.mouse.move(p.x, p.y);
await page.mouse.up();
await page.waitForTimeout(50);
await page.waitForTimeout(1100);
assert.equal(
  await page.evaluate(() => Boolean(ratlantis.squirrel?.input?.enabled)),
  false,
  "departed park targets are destroyed, not invisible click blockers",
);
assert.ok(
  await page.evaluate(() => ratlantis.player.body.right > 320),
  "boat jump overlaps the safe ledge",
);
assert.ok(
  await page.evaluate(
    () =>
      ratlantis.player.body.blocked.down &&
      Math.abs(ratlantis.player.body.bottom - 505) < 3,
  ),
);
await page.evaluate(() => ratlantis.player.setPosition(700, 800));
await page.waitForTimeout(150);
assert.ok((await pos()).y < 665);
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
  "newspaper",
]);
await at(1630, 480);
await click(1710, 430);
await page.waitForTimeout(420);
assert.equal((await pos()).id, "neighborhood");
await page.screenshot({ path: "tests/neighborhood-v3.png" });
await at(230, 500);
await click(245, 510);
await page
  .getByRole("button", { name: "I’m trying to get to a Broadway audition." })
  .click();
await page.getByRole("button", { name: "Continue", exact: true }).click();
assert.ok(await page.evaluate(() => ratlantis.state.flags.brooklyn));
await page.reload();
await page.getByRole("button", { name: "Continue", exact: true }).click();
await page.waitForTimeout(600);
assert.equal((await pos()).id, "neighborhood");
assert.deepEqual(await page.evaluate(() => ratlantis.state.inventory), [
  "pizza",
  "newspaper",
]);
assert.ok(await page.evaluate(() => ratlantis.state.flags.brooklyn));
await page.getByRole("button", { name: "Pause / Help" }).click();
await page.getByRole("button", { name: "Title screen" }).click();
await page.getByRole("button", { name: "New Game", exact: true }).click();
await page.getByRole("button", { name: "Keep my save" }).click();
assert.ok(
  await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("ratlantis-opening-v1")).flags.brooklyn,
  ),
);
assert.deepEqual(errors, []);
console.log(
  "Full opening and polish checks passed: clean title, grounded mouth drag, direct unlabeled inspection, movement/jumps, natural exits, pause, inventory, recovery and save/Continue.",
);
await browser.close();
