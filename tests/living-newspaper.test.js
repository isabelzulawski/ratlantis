import test from "node:test";
import assert from "node:assert/strict";
import { summarizeNewspaper } from "../src/data/living-newspaper-model.js";
const row = (result, date = "12/1/2025") => ({
  "INSPECTION DATE": date,
  BOROUGH: "Queens",
  RESULT: result,
  LATITUDE: "",
  LONGITUDE: "",
});
test("living newspaper retains supplied denominator, combined outcomes and missing-month gaps", () => {
  const m = summarizeNewspaper([
    row("Failed for Rat Activity"),
    row("Failed for Rat Activity and Other Reason"),
    row("Passed"),
    row(""),
  ]);
  const q = m.boroughs.find((d) => d.borough === "Queens");
  assert.deepEqual(q, { borough: "Queens", total: 4, active: 2, rate: 0.5 });
  assert.equal(m.monthly.Queens[0].rate, null);
  assert.deepEqual(m.monthly.Queens[11], {
    month: 12,
    total: 4,
    active: 2,
    rate: 0.5,
  });
  assert.ok(Number.isNaN(m.rows[0].lat));
  assert.throws(
    () => summarizeNewspaper([row("Passed", "not a date")]),
    /dates could not be parsed/,
  );
});
