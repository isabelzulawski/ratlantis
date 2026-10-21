# The City Records: living newspaper

This optional newspaper now leads with three short fictional editorial spreads. The existing worn two-leaf artwork and folded-corner page controls remain. Each spread has a single tactile discovery; the full supplied article and source notes are available through **Read the full story & sources**. No quest, skill, or travel gate has been added.

- **Queens takes the crown:** change between total rat-activity findings and percentage of initial inspections recording findings. Bars retain the same borough order and zero baseline; the crown moves to the actual leader for the chosen measure. Changing the ranking automatically selects its winning borough in gold (Brooklyn for finding counts, Queens for percentage). Select a bar to carry another borough into the monthly spread. Exact findings, inspections, and percentages are shown in the ink detail box, hover titles, and accessible labels.
- **December shocker:** drag the paper tongue out of its sleeve (or click/tap the tab) to uncover August and December side by side. Select another borough or choose **All boroughs** to compare all five lines on the same scale. Each line has a named legend entry and a distinct dash pattern as well as color. Click a month for exact counts beside the chart. The December headline, large percentage and contextual clipping always describe Queens, independently of the chart selection. The conditional correction only says “A higher percentage. Fewer recorded findings.” when both comparisons are true. Missing months remain gaps. The revealed clipping has its own space below the chart, leaving axes and marks unobscured.
- **Rats everywhere?:** move/click the magnifying glass over the real inspection map. Lift the paper flap to show the blue inspection footprint beneath red findings. Both layers can be toggled independently. Arrow keys move the focused map lens. The lens magnifies fixed source locations; no points drift or represent individual rats. Fictional squirrel handwriting is separated from the data.

## Files to edit

- `src/data/living-newspaper.js`: commented D3 drawing functions, headlines, controls, linked selection, detail text, map lens.
- `src/data/living-newspaper-model.js`: pure calculations, borough order, date conversion, monthly aggregation.
- `src/data/living-newspaper.css`: newspaper-only typography, ink colors, paper clippings, layout.
- `src/data/Newspaper.js`: game pause/close wrapper and page turns.
- `src/data/newspaper-articles.js`: unchanged full supplied article text and sources.
- `src/data/newspaper-visualizations.js`: original chart implementations retained, with their existing cached CSV loader exported for reuse.

## Data integrity

The supplied `public/data/rats_2025_initial.csv` and byte-equivalent compressed file are unchanged. No replacement data or new sampling is used. Calculations preserve the original row-based denominator and result predicate (`RESULT.toLowerCase().includes('rat activity')`, covering the two documented positive labels). Unknown/empty outcomes stay in the included inspection denominator; no wording labels them negative. Repeat visits are inspection events, not automatically duplicates. The borough/monthly charts include records without coordinates. The map keeps the original coordinate bounds (latitude 40.45–40.95, longitude −74.3–−73.65), reports exclusions, and uses the same local official borough geometry.

The local snapshot has 144,314 initial visits. Queens has 1,883 findings / 7,355 visits; Brooklyn has 10,058 findings / 57,893 visits. Queens August has 433 / 2,400, December 110 / 287. The map includes 140,764 visits and 24,815 findings, with 3,550 visits excluded for coordinates. Counts refer to inspection events; coverage is not random, empty space is not evidence of no rats, and inspection results are not a rat census. Failure to retrieve the local data produces a visible unavailable state with no fabricated chart.

## Access and behavior

Normal game entry remains `/`. The squirrel encounter, park notices and readable backpack item all use the same newspaper wrapper, preserving their existing callbacks. Movement and physics pause while it is open; closing restores the original scene and position. Direct presentation entry `/?data=newspaper` does not load or write a game save. Choices within the newspaper are temporary exploration state, not story progress. Existing game saves remain compatible.

## Verification

`npm test` checks denominator/category handling, missing-month gaps, and existing story/save logic. `node tests/living-newspaper-browser.mjs` checks actual CSV counts, bar/crown switches, full article access, clipping values, borough selection, map layers/lens, resize, unavailable state, backpack reopening, movement suspension, position restoration, and encounter callback. It can target the production preview using `RATLANTIS_TEST_URL=http://127.0.0.1:5183/ratlantis/` after building with `GITHUB_ACTIONS=true npm run build` and serving with `GITHUB_ACTIONS=true npx vite preview --host 127.0.0.1 --port 5183`. This checks GitHub Pages asset paths without deployment.

The two-leaf main edition fits without page scrolling; the optional full-text reader scrolls. Small screens scale the complete spread, so a larger landscape viewport is preferable for reading charts. Motion honors reduced-motion preferences. Controls support clicks/taps and keyboard operation; exact values never depend on hover alone.

## Provisional creative details

The approved three sensational headlines and short editorial corrections have been implemented with an ink crown, an existing rat illustration treated as a print, a draggable paper pull-tab clipping, a hinged paper flap, and a brass-colored magnifying glass. Extra invitation copy and edition labels are editable in the presentation module. All numerical displays derive from the actual supplied CSV; fictional newspaper language and squirrel commentary are not presented as additional findings.

## Interface copy preference

The December spread no longer includes the “A big percentage…” or “Pull the clipping…” sentences. Decorative dot and dash separators have been removed across the game UI, journal, lesson labels, newspaper labels, tooltips and source links. Metadata uses whitespace, line breaks or natural wording. The full articles retain their content and numerical values, with dash punctuation rewritten as words or ordinary punctuation. This standing preference is recorded in `AGENTS.md`; named places, decimal values and chart line encodings are preserved.

The context interaction now unfolds a printed column directly below the Queens figure on the left leaf. Its numerals, fine rules and typography sit on the existing paper; the detached comparison card and sleeve presentation have been replaced. The comparison chart on the right has its larger plotting area restored. Pulling, clicking and keyboard controls still reveal the same fixed Queens August/December counts.

## Loose paper revision

The comparison is now permanently printed on the left leaf and physically covered by a new generated newspaper scrap. Drag the scrap freely in either direction; releasing leaves it at that location. The paper does not snap open or fade away. Click/tap parks or replaces it, arrow keys move it, and Home resets it. The image has torn edges, crinkles and a curled corner, without text overlays. The existing fixed Queens comparison, chart filters and all source data are unchanged. This replaces the prior fold and pull-tab interaction descriptions above.

Generated with the built-in image_gen tool. Final alpha-preserving PNG: `public/art/newspaper-loose-scrap-v1.png`. The exact prompt and generation options are recorded in `public/art/newspaper-loose-scrap-v1-prompt.json`. The image is checked into the local project rather than referenced from the generation cache.

## Map comparison revision

The decorative flap and duplicate layer checkboxes have been removed. Printed controls now switch clearly between inspection visits, rat-activity findings and both layers. Blue/red ink is stronger, and the map title and source totals follow the view. The magnifying glass now reports real visit counts, finding counts and their percentage inside its sampled circle. These are inspection events, not individual rats or a neighborhood population estimate. Empty circles say no mapped inspections. The glass magnifies by 1.9x, so counting uses a source-map radius of 68/1.9 pixels around the same center; all views use identical point coordinates. Layer images are cached to keep movement responsive.
