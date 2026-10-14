import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 675 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173");
await page.getByRole("button", { name: "Begin", exact: true }).waitFor();
await page.screenshot({ path: "tests/title-v3.png" });
await page.getByRole("button", { name: "Begin", exact: true }).click();
await page.screenshot({ path: "tests/creation-v3.png" });
await page.locator("#name").fill("Pip");
await page.getByRole("button", { name: "Explore" }).click();
for (const scene of ["station", "ride", "sewer", "neighborhood"]) {
  await page.evaluate((scene) => ratlantis.enter(scene), scene);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tests/${scene}-v3.png` });
}
await page.getByRole("button", { name: "Backpack", exact: true }).click();
await page.screenshot({ path: "tests/backpack-v3.png" });
assert.deepEqual(errors, []);
console.log("Visual-review screenshots captured with no runtime errors.");
await browser.close();
