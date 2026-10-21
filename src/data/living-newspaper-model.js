// Data preparation for the living newspaper: pure functions, no DOM or game state.
// Uses the supplied 2025 initial-inspection CSV, including repeat property visits.
export const ORDER = [
  "Bronx",
  "Brooklyn",
  "Manhattan",
  "Queens",
  "Staten Island",
];
const MONTHS = Array.from({ length: 12 });
// Same supplied CSV, filters and denominator as Isabel's original visualizations.
// Unknown / empty outcomes remain in total; they are not labelled negative.
export function summarizeNewspaper(rows) {
  const converted = rows.map((row) => {
    const date = row["INSPECTION DATE"].trim();
    const match =
      date.match(/^2025-(\d{2})-\d{2}/) ||
      date.match(/^(\d{1,2})\/\d{1,2}\/2025\b/);
    if (!match || +match[1] < 1 || +match[1] > 12)
      throw new Error("Some inspection dates could not be parsed.");
    return {
      borough: row.BOROUGH.trim(),
      month: +match[1],
      active: row.RESULT.toLowerCase().includes("rat activity"),
      lat: row.LATITUDE.trim() ? +row.LATITUDE : NaN,
      lon: row.LONGITUDE.trim() ? +row.LONGITUDE : NaN,
    };
  });
  const count = (records) => {
    const total = records.length,
      active = records.filter((r) => r.active).length;
    return { total, active, rate: total ? active / total : null };
  };
  return {
    rows: converted,
    boroughs: ORDER.map((borough) => ({
      borough,
      ...count(converted.filter((r) => r.borough === borough)),
    })),
    monthly: Object.fromEntries(
      ORDER.map((b) => [
        b,
        MONTHS.map((_, i) => ({
          month: i + 1,
          ...count(
            converted.filter((r) => r.borough === b && r.month === i + 1),
          ),
        })),
      ]),
    ),
  };
}
