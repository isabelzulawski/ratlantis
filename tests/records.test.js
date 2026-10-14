import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  aggregateRecords,
  BOROUGHS,
  percentage,
} from "../src/data/records-model.js";
import { fresh, collectNewspaper, save, load } from "../src/state.js";
test("exact duplicate rows differ from repeat property visits; unknown outcomes stay in denominator", () => {
  const row = {
    inspection_type: "Initial",
    inspection_date: "2025-01-10T12:00:00.000",
    borough: "Manhattan",
    result: "Failed for Rat Activity",
    bbl: "1000000001",
    job_id: "1",
  };
  const rows = [
    row,
    { ...row },
    { ...row, job_id: "2", result: "Failed for Rat Activity and Other Reason" },
    { ...row, job_id: "3", result: "Passed" },
    { ...row, job_id: "4", result: null },
    { ...row, job_id: "5", result: "Unrecognized" },
    { ...row, job_id: "6", borough: null },
    { ...row, job_id: "7", inspection_date: null },
    { ...row, job_id: "8", inspection_type: "Compliance" },
  ];
  const data = aggregateRecords(rows, Object.keys(row));
  assert.equal(data.citywide.total, 5);
  assert.equal(data.citywide.active, 2);
  assert.equal(data.citywide.unknown, 2);
  assert.equal(data.citywide.percent, 40);
  assert.equal(data.audit.exactDuplicateRows, 1);
  assert.equal(data.audit.taxlotsWithRepeatedVisits, 1);
  assert.equal(data.audit.uniqueKnownTaxlots, 1);
  assert.equal(data.audit.missingOrUnknownBorough, 1);
  assert.equal(data.audit.missingOrInvalidDates, 1);
  assert.equal(data.monthly.Citywide[1].percent, null);
});
test("snapshot counts, monthly marks and denominators reconcile", () => {
  const d = JSON.parse(
    readFileSync(
      new URL("../public/data/inspections-2025.json", import.meta.url),
    ),
  );
  assert.equal(d.status, "available");
  assert.equal(d.citywide.total, 144313);
  assert.equal(d.citywide.active, 25677);
  assert.equal(
    BOROUGHS.reduce((n, b) => n + d.boroughs[b].total, 0),
    d.citywide.total,
  );
  for (const b of ["Citywide", ...BOROUGHS]) {
    const a = b === "Citywide" ? d.citywide : d.boroughs[b],
      months = d.monthly[b];
    assert.equal(months.length, 12);
    assert.equal(
      months.reduce((n, m) => n + m.total, 0),
      a.total,
    );
    assert.equal(
      months.reduce((n, m) => n + m.active, 0),
      a.active,
    );
    for (const m of [a, ...months]) {
      assert.equal(m.known + m.unknown, m.total);
      assert.equal(m.percent, percentage(m.active, m.total));
    }
  }
  assert.equal(
    d.audit.sourceRows2025,
    d.audit.exactDuplicateRows +
      d.audit.nonInitialRows +
      d.audit.includedInitialInspections +
      d.audit.missingOrInvalidDates +
      d.audit.missingOrUnknownBorough,
  );
});
test("newspaper gift persists and stays unique", () => {
  const s = fresh("Pip", "Gray");
  assert.equal(collectNewspaper(s), true);
  assert.equal(collectNewspaper(s), false);
  const store = {
    setItem(_k, v) {
      this.value = v;
    },
    getItem() {
      return this.value;
    },
  };
  save(s, store);
  const restored = load(store);
  assert.equal(collectNewspaper(restored), false);
  assert.deepEqual(restored.inventory, ["newspaper"]);
});
