import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const url = new URL(process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/");
url.searchParams.set("data", "newspaper");
const original = '{"version":1,"name":"Original","scene":"neighborhood"}';
await page.addInitScript(
  (save) => localStorage.setItem("ratlantis-opening-v1", save),
  original,
);
await page.goto(url.href);
await page.locator(".newspaper-columns").waitFor();
assert.ok((await page.locator(".lead-story").innerText()).includes("144,313"));
assert.equal(
  await page
    .locator(
      ".bar-chart,.trend-chart,.borough-controls,.metric-controls,.records-nav",
    )
    .count(),
  0,
);
assert.equal(
  await page.locator(".newspaper-spread button").count(),
  1,
  "only folding the newspaper is interactive",
);
assert.equal(await page.locator("canvas").count(), 0);
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  original,
);
await page.screenshot({ path: "tests/static-newspaper-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
assert.ok(
  await page
    .locator(".newspaper-spread")
    .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
);
await page.screenshot({ path: "tests/static-newspaper-mobile.png" });
await page.getByRole("button", { name: "Close City Records" }).click();
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  original,
);
const unavailable = await browser.newPage();
await unavailable.route("**/data/inspections-2025.json", (r) =>
  r.fulfill({ status: 503, body: "Unavailable" }),
);
await unavailable.goto(url.href);
await unavailable.getByText("Records unavailable", { exact: true }).waitFor();
await unavailable.close();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Static newspaper: real figures, no data controls, responsive spread, unavailable state, and unchanged game saves pass.",
);
