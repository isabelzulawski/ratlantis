import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import * as d3 from "d3";
import { createHash } from "node:crypto";
const rows = d3.csvParse(
  await fs.readFile("public/data/rats_2025_initial.csv", "utf8"),
);
assert.equal(
  createHash("sha256")
    .update(await fs.readFile("public/data/rats_2025_initial.csv"))
    .digest("hex"),
  "9fdac060a70685420562bc167fb50a65973f66151dc39a05729683dec5b831d9",
  "Supplied CSV preserved byte for byte",
);
const source = await fs.readFile(
  "tests/fixtures/newspaper-source.html",
  "utf8",
);
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5173/";
await page.addInitScript(() =>
  localStorage.setItem("ratlantis-opening-v1", "unchanged save"),
);
await page.goto(base + "?data=newspaper");
await page.waitForFunction(
  () => document.querySelectorAll("#borough-chart rect").length === 5,
);
const normalize = (s) => s.replace(/\s+/g, " ").trim();
const suppliedArticles = [...source.matchAll(/<article\b.*?<\/article>/gs)].map(
  (m) => m[0],
);
for (let i = 0; i < 3; i++) {
  const expected = await page.evaluate(html => {
    const d = new DOMParser().parseFromString(html, "text/html");
    return [...d.querySelectorAll("article header h1, article header h2, article p:not([role]), article figcaption")].map(el=>el.textContent.replace(/\s+/g," ").trim()).filter(Boolean).sort();
  }, suppliedArticles[i]);
  const actual = await page.locator(".paper-page article").nth(i).evaluate(el => {
    const c = el.cloneNode(true); c.querySelector("footer")?.remove();
    return [...c.querySelectorAll("header h1, header h2, p:not([role]), figcaption")].map(e=>e.textContent.replace(/\s+/g," ").trim()).filter(Boolean).sort();
  });
  assert.deepEqual(actual, expected, "article wording preserved across facing pages");
}
const bars = await page
  .locator("#borough-chart rect")
  .evaluateAll((es) =>
    es.map((e) => ({
      data: e.__data__,
      title: e.querySelector("title").textContent,
      width: +e.getAttribute("width"),
    })),
  );
for (const bar of bars) {
  const r = rows.filter((r) => r.BOROUGH.trim() === bar.data.borough),
    positive = r.filter((r) =>
      r.RESULT.toLowerCase().includes("rat activity"),
    ).length;
  assert.equal(bar.data.total, r.length);
  assert.equal(bar.data.positive, positive);
  assert.equal(bar.data.proportion, positive / r.length);
  assert.ok(bar.title.includes(d3.format(",")(positive)));
  assert.ok(bar.width > 0);
}
await page.screenshot({ path: "tests/newspaper-borough.png" });
await page.getByRole("button", { name: "Next", exact: true }).click();
await page.waitForFunction(
  () => document.querySelectorAll("#monthly-chart circle").length === 60,
);
const points = await page
  .locator("#monthly-chart circle")
  .evaluateAll((es) =>
    es.map((e) => ({
      point: e.__data__,
      title: e.querySelector("title").textContent,
    })),
  );
for (const p of points) {
  const borough = p.title.split(" — ")[0];
  const rs = rows.filter(
    (r) =>
      r.BOROUGH === borough &&
      Number(r["INSPECTION DATE"].split("/")[0]) === p.point.month,
  );
  assert.equal(p.point.total, rs.length);
  assert.equal(
    p.point.positive,
    rs.filter((r) => r.RESULT.toLowerCase().includes("rat activity")).length,
  );
}
await page.screenshot({ path: "tests/newspaper-monthly.png" });
await page.getByRole("button", { name: "Next", exact: true }).click();
await page.waitForFunction(() =>
  document.querySelector("#map-status").textContent.includes("overlaid in red"),
);
const mapped = rows.filter(
  (r) =>
    r.LATITUDE.trim() &&
    r.LONGITUDE.trim() &&
    +r.LATITUDE >= 40.45 &&
    +r.LATITUDE <= 40.95 &&
    +r.LONGITUDE >= -74.3 &&
    +r.LONGITUDE <= -73.65,
);
const status = await page.locator("#map-status").innerText();
assert.ok(status.includes(d3.format(",")(mapped.length)));
assert.ok(
  status.includes(
    d3.format(",")(
      mapped.filter((r) => r.RESULT.toLowerCase().includes("rat activity"))
        .length,
    ),
  ),
);
await page.screenshot({ path: "tests/newspaper-map.png" });
assert.equal(await page.locator(".paper-next").isDisabled(), true);
await page.getByRole("button", { name: "Previous", exact: true }).click();
assert.equal(await page.locator("#monthly-chart circle").count(), 60);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
assert.ok(
  await page
    .locator(".newspaper-spread")
    .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
);
await page.screenshot({ path: "tests/newspaper-mobile.png" });
await page.getByRole("button", { name: "Close City Records" }).click();
assert.equal(
  await page.evaluate(() => localStorage.getItem("ratlantis-opening-v1")),
  "unchanged save",
);
assert.deepEqual(errors, []);
const unavailable = await browser.newPage();
await unavailable.route("**/data/rats_2025_initial.csv*", (r) =>
  r.fulfill({ status: 503, body: "Unavailable" }),
);
await unavailable.goto(base + "?data=newspaper");
await unavailable.waitForFunction(() =>
  document.querySelector("#status").textContent.includes("Could not load"),
);
assert.equal(await unavailable.locator("#borough-chart rect").count(), 0);
await browser.close();
console.log(
  "All three supplied-data pages, preserved articles, chart calculations, map counts, page navigation, mobile, unavailable state and save isolation pass.",
);
