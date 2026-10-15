import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { SINGING } from "../src/data/brooklyn.js";
const url = process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 675 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => {
  if (!localStorage.getItem("ratlantis-opening-v1"))
    localStorage.setItem(
      "ratlantis-opening-v1",
      JSON.stringify({
        version: 1,
        name: "Pip",
        fur: "Gray",
        scene: "neighborhood",
        inventory: ["pizza", "newspaper"],
        flags: { pizzaPacked: true, newspaperReceived: true, brooklyn: true },
        journal: [
          "Lead: a retired singer in Brooklyn may help. Onward travel is unavailable in this build.",
        ],
        sound: false,
      }),
    );
});
try {
  await page.goto(url);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForTimeout(400);
  const state = () => page.evaluate(() => ratlantis.state);
  const at = async (x, y = 485) => {
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
    await page.waitForTimeout(400);
  };
  const worldClick = async (x, y) => {
    const p = await page.evaluate(
      ({ x, y }) => ({
        x: x - ratlantis.cameras.main.scrollX,
        y: y - ratlantis.cameras.main.scrollY,
      }),
      { x, y },
    );
    await page.mouse.click(p.x, p.y);
  };
  const transition = async (x, pointerX) => {
    await at(x);
    const p = await page.evaluate(
      (x) => ({ x: x - ratlantis.cameras.main.scrollX, y: 550 }),
      pointerX,
    );
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.mouse.up();
    await page.waitForTimeout(400);
  };
  await at(525);
  await worldClick(525, 518);
  await page.getByRole("button", { name: "Pack it", exact: true }).click();
  assert.ok((await state()).inventory.includes("bread"));
  await transition(2015, 2080);
  assert.equal(await page.evaluate(() => ratlantis.id), "bridge");
  await page.screenshot({ path: "tests/bridge-chapter.png" });
  await page.evaluate(() => ratlantis.player.setY(800));
  await page.waitForTimeout(350);
  assert.ok(await page.evaluate(() => ratlantis.player.y < 600));
  assert.deepEqual((await state()).inventory, ["pizza", "newspaper", "bread"]);
  await transition(2310, 2395);
  assert.equal(await page.evaluate(() => ratlantis.id), "brooklyn");
  await at(875);
  await worldClick(1000, 500);
  await page
    .getByRole("button", {
      name: "I'm trying to audition on Broadway.",
      exact: true,
    })
    .click();
  assert.ok(
    (await page.locator(".speech").innerText()).includes("EMPTY STOMACH"),
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.screenshot({ path: "tests/brooklyn-chapter.png" });
  const drag = async (item, target = true) => {
    await page.getByRole("button", { name: "Backpack", exact: true }).click();
    const before = await page.evaluate(() => ({
      x: ratlantis.player.x,
      y: ratlantis.player.y,
    }));
    const box = await page.locator(`[data-item=${item}]`).boundingBox();
    const p = await page.evaluate(
      (target) => ({
        x: (target ? ratlantis.busker.x : 250) - ratlantis.cameras.main.scrollX,
        y: target ? ratlantis.busker.y - 45 : 450,
      }),
      target,
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(p.x, p.y, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(250);
    assert.deepEqual(
      await page.evaluate(() => ({
        x: ratlantis.player.x,
        y: ratlantis.player.y,
      })),
      before,
    );
  };
  await drag("newspaper");
  assert.ok((await state()).inventory.includes("newspaper"));
  assert.ok(await page.locator("#dropNotice").isVisible());
  await page.locator("#close").click();
  await drag("pizza", false);
  assert.ok((await state()).inventory.includes("pizza"));
  await page.locator("#close").click();
  await drag("pizza");
  assert.ok((await state()).flags.buskerFed);
  assert.equal((await state()).inventory.includes("pizza"), false);
  assert.ok((await state()).inventory.includes("bread"));
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Let’s practice", exact: true })
    .click();
  const ready = () =>
    page.waitForFunction(() => ratlantis.chapter.lessonUI?.accepting);
  await page.locator(".note-controls .lit").first().waitFor();
  assert.equal(await page.locator(".busker-portrait.singing").count(), 1);
  assert.equal(await page.evaluate(() => Boolean(ratlantis.audio)), false);
  await ready();
  assert.equal((await state()).sound, false);
  await page.screenshot({ path: "tests/singing-chapter.png" });
  await page.getByRole("button", { name: "Note G", exact: true }).click();
  assert.equal((await state()).singingRound, 0);
  await ready();
  await page.locator("[data-replay]").click();
  await ready();
  for (const n of SINGING.melodies[0])
    await page
      .getByRole("button", {
        name: `Note ${SINGING.notes[n].label}`,
        exact: true,
      })
      .click();
  assert.equal((await state()).singingRound, 1);
  await page.reload();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await at(875);
  await worldClick(1000, 500);
  await page
    .getByRole("button", { name: "Let’s practice", exact: true })
    .click();
  assert.equal((await state()).singingRound, 1);
  await ready();
  await page.getByRole("button", { name: "Note C", exact: true }).click();
  assert.equal((await state()).singingRound, 1);
  await ready();
  for (const n of SINGING.melodies[1])
    await page
      .getByRole("button", {
        name: `Note ${SINGING.notes[n].label}`,
        exact: true,
      })
      .click();
  await ready();
  for (const n of SINGING.melodies[2])
    await page
      .getByRole("button", {
        name: `Note ${SINGING.notes[n].label}`,
        exact: true,
      })
      .click();
  await page.locator(".speech").waitFor();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.match(await page.locator(".speech").innerText(), /YOU’RE SURE/i);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.match(await page.locator(".speech").innerText(), /WHO AM I KIDDING/i);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await page.locator(".speech").count(), 0);
  assert.ok((await state()).flags.singing);
  assert.ok((await state()).flags.ferryTicketAwarded);
  assert.equal(
    (await state()).inventory.filter((i) => i === "ticket").length,
    1,
  );
  assert.ok((await state()).journal.some((j) => j.includes("mop")));
  await drag("bread");
  assert.ok((await state()).inventory.includes("bread"));
  await page.locator("#close").click();
  await page.getByRole("button", { name: "Backpack", exact: true }).click();
  await page.locator("[data-item=ticket]").click();
  assert.ok(
    (await page.locator(".speech").innerText()).includes(
      "ASK FOR THE RAT WITH THE MOP",
    ),
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#close").click();
  await transition(70, 0);
  assert.equal(await page.evaluate(() => ratlantis.id), "bridge");
  await transition(70, 0);
  assert.equal(await page.evaluate(() => ratlantis.id), "neighborhood");
  await transition(2015, 2080);
  await transition(2310, 2395);
  await at(875);
  await worldClick(1000, 500);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(
    (await state()).inventory.filter((i) => i === "ticket").length,
    1,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.ok((await state()).flags.ferryTicketAwarded);
  assert.equal((await state()).singingRound, 3);
  assert.deepEqual(errors, []);
  // Separate player who missed pizza: collect bread beside café, bring it to Brooklyn.
  const fallback = await browser.newPage({
    viewport: { width: 1200, height: 675 },
  });
  await fallback.addInitScript(() => {
    if (!localStorage.getItem("ratlantis-opening-v1"))
      localStorage.setItem(
        "ratlantis-opening-v1",
        JSON.stringify({
          version: 1,
          name: "Crumb",
          fur: "Brown",
          scene: "neighborhood",
          inventory: [],
          flags: {},
          journal: [],
          sound: false,
        }),
      );
  });
  await fallback.goto(url);
  await fallback.locator("#continue").click();
  await fallback.waitForTimeout(400);
  await fallback.evaluate(() => {
    ratlantis.player.setPosition(500, 485);
    ratlantis.cameras.main.setScroll(0, 0);
  });
  await fallback.mouse.click(525, 518);
  await fallback.getByRole("button", { name: "Pack it", exact: true }).click();
  await fallback.evaluate(() => {
    ratlantis.enter("brooklyn", [875, 485]);
    ratlantis.cameras.main.setScroll(400, 0);
  });
  await fallback.waitForTimeout(300);
  await fallback.locator("#bag").click();
  const bb = await fallback.locator("[data-item=bread]").boundingBox();
  await fallback.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await fallback.mouse.down();
  const xy = await fallback.evaluate(() => ({
    x: ratlantis.busker.x - ratlantis.cameras.main.scrollX,
    y: 490,
  }));
  await fallback.mouse.move(xy.x, xy.y, { steps: 12 });
  await fallback.mouse.up();
  assert.ok(await fallback.evaluate(() => ratlantis.state.flags.buskerFed));
  assert.equal(
    await fallback.evaluate(() => ratlantis.state.inventory.includes("bread")),
    false,
  );
  await browser.close();
  console.log(
    "Brooklyn route, both foods, wrong drops, muted lesson/replay/retry, checkpoint reload, ticket, return/revisit and no duplicate consumption passed.",
  );
} catch (error) {
  await page.screenshot({ path: "tests/brooklyn-failure.png" });
  console.log(
    await page.evaluate(() => ({
      classes: document.querySelector("#overlay").className,
      scene: ratlantis.id,
      flags: ratlantis.state.flags,
      text: document.querySelector("#overlay").innerText,
      styles: [...document.querySelectorAll(".speech button")].map((el) => ({
        events: getComputedStyle(el).pointerEvents,
        rect: el.getBoundingClientRect().toJSON(),
      })),
    })),
  );
  throw error;
}
