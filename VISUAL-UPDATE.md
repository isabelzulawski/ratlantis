# Illustrated visual update

**Latest polish:** see [POLISH-NOTES.md](POLISH-NOTES.md). Direct unlabeled inspection, mouth-held pizza dragging, brighter Times Square and the simplified opening screens supersede the earlier interface description below.

The opening now uses generated, textured ink-and-gouache artwork matching the supplied reference's blue-and-gold palette, mottled brick, weathered metal, glowing lanterns and discarded-object architecture. This is a playable art pass, not a claim that all production artwork or animation is final.

## Changes

- Replaced the flat procedural city, neighborhood, station, train and sewer backgrounds with detailed raster illustrations.
- Replaced the geometric rat with textured fur, a fabric backpack, idle/walk/jump/fall poses and fur tints. The animated visual is separate from the fixed physics body.
- Replaced pizza, subway map, boat, theater poster, planks and backpack pictures with illustrated assets.
- Replaced the former serif UI typography with Avenir Next / Trebuchet / system sans-serif, restrained dark panels and softer gold accents.
- Added subtle motes and edge shading. Actual ledges remain marked and separate from background decoration.
- Billboard art is decorative; a small visible **Inspect billboard** cue opens its choices. Interaction requires a press and release on the same object without a drag. Releasing movement over an object does not inspect it. Interface gestures clear pending world interactions.

## Artwork provenance and replaceable files

Generated with the built-in **imagegen** tool using the original local image as a style reference. Final prompts are preserved in `public/art/generation-prompts.json` and `public/art/title-generation-prompt.txt`. Project-bound PNG assets are in `public/art/` with `-v2` filenames; the original reference is unchanged.

- `title-wordmark-v2.png`: hand-lettered gold Ratlantis title.
- `times-square-v2.png`: empty illustrated street and theatrical wall.
- `neighborhood-v2.png`: café, repairs, depot and alcove homes; animated rats are separate.
- `subway-v2.png`: deserted entrance and platform.
- `sewer-arrival-v2.png`: inaccessible entry pipe, boat, ledge, dim tunnel and warm reveal.
- `train-interior-v2.png`: empty carriage; its static window vista is covered in the game by animated dark tunnel windows.
- `rat-poses-v2.png`: transparent six-pose character atlas.
- `props-v2.png`: transparent illustrated prop atlas, including rat-only audition poster.

Atlas frames are defined in `src/art/assets.js`. Background placement is in `src/art/world.js`; it never determines collision geometry. Scene data and original scope remain unchanged. Existing saves use the same storage key and remain compatible.

## Creative choices and limits

New creative liberty was used for the visual composition, shop furnishings, architectural details, poster rat/bow tie, distressed lettering, character rendering, UI styling and ambient motes. No new quest, recipient, route, story reward or later chapter was added. Existing provisional dockworker wording is unchanged.

Generated poses provide a small illustrated animation set, not a final animation production sheet. Six fur choices use runtime tints/preview filters on one base rat illustration; bespoke recolored character sheets remain a possible final-art refinement. Some generated scene decoration has perspective or geometry that differs from exact collision surfaces, so playable edges and interactive cues are explicit. Asset PNGs favor local visual quality over download size; web compression can be a later production pass.

## Verification

Five state/interaction tests include rejection of release-only, dragged, mismatched-target and blocked object interactions. Browser regression checks cover the complete opening, movement, UI isolation, ground pizza dragging, duplicate collection prevention, invalid item returns, camera scrolling, transitions, falling, save/Continue and New Game protection. The billboard regression checks ordinary center clicks, releases over the billboard artwork, and closing the backpack before another center click. Generated images were inspected for style, transparency and absence of humans.
