// Development-only acquisition. Players load compact local summaries, never raw visits.
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { aggregateRecords, BOROUGHS } from "../src/data/records-model.js";
const root = new URL("../", import.meta.url);
const cache = new URL(".data-cache/", root);
const out = new URL("public/data/", root);
const source = "https://data.cityofnewyork.us/resource/p937-wjvj.json";
await mkdir(cache, { recursive: true });
await mkdir(out, { recursive: true });
async function retrieve(url, file) {
  if (process.argv.includes("--cached"))
    return JSON.parse(await readFile(new URL(file, cache), "utf8"));
  if (process.argv.includes("--resume")) {
    try {
      return JSON.parse(await readFile(new URL(file, cache), "utf8"));
    } catch {}
  }
  console.log("Retrieving", file);
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { signal: AbortSignal.timeout(180000) });
    if (response.ok || response.status < 500) break;
    console.log("Retrying transient source error", response.status);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const text = await response.text();
  await writeFile(new URL(file, cache), text);
  return JSON.parse(text);
}
function query(params) {
  const url = new URL(source);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(`$${key}`, value);
  return url;
}
try {
  const metadata = await retrieve(
    "https://data.cityofnewyork.us/api/views/p937-wjvj.json",
    "schema.json",
  );
  const fields = metadata.columns
    .filter((c) => !c.fieldName.startsWith(":"))
    .map((c) => c.fieldName);
  const period =
    "inspection_date >= '2025-01-01T00:00:00' AND inspection_date < '2026-01-01T00:00:00'";
  const rows = [];
  for (let offset = 0; ; offset += 50000) {
    const page = await retrieve(
      query({
        select: fields.join(","),
        where: period,
        order: ":id",
        limit: 50000,
        offset,
      }),
      `2025-${offset}.json`,
    );
    rows.push(...page);
    if (page.length < 50000) break;
  }
  // Missing dates cannot be assigned to 2025. Audit them across the entire source.
  const missingDates = await retrieve(
    query({
      select: "inspection_type,count(*) as n",
      where: "inspection_date IS NULL",
      group: "inspection_type",
      limit: 1000,
    }),
    "missing-dates.json",
  );
  const summary = aggregateRecords(rows, fields);
  if (!summary.citywide.total)
    throw new Error(
      "No included initial inspections; verify the live schema/type values before publishing a snapshot.",
    );
  const crosscheck = await retrieve(
    query({
      select: "borough,result,count(*) as n",
      where: `${period} AND inspection_type = 'Initial'`,
      group: "borough,result",
      limit: 1000,
    }),
    "server-crosscheck.json",
  );
  const rawGroups = new Map();
  for (const row of rows)
    if (row.inspection_type === "Initial") {
      const key = JSON.stringify([row.borough ?? null, row.result ?? null]);
      rawGroups.set(key, (rawGroups.get(key) || 0) + 1);
    }
  if (
    crosscheck.length !== rawGroups.size ||
    crosscheck.some(
      (r) =>
        rawGroups.get(JSON.stringify([r.borough ?? null, r.result ?? null])) !==
        +r.n,
    )
  )
    throw new Error(
      "Source aggregate differs from downloaded rows; rerun retrieval against a consistent source snapshot.",
    );
  summary.audit.serverCrosscheck = {
    matchesRawBoroughResultGroups: true,
    rawInitialInspections: crosscheck.reduce((n, r) => n + +r.n, 0),
    groups: crosscheck,
  };
  const geometry = await retrieve(
    "https://data.cityofnewyork.us/resource/gthc-hcne.geojson",
    "boroughs.geojson",
  );
  // Retain official polygon topology and every vertex; only round coordinates (~1m).
  function round(coords) {
    return typeof coords[0] === "number"
      ? coords.map((n) => +n.toFixed(5))
      : coords.map(round);
  }
  const map = {
    type: "FeatureCollection",
    features: geometry.features.map((f) => ({
      type: "Feature",
      properties: { name: f.properties.boroname },
      geometry: {
        type: f.geometry.type,
        coordinates: round(f.geometry.coordinates),
      },
    })),
  };
  if (
    map.features.length !== 5 ||
    map.features.some((f) => !BOROUGHS.includes(f.properties.name))
  )
    throw new Error("Unexpected borough geometry schema");
  const retrievedAt = process.argv.includes("--cached")
    ? JSON.parse(await readFile(new URL("retrieval.json", cache))).retrievedAt
    : new Date().toISOString();
  await writeFile(
    new URL("retrieval.json", cache),
    JSON.stringify({ retrievedAt }),
  );
  const dataset = {
    status: "available",
    year: 2025,
    retrievedAt,
    source:
      "https://data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj/about_data",
    dictionary:
      "https://data.cityofnewyork.us/api/views/p937-wjvj/files/db5a94f0-213a-479e-b9e5-c6cb73820b4d",
    geometrySource:
      "https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne",
    schemaUpdatedAt: metadata.metadataUpdatedAt,
    rawSha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex"),
    ...summary,
    audit: { ...summary.audit, missingDatesAllYearsByType: missingDates },
  };
  await writeFile(
    new URL("inspections-2025.json", out),
    JSON.stringify(dataset),
  );
  await writeFile(new URL("boroughs.geojson", out), JSON.stringify(map));
  await rm(new URL("retrieval-error.json", out), { force: true });
  await writeFile(
    new URL("schema.json", out),
    JSON.stringify(
      {
        description: metadata.description,
        columns: metadata.columns
          .filter((c) => fields.includes(c.fieldName))
          .map((c) => ({
            name: c.name,
            field: c.fieldName,
            type: c.dataTypeName,
            description: c.description,
          })),
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        citywide: summary.citywide,
        boroughs: summary.boroughs,
        audit: dataset.audit,
      },
      null,
      2,
    ),
  );
} catch (error) {
  // Never replace a previous successful snapshot with fabricated or partial values.
  await writeFile(
    new URL("retrieval-error.json", out),
    JSON.stringify({
      attemptedAt: new Date().toISOString(),
      error: error.message,
    }),
  );
  console.error(
    "Data retrieval failed; any previous valid snapshot is retained.",
    error,
  );
  process.exitCode = 1;
}
