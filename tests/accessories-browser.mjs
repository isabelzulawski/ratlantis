import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const p = await b.newPage({ viewport: { width: 1200, height: 675 } });
await p.addInitScript(() => {
  if (!localStorage.getItem("ratlantis-opening-v1"))
    localStorage.setItem(
      "ratlantis-opening-v1",
      JSON.stringify({
        version: 1,
        name: "Pip",
        fur: "Brown",
        scene: "neighborhood",
        inventory: [],
        flags: {},
        journal: [],
        sound: false,
      }),
    );
});
await p.goto(process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/");
await p.locator("#continue").click();
await p.waitForTimeout(350);
await p.evaluate(() => {
  ratlantis.player.setPosition(880, 415);
  ratlantis.cameras.main.setScroll(350, 0);
});
await p.waitForTimeout(450);
const xy = await p.evaluate(() => ({
  x: 915 - ratlantis.cameras.main.scrollX,
  y: 420,
}));
await p.mouse.click(xy.x, xy.y);
await p.getByRole("button", { name: "Continue", exact: true }).click();
assert.ok(
  await p.evaluate(() => ratlantis.state.accessories.includes("glasses")),
);
await p.locator("#wardrobe").click();
await p.locator("[data-accessory=glasses]").click();
await p.getByRole("button", { name: "Close", exact: true }).click();
await p.waitForTimeout(100);
assert.equal(await p.evaluate(() => ratlantis.finale.overlays.length), 1);
await p.locator("#travel").click();
assert.equal(await p.locator("[data-travel=queens]").count(), 0);
await p.getByRole("button", { name: "Close", exact: true }).click();
await p.reload();
await p.locator("#continue").click();
await p.waitForTimeout(300);
assert.ok(
  await p.evaluate(() =>
    ratlantis.state.equippedAccessories.includes("glasses"),
  ),
);
assert.equal(await p.evaluate(() => ratlantis.finale.overlays.length), 1);
await b.close();
console.log(
  "High shelf accessory, equip/preview, reload and unvisited travel gating pass.",
);
