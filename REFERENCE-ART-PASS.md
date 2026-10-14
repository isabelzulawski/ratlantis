# Reference artwork pass

The original “New York Above, Rat City Below-2.png” illustration was used directly as the style reference for new assets generated with the built-in imagegen tool. This is generated working artwork, not a claim of final approved art. Exact prompts are recorded in `public/art/reference-ui-prompts.json`.

The largest Times Square billboard is now painted into the existing building perspective, advertising RATATOUILLE: THE MUSICAL, OPEN AUDITIONS and BROADWAY. The two smaller advertisements and the downtown direction are also painted into the facade rather than floating code-built rectangles. Their hit regions align with the actual painted signs; the audition region is disabled once the goal is learned. Park notices and the subway direction are painted onto the lamppost.

Dialogue uses illustrated textured cream clouds with painted trailing dots anchored to the speaking character. Live text remains crisp, selectable by accessibility tools and visibly uppercase. Grammar and punctuation were corrected in the squirrel exchange. Persistent squirrel and dockworker cues share the same illustrated style. Backpack storage now appears inside an open stitched canvas bag with a physical journal page and illustrated item pictures. Controls use weathered brass-and-navy plaques; paper panels use painted borders. Input blocking and inventory behavior are preserved.

Current artwork:

- `public/art/times-square-v4.png`: integrated billboards and awning direction.
- `public/art/washington-square-v2.png`: integrated lamppost notices and subway sign.
- `public/art/ui-cloud-v3.png`, `public/art/ui-thought-v2.png`: clean dialogue cloud and painted thought dots.
- `public/art/ui-backpack-v2.png`: open canvas bag and stitched journal.
- `public/art/ui-control-v2.png`: shared illustrated control plaque.
- `public/art/newspaper-item-v2.png`: folded newspaper inventory picture.

The styles are in `src/reference-ui.css`; dialogue anchors and backpack markup are in `src/ui.js`. Scene click regions are in `src/scenes/Opening.js`. Generated pictures and live text remain separate so artwork can be replaced without rewriting story or input logic.

Verified: all 10 unit checks; full opening browser checks for mouse hold/release, upward jumps, UI input isolation, pizza collection once, invalid inventory drops, camera scrolling, route transitions, falling recovery, newspaper acquisition and reload, and saved Continue progress. Static newspaper desktop/mobile checks, direct-entry save protection and honest unavailable-data handling also passed. The final production build and whitespace checks passed. Final cloud and backpack screenshots were inspected, including the cleaned thought dots and naturally proportioned squirrel cue.

Provisional creative details: generated interface and background artwork; smaller billboard jokes “Only Murmurs in the Walls” and “The Eras of Cheese.” These are decorative references, with no new story rewards or mechanics. The existing running animation still uses two poses. The newspaper remains static for the planned collaborative D3 work. No publishing or deployment was performed.
