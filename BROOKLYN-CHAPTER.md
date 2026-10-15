# Brooklyn retired-busker chapter

The existing neighborhood now leads right, past the delivery depot, onto a steel maintenance flange beneath a monumental nighttime bridge. Walk right to the Brooklyn busker’s service alcove. Walking left returns through the bridge to the neighborhood, with safe entry positions. Main-route travel is a continuous, easy ledge; falling beyond its ends returns to a recent safe position without changing inventory or progress. The old unavailable-travel sign is now a Brooklyn direction; old saved journal leads are updated when entering a scene.

A discarded bread piece sits beside the food-tin café. Clicking it offers “Pack it” or “Leave it.” Collection is unique. The busker hints that he is hungry, but offers no food dialogue shortcut. Open the backpack and drag pizza or bread onto him while nearby. The backpack fades during the drag, keeping world input locked. Only a successful food exchange consumes an item; all unsuitable targets/items and repeat attempts preserve inventory. Newspaper and ticket clicks remain readable, and their drag gestures return them safely.

After food, click the busker to practice. His salvaged-tin practice board has four labeled bottle-cap note controls, replay, sound and practice-later controls. He demonstrates each fixed phrase with highlighted notes and an animated portrait/world pose; the player’s portrait/world pose reacts when repeating. No rhythm timing is required. Mistakes restart only the current phrase; all retries are unlimited. Completed phrases persist, while partial phrase input restarts on reopening/reload. Opening another interface cancels pending note playback. The same sound setting controls short synthesized notes; the lesson is fully playable muted.

Completing the third phrase records singing. The exact requested ferry-ticket dialogue follows, with the rat and busker’s respective bubbles. The ticket is awarded once after the exchange and remains readable in the backpack. Its reverse reads “Ask for the rat with the mop.” The journal records that lead. If reloaded between earning singing and receiving the ticket, clicking the busker resumes the gift exchange. No ferry scene or onward exit is implemented.

## Editable code

- `src/data/brooklyn.js`: all busker dialogue/choices, pitches, three melodies, note and replay timing.
- `src/chapters/brooklyn-state.js`: unique bread/food/skill/ticket operations and round checkpoints.
- `src/chapters/BrooklynChapter.js`: NPC, bread, route, target validation and gift presentation.
- `src/chapters/SingingLesson.js`, `singing.css`: practice-board UI, canceled timers, visual cues and performance poses.
- `src/data/config.js`: scene dimensions, safe spawns, playable surfaces and inventory definitions.
- Existing `Opening`, `UI`, audio and save modules are extended; the save version/key is unchanged. Newspaper and D3 source code/data are untouched.

## Provisional creative details for review

These are explicitly authorized working choices, not final approved artwork or story:

- Bridge: under-deck riveted steel ledge with a stone tower, cable bundles and distant skyline; 2,400-unit walkable route. No required precision jumps.
- Brooklyn: 1,600-unit old service alcove, rat instruments improvised from a sardine tin, matchsticks, twine, thimbles and bottle caps.
- Busker: grey-brown older male rat, salt-and-pepper muzzle, patched navy waistcoat and worn mustard scarf; two generated idle/demonstration poses.
- Practice board: salvage-tin frame with linen interior and brass bottle-cap note buttons; two portrait/world performance poses, not a full animation set.
- Food: torn bread beside the café; ticket: worn cream printed stub and twine loop.
- Pitches: C4 261.63 Hz, D4 293.66 Hz, E4 329.63 Hz, G4 392 Hz. Fixed phrases: C–D–E; E–D–C–G; C–E–G–E–C. Notes last 500 ms with 220 ms gaps; retry/round feedback lasts 950 ms. Synthesized triangle tones.
- Greeting: “If you're here for a concert, you're twenty years late.”
- Responses: “I'm trying to audition on Broadway.” / “Were you a singer?” / “Am I interrupting?”
- Replies, respectively: “Broadway, eh? I used to fill a whole platform. Might still teach a short phrase. Hard to think on an empty stomach, though.” / “A busker. There's a difference. Twenty years of trains trying to drown me out. Today it's my stomach making the noise.” / “Only my retirement. Not much of a performance these days. Haven't had a bite since morning.”
- After food: “Well. That's better. All right, listen closely. A short phrase is all you need to start.”
- Practice prompt: “Four notes. Listen first, then sing them back in order. Take your time.” Choices: “Let’s practice” / “A little later.”
- Success: “There it is. You've got a voice worth using.” Revisit: “Still remember your notes? I knew you had it in you.” Encouraging round feedback is editable in `SingingLesson.js`.
- Ticket exchange and reverse note are exactly the supplied README/user wording.

## Generated artwork

All five new raster assets were generated with built-in imagegen, directly referencing existing neighborhood/player artwork. The complete prompt set is in `public/art/brooklyn-generation-prompts.json`:

- `public/art/bridge-brooklyn-v1.png`
- `public/art/brooklyn-busker-v1.png`
- `public/art/busker-poses-v1.png`
- `public/art/brooklyn-items-v1.png`
- `public/art/singing-board-v1.png`

Same-size WebP siblings are used at runtime to retain the loading optimizations. Scene collision geometry, sprite frames, backgrounds, UI and story settings remain separate for replacement. The new images contain no humans. This is generated working artwork for review.

## Verification

Unit tests cover both foods, wrong items/recipients, unique bread, old-save defaults, 3/4/5 fixed phrases, saved round checkpoints and nonduplicate skill/ticket rewards. `tests/brooklyn-browser.mjs` covers the physical route and return/revisit, fall recovery, real backpack drags, wrong drops, both food options, muted visual demonstration, replay, mistakes including a later round, checkpoint reload, ticket reading/award and reload. Existing full-opening and newspaper browser checks verify the prior controls and all D3 views/direct-entry isolation remain intact. The GitHub Pages base-path production build is checked locally.

No publishing or deployment is part of this change. The chapter ends with the saved singing skill and ferry ticket. Future ferry, dance, Queens and final audition chapters are not built.
