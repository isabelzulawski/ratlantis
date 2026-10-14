import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/";
const direct = new URL(base);
direct.searchParams.set("data", "newspaper");
const saved = JSON.stringify({
  version: 1,
  name: "Untouched",
  fur: "Gray",
  scene: "neighborhood",
  inventory: ["pizza"],
  flags: { audition: true },
  journal: ["Original"],
  sound: false,
});
await page.addInitScript(
  (value) => localStorage.setItem("ratlantis-opening-v1", value),
  saved,
);
await page.goto(direct.href);
await page.locator(".bar-row").first().waitFor();
assert.equal(
  await page.locator("canvas").count(),
  0,
  "direct data mode does not start the adventure",
);
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  saved,
);
const data = JSON.parse(
  readFileSync(
    new URL("../public/data/inspections-2025.json", import.meta.url),
  ),
);
const counts = await page
  .locator(".bar-row")
  .evaluateAll((rows) => rows.map((row) => row.__data__));
assert.deepEqual(counts, [
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
]);
let displayed = await page
  .locator(".bar-row")
  .evaluateAll((rows) =>
    rows.map((row) => row.querySelectorAll("text")[1].textContent),
  );
assert.deepEqual(
  displayed,
  counts.map((b) => data.boroughs[b].total.toLocaleString("en-US")),
);
await page
  .getByRole("button", {
    name: "Percentage recording active rat signs",
    exact: true,
  })
  .click();
displayed = await page
  .locator(".bar-row")
  .evaluateAll((rows) =>
    rows.map((row) => row.querySelectorAll("text")[1].textContent),
  );
assert.deepEqual(
  displayed,
  counts.map((b) => data.boroughs[b].percent.toFixed(1) + "%"),
);
await page
  .getByRole("button", { name: "Select Manhattan", exact: true })
  .click();
assert.ok(
  (await page.locator(".factual-summary").innerText()).includes("7,725"),
);
assert.equal(
  await page
    .locator(".borough-map path[aria-pressed='true']")
    .getAttribute("aria-label"),
  "Select Manhattan",
);
await page.getByRole("button", { name: "Monthly poster", exact: true }).click();
assert.equal(
  await page.locator("[data-borough='Manhattan']").getAttribute("aria-pressed"),
  "true",
);
const monthly = await page
  .locator(".month-mark")
  .evaluateAll((points) =>
    points.map((p) => ({
      percent: p.__data__.percent,
      month: p.__data__.month,
      cx: +p.getAttribute("cx"),
      cy: +p.getAttribute("cy"),
    })),
  );
assert.equal(monthly.length, 12);
monthly.forEach((p) => {
  assert.equal(p.percent, data.monthly.Manhattan[p.month - 1].percent);
  assert.ok(Math.abs(p.cy - (233 - p.percent * 2.15)) < 0.0001);
});
await page.locator(".month-target").first().click();
assert.ok(
  (await page.locator(".trend-detail").innerText()).includes(
    "January 2025 · Manhattan",
  ),
);
await page.getByRole("button", { name: "Citywide", exact: true }).click();
assert.ok(
  (await page.locator(".trend-section h2").innerText()).includes("Citywide"),
);
await page.getByRole("button", { name: "Newspaper", exact: true }).click();
await page.locator(".data-sheet").evaluate((e) => (e.scrollTop = 0));
await page.screenshot({ path: "tests/data-desktop-v1.png" });
// Missing months are gaps: no plotted zero, no extra circle, explicit missing tooltip.
await page.evaluate(() => {
  cityRecords.data.monthly.Citywide[2] = {
    month: 3,
    total: 0,
    active: 0,
    unknown: 0,
    known: 0,
    percent: null,
  };
  cityRecords.render();
});
assert.equal(await page.locator(".month-mark").count(), 11);
assert.equal(await page.locator(".missing-month").count(), 1);
await page.locator(".month-target").nth(2).click();
assert.ok(
  (await page.locator(".trend-detail").innerText()).includes("Missing"),
);
await page.setViewportSize({ width: 390, height: 844 });
await page.locator(".data-sheet").evaluate((e) => (e.scrollTop = 0));
assert.ok(
  await page
    .locator(".data-sheet")
    .evaluate((e) => e.scrollWidth <= e.clientWidth + 2),
  "paper fits narrow screen; charts scroll within their own containers",
);
await page.screenshot({ path: "tests/data-mobile-v1.png" });
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  saved,
);
await page.reload();
await page.locator(".month-mark").first().waitFor();
assert.equal(await page.locator(".month-mark").count(), 12);
await page.getByRole("button", { name: "Close City Records" }).click();
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  saved,
);
// Failed local retrieval has an honest unavailable state, never substitute numbers.
const unavailable = await browser.newPage();
await unavailable.route("**/data/inspections-2025.json", (route) =>
  route.fulfill({ status: 503, body: "unavailable" }),
);
await unavailable.goto(direct.href);
await unavailable.getByText("Records unavailable", { exact: true }).waitFor();
assert.equal(await unavailable.locator(".bar-row").count(), 0);
await unavailable.close();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Data checks passed: direct entry preserves saves, real bar/line marks match snapshot, map synchronizes views, tap tooltips, missing months, unavailable state, and responsive paper.",
);
