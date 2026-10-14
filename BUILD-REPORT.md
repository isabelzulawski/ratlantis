# First playable section

**Current behavior and latest verification:** [POLISH-NOTES.md](POLISH-NOTES.md).

**Visual revision:** the former procedural placeholder art has been replaced with generated illustrated assets. See [VISUAL-UPDATE.md](VISUAL-UPDATE.md) for the current artwork, input bug fix, provenance, remaining limits and provisional visual decisions. The original implementation notes below describe the first pass.

Implemented only the opening through the explorable initial Ratlantis neighborhood. Later mentors, lessons, ferry, bridge travel, Queens theater, audition ending, optional accessories, and data visualization are excluded.

## What works

Title/Continue and explicit New Game replacement flow; named rat with six muted fur choices and backpack preview; mouse hold movement and upward-release jump with configurable threshold; camera-following Times Square; draggable pizza, one-time packing, picture/name inventory and safe invalid drops; billboard goal choices and map directions; separate Broadway–Lafayette entrance/platform; boarding, animated/skip-able deserted train ride, arrival drainage opening and animated descent; can-boat landing, jump to ledge, dim passage, neighborhood businesses and moving background rats; dockworker cue, replies and Brooklyn journal lead. Pause/help, sound toggle, automatic scene/story/item saves and safe Continue spawn are included.

No food recipient exists in this section, so inventory drops always return the item. Item delivery success is intentionally deferred to the mentor section. There is no automatic food dialogue or recipient suggestion. Onward travel is visibly marked unavailable without a fake exit.

## Temporary artwork and review

All artwork is generated SVG or Phaser Graphics placeholder artwork, not final art. It uses deep blues, amber lighting, brick alcoves, large human-scale street/station objects and discarded-object architecture. The reference informed the palette and materials; its detailed painterly texture is not reproduced. Backgrounds, surfaces, props, rats and HTML interface are separately authored for replacement. Movement uses two procedural poses, with travel/jump motion; final frame-by-frame animation remains to be produced.

## Provisional creative details introduced

- All scene layouts, dimensions, platform placements, business placements, transit geometry and durations (6.5-second ride; 1.9-second descent). No arrival station name is invented.
- Exact fur hex values, rat/dockworker/background-rat appearance, storefront sign styling, billboard arrangement and UI design.
- Billboard subtitle: “A fictional stage production.”
- Title flavor text: “A city beneath the city” and “A small rat. A very large ambition.”
- Dockworker replies, in choice order: “Ratlantis. Mind the deliveries.” / “That entry pipe is too high to reach from here.” / “A retired singer in Brooklyn may be able to help.”
- Journal phrasing: “Goal: try for a Broadway audition.” / “Next destination: Broadway–Lafayette station.” / “This underground neighborhood is Ratlantis.” / “The entry pipe is too high to reach again.” / “Lead: a retired singer in Brooklyn may help. Onward travel is unavailable in this build.”
- Functional feedback and signage: pizza packed confirmation, invalid-target feedback, inspect-first notice, pipe/boarding/location labels, and unavailable-travel notice.
- Synthesized quiet low-tone ambience and brief jump squeak; replacement audio awaits review. No voices or music tracks are supplied.

These are provisional implementation details, not an approved final script or final assets. The player's provided billboard choices, map thought, dockworker cue and response choices are retained verbatim. Selecting the audition reply records the Brooklyn lead; other replies allow the player to reopen the persistent cue and ask more.

## Verification

State tests cover upward versus ordinary release, unique collection and story rewards after serialization, invalid drops preserving inventory, and valid scene definitions. Production build passes. The browser integration check passed the full opening sequence, actual mouse-release jump/stop, UI and object input isolation, ground pizza dragging, duplicate packing prevention, invalid item drops, camera scrolling, all scene transitions, train skip, boat jump, safe fall recovery, save/Continue and New Game cancellation. Artwork source inspection finds no humans, silhouettes, feet or crowds: every character asset is a rat.

## Known limits

Desktop mouse prototype; no touch-specific controls. Saves are local to the browser. If localStorage is blocked or unavailable, persistence cannot work. Placeholder animation and synthesized audio need final production work. The browser integration check uses safe-position setup for some long walks to exercise all transitions efficiently; it does not assess every decorative ledge or final art quality.
