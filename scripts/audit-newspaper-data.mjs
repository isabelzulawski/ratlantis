// Read-only audit of the CSV used by the current newspaper.
// Run: node scripts/audit-newspaper-data.mjs
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { csvParse } from "d3";
import { ORDER, summarizeNewspaper } from "../src/data/living-newspaper-model.js";
const csv = await readFile(new URL("../public/data/rats_2025_initial.csv", import.meta.url));
const gzip = await readFile(new URL("../public/data/rats_2025_initial.csv.gz", import.meta.url));
assert.ok(gunzipSync(gzip).equals(csv), "CSV and gzip must contain identical bytes");
const rows = csvParse(csv.toString("utf8"));
const fields = ["INSPECTION DATE", "INSPECTION TYPE", "RESULT", "BOROUGH", "LATITUDE", "LONGITUDE"];
assert.deepEqual(rows.columns, fields, "Review changed source columns");
const distribution = key => rows.reduce((counts, row) => {
  const value = row[key] || "(empty)";
  counts[value] = (counts[value] || 0) + 1;
  return counts;
}, {});
const model = summarizeNewspaper(rows);
// Expectations belong to this checked-in snapshot, not a live NYC API feed.
assert.equal(rows.length, 144314, "Review changed snapshot size");
assert.ok(rows.every(row => row["INSPECTION TYPE"] === "Initial"), "Unexpected inspection type");
assert.ok(rows.every(row => ORDER.includes(row.BOROUGH.trim())), "Unexpected borough");
const knownResults = new Set(["Passed", "Failed for Other Reason", "Failed for Rat Activity", "Failed for Rat Activity and Other Reason"]);
assert.ok(rows.every(row => knownResults.has(row.RESULT)), "Review missing/new result categories");
const findings = model.rows.filter(row => row.active).length;
assert.equal(findings, 25678, "Review changed finding total");
const mapped = model.rows.filter(row => Number.isFinite(row.lat) && Number.isFinite(row.lon) &&
  row.lat >= 40.45 && row.lat <= 40.95 && row.lon >= -74.3 && row.lon <= -73.65);
assert.equal(mapped.length, 140764, "Review changed map eligibility");
assert.equal(mapped.filter(row => row.active).length, 24815, "Review changed mapped findings");
for (const borough of model.boroughs) {
  assert.equal(model.monthly[borough.borough].reduce((sum, month) => sum + month.total, 0), borough.total);
}
assert.equal(model.boroughs.reduce((sum, borough) => sum + borough.total, 0), rows.length);
// Equal reduced fields do not prove duplicate source events; never remove them.
const uniqueRows = new Set(rows.map(row => JSON.stringify(fields.map(field => row[field]))));
console.log(JSON.stringify({
  source: "public/data/rats_2025_initial.csv",
  sha256: createHash("sha256").update(csv).digest("hex"),
  gzipMatchesCsv: true,
  fields, visits: rows.length, findings,
  inspectionTypes: distribution("INSPECTION TYPE"),
  results: distribution("RESULT"),
  boroughs: model.boroughs,
  monthly: model.monthly,
  mappedVisits: mapped.length,
  mappedFindings: mapped.filter(row => row.active).length,
  excludedFromMap: rows.length - mapped.length,
  equalSixFieldRowsBeyondFirst: rows.length - uniqueRows.size,
  duplicateCaution: "Equal retained fields do not prove duplicate events. No rows were removed."
}, null, 2));
