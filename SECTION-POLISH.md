# Billboard, bubbles and newspaper pass

Historical report: the subsequent reference-art pass replaces the code-built signs and interface shapes described here. See REFERENCE-ART-PASS.md for the current implementation. `src/art/signs.js` was removed; the signs are now integrated into the background artwork.

The Broadway artwork is now mounted as the largest Times Square billboard, with a dark metal frame, warm perimeter bulbs, support posts and bracing. Smaller muted billboard references read “Only Murmurs in the Walls” and “The Eras of Cheese.” These are provisional visual jokes, not story additions. Downtown and Subway directions now sit on physical street-sign fixtures.

Dialogue uses cream-and-ink character-anchored thought bubbles with small trailing circles, rather than centered paper popups. Rat choices originate near the player; squirrel and dockworker replies originate near their characters. Persistent NPC cues use crisp browser text in the same bubble style. Dialogue still suspends movement and jumping.

Downtown travel now has a steady pace, a slower two-pose stride cycle tied to actual travel speed, and feet aligned to the 580-pixel playable pavement. The squirrel is lowered to match the illustrated park paving. The Broadway–Lafayette tiled plaque is moved over the platform bench area.

The squirrel first directs the player to the lamppost after “They bring me nuts. Very established relationship.” Closing the paper triggers the supplied rat reaction and squirrel replies. The newspaper is awarded only after the final gift line is acknowledged, once per save. Existing newspaper owners keep their item.

The newspaper is now a static editorial spread: masthead, columns, serif headlines, drop cap, source text, printed figures and the squirrel margin annotation. There are no borough selectors, chart toggles, map interactions or tooltips. Only folding the paper away and ordinary scrolling remain. Posters open the same static paper for now; direct `?data=newspaper` entry remains read-only for game saves.

For collaborative graph work, the existing D3 implementation is preserved but disconnected from the game:
- `src/data/RecordsExperience.js`: comparison(), trend(), boroughMap() and linked-view UI.
- `src/data/records-model.js`: audited aggregation, outcome definitions and denominators.
- `public/data/inspections-2025.json`: real compact snapshot for your graphs.
- `scripts/preprocess-data.mjs`: reproducible acquisition/cleaning.
- `tests/data-browser-d3.mjs`: previous interactive-view checks, retained as a reference for later reintegration; they do not describe the current static UI.

The current newspaper renderer is `src/data/Newspaper.js`, styled by `src/data/newspaper.css`. Scene fixtures live in `src/art/signs.js`; dialogue anchors/styles live in `src/ui.js` and `src/style.css`. No source data was changed. No publishing or deployment was performed.

Verified: all 10 unit checks, full opening browser checks (including read-before-gift progression and saving), static newspaper desktop/narrow-screen checks, direct-entry save protection and unavailable-state handling, and the production build. Screenshots were reviewed for billboard hierarchy, character bubble anchors, pavement contact, the dockworker cue and the tiled plaque. Movement remains paused during dialogue and paper reading. The travel animation still uses the existing two authored running poses; this pass improves pacing and grounding rather than claiming a new complete animation set.
