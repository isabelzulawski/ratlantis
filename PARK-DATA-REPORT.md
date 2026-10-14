# Washington Square Park and City Records

The local opening now follows Times Square → animated downtown travel → Washington Square Park → Broadway–Lafayette subway/train → accidental drainage descent → Ratlantis. Later performance mentors and the final vent remain planned. No publishing or deployment was performed.

The small park has a bench, tree, background arch, squirrel and clickable layered lamppost posters. The supplied conversation gives a persistent readable newspaper; the map is now beyond the squirrel in the park. Both the encounter and data reading are optional. A returning save retains its original scene/progress; old saves already underground are not reset to force the new encounter.

City Records uses D3-rendered bars, monthly lines and official NYC borough geometry. Comparison metrics, selected borough, newspaper map, summary and trend share one state. Hover, focus, click and tap expose exact counts. Reading panels pause physics, timers, world input and animation, and closing returns to the same position. Newspaper closing returns to the backpack. The standalone `?data=newspaper` entry starts no game scene and never reads or writes adventure saves.

The complete real-data snapshot includes 144,313 initial 2025 inspection events and 25,677 active-sign outcomes after cleaning. The combined rat-activity-and-other-reason category is included. All included outcomes are recognized; missing/unrecognized outcomes remain explicitly separate in the model and would stay in the documented all-event denominator. No data values were fabricated. The source temporarily returned HTTP 503 during acquisition; cached ordered pages plus retries completed retrieval, and an independent server aggregate matched the raw initial groups. See README section 18 and `public/data/inspections-2025.json` for the full audit, retrieval timestamp, category values and limitations.

Reproduction: `npm run data:refresh`; exact cached rebuild: `npm run data:cached`. Raw event pages remain in ignored `.data-cache/`, outside player downloads. Source updates can change future historical snapshots. Runtime failure shows an unavailable panel while the adventure remains playable.

Visual assets are generated prototype illustrations, not claimed as final: `public/art/washington-square-v1.png` and `public/art/squirrel-v1.png`. They were created with the built-in imagegen tool; their prompts are retained in `public/art/park-generation-prompts.json`. Interactive posters and the newspaper inventory icon are separate editable graphics. Data marks are live SVG, never chart images.

Provisional creative/visual decisions introduced:

- Park composition and the squirrel's gray-brown appearance/standing pose.
- A short panning downtown travel scene using the existing aboveground art; no new story dialogue.
- Weathered notice layout, newspaper masthead “The City Records”, and “Downtown →” / “Subway →” directional cues.
- “goold” corrected to “good” in the supplied squirrel line; the last two squirrel lines and handwritten margin comment remain exact.
- The map is freely inspectable without completing the squirrel conversation, keeping the encounter/data optional.
- Existing park-exit fallback reuses “I should take another look around.”; no additional conversation was invented.

The new README describes the implemented route, source methodology and both entry modes; other full-adventure chapters remain the future design specification.

Scene cleanup also fixes an existing lifecycle bug: `DisplayList.removeAll(true)` only removed rendered objects and skipped removal callbacks. Old clickable props could intercept input in later scenes. The implementation now destroys scene objects, including their input and physics bodies, when transitioning.

Verification completed:

- All 10 unit checks pass, including documented denominators, duplicate versus repeated-property visits, missing outcomes/months, newspaper persistence and existing control rules.
- Full opening browser check passes: normal title/creation, pizza grip/one-time packing/invalid drop, billboard, downtown travel, squirrel dialogue and unique gift, park save/Continue, poster/backpack panels, exact map line, subway/train, pipe descent, boat jump, recovery, neighborhood and existing save protection. Departed park targets are confirmed destroyed.
- Data browser checks pass on local development and project-path production preview: actual bar labels and monthly mark positions match the snapshot, official map selection synchronizes views, tap tooltips expose counts, Citywide resets, missing months produce gaps, unavailable retrieval produces no fabricated chart, 1280×900 and 390×844 paper layouts fit, and direct entry leaves existing saves byte-for-byte unchanged. Unknown-outcome denominator semantics are additionally covered by unit fixtures.
- Local production build succeeds; no GitHub push, Pages workflow, publication or deployment was performed.
- Generated park/squirrel assets were visually inspected and contain no humans; chart and paper screenshots were reviewed for readable marks and labels.

Concrete remaining blockers: none for this requested local extension. Park/squirrel artwork, poster composition and the new paper-border/icon graphics are coherent prototype assets that may be replaced later. The game remains designed for desktop mouse controls; data reading additionally supports narrow screens and tap targets.
