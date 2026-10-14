export const BOROUGHS = [
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
];
// Exact reviewed source categories, including the updated dictionary's combined outcome.
export const ACTIVE_RESULTS = [
  "Failed for Rat Activity",
  "Failed for Rat Activity and Other Reason",
];
export const KNOWN_RESULTS = [
  ...ACTIVE_RESULTS,
  "Passed",
  "Failed for Other Reason",
];
export const percentage = (active, total) =>
  total > 0 ? (active / total) * 100 : null;
export function bucket() {
  return { total: 0, active: 0, unknown: 0, known: 0, percent: null };
}
export function finish(b) {
  b.percent = percentage(b.active, b.total);
  return b;
}
export function aggregateRecords(rows, fields) {
  const seen = new Set(),
    properties = new Set(),
    visits = new Map();
  const boroughs = Object.fromEntries(BOROUGHS.map((b) => [b, bucket()]));
  const monthly = Object.fromEntries(
    ["Citywide", ...BOROUGHS].map((b) => [
      b,
      Array.from({ length: 12 }, (_, i) => ({ month: i + 1, ...bucket() })),
    ]),
  );
  const citywide = bucket();
  const audit = {
    sourceRows2025: rows.length,
    exactDuplicateRows: 0,
    exactDuplicateRowsByType: {},
    nonInitialRows: 0,
    missingOrInvalidDates: 0,
    missingOrUnknownBorough: 0,
    missingResults: 0,
    unknownResults: 0,
    initialTypes: {},
    results: {},
    types: {},
    boroughValues: {},
  };
  for (const row of rows) {
    const key = JSON.stringify(fields.map((f) => row[f] ?? null));
    if (seen.has(key)) {
      audit.exactDuplicateRows++;
      const type = row.inspection_type ?? "(missing)";
      audit.exactDuplicateRowsByType[type] =
        (audit.exactDuplicateRowsByType[type] || 0) + 1;
      continue;
    }
    seen.add(key);
    audit.types[row.inspection_type ?? "(missing)"] =
      (audit.types[row.inspection_type ?? "(missing)"] || 0) + 1;
    if (row.inspection_type !== "Initial") {
      audit.nonInitialRows++;
      continue;
    }
    audit.initialTypes[row.inspection_type] =
      (audit.initialTypes[row.inspection_type] || 0) + 1;
    const date = row.inspection_date;
    if (
      !date ||
      !/^2025-\d{2}-\d{2}T/.test(date) ||
      !Number.isFinite(Date.parse(date))
    ) {
      audit.missingOrInvalidDates++;
      continue;
    }
    const month = +date.slice(5, 7);
    if (month < 1 || month > 12) {
      audit.missingOrInvalidDates++;
      continue;
    }
    audit.boroughValues[row.borough ?? "(missing)"] =
      (audit.boroughValues[row.borough ?? "(missing)"] || 0) + 1;
    // Borough names normalized for case/outer whitespace only; codes are not inferred.
    const borough = BOROUGHS.find(
      (b) => b.toLowerCase() === row.borough?.trim().toLowerCase(),
    );
    if (!borough) {
      audit.missingOrUnknownBorough++;
      continue;
    }
    const result = row.result;
    audit.results[result ?? "(missing)"] =
      (audit.results[result ?? "(missing)"] || 0) + 1;
    const active = ACTIVE_RESULTS.includes(result);
    const known = KNOWN_RESULTS.includes(result);
    if (!result?.trim()) audit.missingResults++;
    else if (!known) audit.unknownResults++;
    for (const b of [
      citywide,
      boroughs[borough],
      monthly.Citywide[month - 1],
      monthly[borough][month - 1],
    ]) {
      b.total++;
      if (active) b.active++;
      if (known) b.known++;
      else b.unknown++;
    }
    if (row.bbl && +row.bbl > 0) {
      properties.add(row.bbl);
      visits.set(row.bbl, (visits.get(row.bbl) || 0) + 1);
    }
  }
  finish(citywide);
  Object.values(boroughs).forEach(finish);
  Object.values(monthly).forEach((months) => months.forEach(finish));
  audit.includedInitialInspections = citywide.total;
  audit.uniqueKnownTaxlots = properties.size;
  audit.taxlotsWithRepeatedVisits = [...visits.values()].filter(
    (n) => n > 1,
  ).length;
  audit.missingTaxlot =
    citywide.total - [...visits.values()].reduce((a, b) => a + b, 0);
  return {
    citywide,
    boroughs,
    monthly,
    audit,
    activeResults: ACTIVE_RESULTS,
    knownResults: KNOWN_RESULTS,
  };
}
