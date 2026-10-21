import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.RATLANTIS_TEST_URL || "http://127.0.0.1:5182/";
  await page.goto(url + "?data=newspaper");
  await page.waitForFunction(() => window.cityRecords?.experience.model);
  await page.waitForTimeout(800);
  assert.equal(await page.locator(".news-bar").count(), 5);
  assert.match(await page.locator('[data-top="0"]').innerText(), /QUEENS/);
  assert.match(
    await page.locator('[data-detail="0"]').innerText(),
    /1,883.*7,355/s,
  );
  await page.locator('[data-mode="active"]').click();
  await page.waitForTimeout(700);
  assert.match(await page.locator('[data-top="0"]').innerText(), /BROOKLYN/);
  assert.match(await page.locator('[data-detail="0"]').innerText(), /BROOKLYN/);
  const fills = await page.locator(".news-bar").evaluateAll((nodes) =>
    nodes.map((n) => ({
      borough: n.__data__.borough,
      fill: n.getAttribute("fill"),
    })),
  );
  assert.equal(fills.find((d) => d.borough === "Brooklyn").fill, "#9c7134");
  assert.equal(fills.find((d) => d.borough === "Queens").fill, "#3c5865");
  assert.ok(
    !(await page.locator('[data-page="0"]').innerText()).includes("One city."),
  );
  const sheetBox = await page.locator(".newspaper-spread").boundingBox();
  const graphicBox = await page
    .locator('[data-page="0"] .news-graphic')
    .boundingBox();
  assert.ok(graphicBox.x > sheetBox.x + sheetBox.width / 2);

  const counts = await page.evaluate(
    () => window.cityRecords.experience.model.boroughs,
  );
  assert.equal(
    counts.reduce((n, d) => n + d.total, 0),
    144314,
  );
  assert.equal(counts.find((d) => d.borough === "Brooklyn").active, 10058);
  await page.screenshot({ path: "tests/living-borough.png" });
  await page.locator('[data-read="0"]').click();
  assert.match(
    await page.locator(".reader-text").innerText(),
    /Queens Takes the Lead!/,
  );
  assert.match(await page.locator(".reader-text").innerText(), /144,314/);
  await page.locator(".reader-back").click();
  await page.locator('.news-bar[aria-label^="Queens:"]').click();
  await page.locator(".paper-next").click();
  const tab = page.locator(".context-tab");
  await page.waitForFunction(
    () => document.querySelector(".loose-paper img")?.complete,
  );
  await page.waitForTimeout(350);
  await page.screenshot({ path: "tests/living-loose-paper-covered.png" });
  assert.equal(await page.locator("#context-pull").count(), 0);
  const tabBox = await tab.boundingBox();
  await page.mouse.move(
    tabBox.x + tabBox.width / 2,
    tabBox.y + tabBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    tabBox.x + tabBox.width / 2 + 65,
    tabBox.y + tabBox.height / 2,
    { steps: 5 },
  );
  const partial = await page.evaluate(() => cityRecords.experience.contextPull);
  assert.ok(partial > 0 && partial < 100);
  await page.mouse.move(
    tabBox.x + tabBox.width / 2 + 145,
    tabBox.y + tabBox.height / 2 + 85,
    { steps: 5 },
  );
  await page.mouse.up();
  assert.equal(
    await page.evaluate(() => cityRecords.experience.contextPull),
    100,
  );
  await page.waitForTimeout(350);
  const resting = await page.evaluate(() => ({
    ...cityRecords.experience.paperPosition,
  }));
  assert.ok(resting.x > 140 && resting.y > 80);
  await page.waitForTimeout(150);
  assert.deepEqual(
    await page.evaluate(() => cityRecords.experience.paperPosition),
    resting,
  );
  await tab.click();
  assert.equal(await tab.getAttribute("aria-expanded"), "false");
  await tab.press("Enter");
  assert.equal(await page.locator(".context-reveal").isVisible(), true);
  await tab.press("Home");
  assert.equal(await tab.getAttribute("aria-expanded"), "false");
  assert.equal(await page.evaluate(() => cityRecords.page), 1);
  await tab.click();
  await page.waitForTimeout(350);
  assert.match(
    await page.locator(".context-reveal").innerText(),
    /110 findings/,
  );
  assert.match(
    await page.locator(".context-reveal").innerText(),
    /2,400 inspections/,
  );
  await page.screenshot({ path: "tests/living-monthly.png" });
  await page.locator('[aria-label="Monthly borough"]').selectOption("Brooklyn");
  assert.match(
    await page.locator(".shock-number").innerText(),
    /38.3%.*QUEENS/s,
  );
  assert.match(
    await page.locator(".context-reveal").innerText(),
    /QUEENS.*110 findings.*287 inspections/s,
  );
  await page
    .locator('[aria-label="Monthly borough"]')
    .selectOption("Staten Island");
  assert.match(
    await page.locator(".shock-number").innerText(),
    /38.3%.*QUEENS/s,
  );
  assert.match(
    await page.locator('[data-detail="1"]').innerText(),
    /STATEN ISLAND/,
  );
  assert.equal(
    await page.locator('[data-page="1"] .news-lead [data-detail]').count(),
    0,
  );
  await page.locator('[aria-label="Monthly borough"]').selectOption("all");
  assert.equal(await page.locator(".monthly-series").count(), 5);
  assert.equal(await page.locator("#monthly-chart circle").count(), 60);
  assert.equal(await page.locator(".monthly-legend text").count(), 5);
  await page
    .locator('#monthly-chart circle[aria-label^="Queens: Dec"]')
    .click();
  assert.match(
    await page.locator('[data-detail="1"]').innerText(),
    /QUEENS.*110 findings.*287 initial inspections/s,
  );
  assert.equal(
    await page.locator('[aria-label="Monthly borough"]').inputValue(),
    "all",
  );
  await page.waitForTimeout(750);
  await page.screenshot({ path: "tests/living-all-boroughs.png" });
  await page.locator('[aria-label="Monthly borough"]').selectOption("Queens");
  assert.equal(await page.locator(".monthly-series").count(), 1);
  await page.locator(".paper-next").click();
  await page.waitForFunction(() => !!window.cityRecords.experience.drawMap);
  assert.equal(await page.locator(".coverage-flap").count(), 0);
  const redImage = await page
    .locator("#inspection-map")
    .evaluate((c) => c.toDataURL());
  await page.locator('[data-map-view="inspections"]').click();
  assert.equal(
    await page
      .locator('[data-map-view="inspections"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  const blueImage = await page
    .locator("#inspection-map")
    .evaluate((c) => c.toDataURL());
  assert.notEqual(blueImage, redImage);
  await page.locator('[data-map-view="both"]').click();
  assert.match(
    await page.locator('[data-caption="2"]').innerText(),
    /140,764 inspection visits in blue.*24,815 findings in red/s,
  );
  assert.match(
    await page.locator('[data-detail="2"]').innerText(),
    /UNDER THE MAGNIFYING GLASS/,
  );
  const lensBefore = await page.evaluate(
    () => cityRecords.experience.lensCounts,
  );
  await page.locator("#inspection-map").focus();
  for (let i = 0; i < 10; i++)
    await page.locator("#inspection-map").press("ArrowLeft");
  await page.waitForTimeout(80);
  assert.notDeepEqual(
    await page.evaluate(() => cityRecords.experience.lensCounts),
    lensBefore,
  );
  const box = await page.locator("#inspection-map").boundingBox();
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.screenshot({ path: "tests/living-map.png" });
  await page.setViewportSize({ width: 900, height: 650 });
  await page.screenshot({ path: "tests/living-small.png" });
  const fit = await page.locator(".newspaper-spread").boundingBox();
  assert.ok(
    fit.x >= 0 &&
      fit.y >= 0 &&
      fit.x + fit.width <= 901 &&
      fit.y + fit.height <= 651,
  );
  assert.deepEqual(errors, []);
  await page.locator(".paper-close").click();
  assert.equal(await page.locator(".newspaper-spread").count(), 0);
  // Failure is visible, never substituted with fabricated marks.
  await page.route("**/data/rats_2025_initial.csv.gz", (r) => r.abort());
  await page.reload();
  await page.waitForFunction(() =>
    document
      .querySelector('[data-detail="0"]')
      .textContent.includes("unavailable"),
  );
  assert.equal(await page.locator(".news-bar").count(), 0);
  await page.unroute("**/data/rats_2025_initial.csv.gz");
  await page.goto(url);
  await page.locator("#new").click();
  await page.locator("#name").fill("Paper tester");
  await page.locator("#start").click();
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    ratlantis.state.inventory.push("newspaper");
    ratlantis.persist();
  });
  await page.locator("#bag").click();
  await page.locator('[data-item="newspaper"]').click();
  await page.waitForFunction(() => ratlantis.ui.records.experience.model);
  const pos = await page.evaluate(() => ({
    x: ratlantis.player.x,
    y: ratlantis.player.y,
  }));
  await page.locator('[data-mode="active"]').click();
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => ratlantis.locked), true);
  assert.deepEqual(
    await page.evaluate(() => ({
      x: ratlantis.player.x,
      y: ratlantis.player.y,
    })),
    pos,
  );
  await page.locator(".paper-close").click();
  await page
    .getByRole("button", { name: "Close backpack", exact: true })
    .click();
  assert.equal(await page.evaluate(() => ratlantis.locked), false);
  assert.deepEqual(
    await page.evaluate(() => ({
      x: ratlantis.player.x,
      y: ratlantis.player.y,
    })),
    pos,
  );
  // Park notices and squirrel reward share this same newspaper instance and callback.
  await page.evaluate(() =>
    ratlantis.ui.records.open(
      "comparison",
      () => (ratlantis.state.flags.testPaperClosed = true),
    ),
  );
  await page.locator(".paper-close").click();
  assert.equal(
    await page.evaluate(() => ratlantis.state.flags.testPaperClosed),
    true,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Living newspaper: source counts, crown toggle, articles, clipping, borough selection, map layers/lens, resize, unavailable state, backpack reopen, pause/position restoration and callback pass.",
  );
} finally {
  await browser.close();
}
