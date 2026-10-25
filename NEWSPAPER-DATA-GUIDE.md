# How the newspaper uses data

This is the current guide for The City Records in both repositories. The inspection records are real; the rat characters, headlines and generated photographs are fictional presentation.

## Data flow

1. Input: public/data/rats_2025_initial.csv (144,314 inspection visits).
2. Delivery: public/data/rats_2025_initial.csv.gz contains the same CSV bytes.
3. loadInspections() in src/data/newspaper-visualizations.js fetches, decompresses and parses the CSV with D3, caching it for the session. Browsers without DecompressionStream use the uncompressed CSV.
4. summarizeNewspaper() in src/data/living-newspaper-model.js converts rows and calculates borough and monthly summaries.
5. LivingNewspaper in src/data/living-newspaper.js uses the model to draw interactive SVG bars and lines, and a Canvas map.
6. src/data/Newspaper.js manages opening, scaling, closing and page turns. src/data/newspaper-articles.js contains separately written article text and source notes.

The browser uses a bundled snapshot, not a live NYC API feed. Replacing it requires reviewing article figures and rebuilding the gzip copy.

## Source and preparation boundary

Source: [NYC DOHMH Rodent Inspection](https://data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj/about_data). Map geometry: bundled NYC Department of City Planning borough boundaries in public/data/boroughs.geojson.

The supplied CSV was already limited to calendar 2025 and Initial inspections. It is preserved unchanged during integration. The runtime does not acquire source records, repeat type/year filtering, or deduplicate events. Its six fields are INSPECTION DATE, INSPECTION TYPE, RESULT, BOROUGH, LATITUDE and LONGITUDE.

The supplied file does not itself establish its extraction date or complete upstream cleaning history. Do not infer those from an older acquisition script or the schema file.

CSV SHA-256: 9fdac060a70685420562bc167fb50a65973f66151dc39a05729683dec5b831d9.

## Indicator and denominator

The model defines active as row.RESULT.toLowerCase().includes("rat activity"). In this file it matches Failed for Rat Activity and Failed for Rat Activity and Other Reason. Each matching row counts once.

The Boolean indicator is equivalent to 1/0. Its mean is the share of inspection visits with recorded rat activity, not rat population prevalence. The denominator is every included visit in the borough or borough-month. Unknown/empty outcomes would remain in the denominator with active=false; this does not prove absence of rats. The current audited file has no unknown/empty result categories.

The parser accepts the supported 2025 date formats and raises an error for unsupported dates. Missing coordinates become NaN. Empty months have null rates, leaving gaps rather than invented zeros. Calculations retain full precision; the view displays whole percentages.

## Current snapshot audit

After installing dependencies, run:

```sh
node scripts/audit-newspaper-data.mjs
```

This read-only command checks the actual CSV, verifies its gzip copy, exercises the current model and reports counts, fields, result categories, borough/month summaries, coordinate eligibility and a fingerprint. It does not fetch or modify data. Expected snapshot assertions must be reviewed intentionally when replacing the file.

| Measure | Current value |
| --- | ---: |
| Initial inspection visits | 144,314 |
| Rat-activity findings | 25,678 |
| Mapped visits | 140,764 |
| Mapped findings | 24,815 |
| Visits excluded from the map | 3,550 |

The map requires finite coordinates within latitude 40.45–40.95 and longitude -74.30–-73.65. Excluded visits remain in the other chart denominators. The lens samples the same underlying mapped visits.

The checked result is also saved in [docs/newspaper-data-audit.json](docs/newspaper-data-audit.json). Rerun the command to verify it against the current files.

## Why older notes say 144,313

The earlier acquisition pipeline documented removal of an exact duplicate across all 24 original source fields and retained a 144,313-event summary. The current newspaper instead preserves the separately supplied 144,314-row CSV without further deduplication. Use 144,314 for this version.

Only six fields survive in the current CSV. Rows equal across these six fields do not necessarily represent duplicate source events: omitted fields may distinguish them. The audit reports 54 equal six-field rows beyond their first occurrence, but never removes them. Repeated visits to a property also remain separate events.

The older scripts/preprocess-data.mjs, src/data/records-model.js and public/data/inspections-2025.json in the game repository are not the current newspaper input. They may be absent from the standalone repository. Their earlier retrieval metadata should not be presented as provenance for this CSV without a separate lineage check.

## Interpretation and ethics

- Inspected properties are not a random sample of the city.
- More findings can reflect more visits or different inspected locations; the records do not establish causes of monthly changes.
- A map point is a visit, not a rat or necessarily a unique property. Overlapping visits can hide repetition.
- Uninspected areas do not establish absence of rats.
- Coordinates may identify properties. The presentation emphasizes broader patterns without adding resident identities or assigning blame.
- Generated rat images are fictional illustrations, not documentary evidence.

## Which code is active?

| File | Role |
| --- | --- |
| living-newspaper-model.js | Current data conversion and aggregation, independent of the DOM. |
| living-newspaper.js | Current charts, map/lens, filters and paper scrap interaction. |
| newspaper-visualizations.js | Active shared CSV loader followed by retained earlier chart implementations. The current wrapper does not call those earlier builders. |
| Newspaper.js | Current wrapper and animated turns; holds the outgoing page while the next initializes. |
| newspaper-articles.js | Written prose and source notes; update manually if data change. |

All five source files above are in src/data/.

## Styling and typography

CSS import order in Newspaper.js: newspaper.css → flippable-newspaper.css → living-newspaper.css → newspaper-figma.css → newspaper-polish.css. Later rules and selector specificity control the final appearance. The later sheets contain accumulated art-direction overrides, not independent screens. Consolidating these overrides is a future maintenance task; this documentation update preserves rendering.

Fonts: Texturina Bold mastheads, Oranienbaum headlines, and Labrada copy/labels/buttons. Fonts and licenses are in src/data/fonts/.

## Current interactions and verification

- Ranking controls switch counts versus percentages; selecting a bar carries its borough into the monthly chart.
- Borough buttons and monthly points update details. All-borough lines have labels and distinct dash patterns.
- Click the scrap, or release after a meaningful drag, to crumple and discard it. Before discard, arrows move it and Home resets its position. Reopening restores it.
- Map controls switch inspections, findings and both layers; the lens supports pointer and arrow keys.
- Flat corners curl on hover/focus and turn on click. Reduced-motion users get immediate page changes.

```sh
npm test
node scripts/audit-newspaper-data.mjs
npm run build
```

The game repository has tests/living-newspaper.test.js plus browser checks newspaper-polish-browser.mjs, living-newspaper-browser.mjs and newspaper-page-turn-browser.mjs. The standalone repository includes the page-turn browser regression; other checks may be game-repository-only. Run browser checks against a running server and set RATLANTIS_TEST_URL to choose another target. The scripts use Chrome's standard macOS installation path.

The page-turn regression deliberately delays the first map load to check that the outgoing spread remains covered. Passing tests cover their exercised cases, not every possible bug or full accessibility certification.
