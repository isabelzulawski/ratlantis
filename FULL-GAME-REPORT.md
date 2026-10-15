Latest revision — October 15: see `QUIET-ART-ENDING.md`. The quiet background pass, natural rat director, revised pipe directions and connected opening-vent/room ending supersede earlier descriptions below, including the forced fade-to-black ending.

Latest revision: bridge collectibles and bridge-arrow pictogram removed; ferry loose-object activity removed. Ferry rhythm lesson starts directly from the worker with the revised dialogue. Busker greeting and gift shortened; ticket-back pop-up removed. See README’s latest revisions for current wording. Historical implementation details below are superseded where they describe these removed features.

# Remaining Level One chapters

The existing opening and Brooklyn chapter now continue through the ferry, Queens theater, service conduit and silent audition-room vent. No humans or final audition performance were added. The Broadway misunderstanding stays unresolved. This build is local; no commit, upload or deployment was performed.

## Route and progression

- The Brooklyn alcove’s right-hand boarding passage opens the ferry with the earned ticket. The ticket stays in the backpack for reading and revisiting.
- The ferry worker’s rat-maintained nook contains three loose objects. Drag the brass bolt (“Clive”), washer and cork into the rope-edged tray. They slide gently until secured, remain visibly stored and cannot be secured twice. Wrong drops return to the deck; dragging never controls the player.
- One three-cue practice precedes the eight-cue dance. Left/right/jump marks approach a gold line slowly; each has a ±700 ms window. Five hits complete the lesson. Misses never interrupt the run, and unsuccessful runs immediately offer retry. The controls also light up, so muted play works. Completed practice and dancing persist; interrupted main routines restart their eight cues.
- The far-end ferry passage leads to the Queens electrical-cabinet theater once dancing is learned. The director opens the dressing rail: all nine README pieces are available at once, with independent head/body/prop slots, preview and removal. Outfit choice never affects success. Clothing remains available from the HUD Wardrobe button.
- Acting covers joy, sorrow and anger through selectable lines. Wrong lines retry the current feeling. Correct feelings save individual checkpoints and perform short generated expressive poses before returning to idle. Completing the three earns acting and directions toward Manhattan.
- The service conduit leads to the vent. The player remains on the pipe side of the bars, stands and looks toward the empty chair, warm audition spot and curtain. Ambient sound is muted in this scene. A short silent hold fades to “End of Level One.” Returning to Ratlantis is a replay/navigation option, not more story beyond the vent.
- Both physical return routes and the HUD Paths map support revisiting. Only already-visited locations appear as shortcuts.

## Accessories and saving

Optional crooked jewelry-ring glasses are on the underground repair-shop high shelf; the existing optional ledge can reach them. A scarf and bottle-cap hat are along the bridge; a subway-token pendant is in Brooklyn. They are unique collectibles and can be equipped/removed in Wardrobe. The cap shares the costume head slot visually; a costume hat takes precedence. Glasses can combine with a hat, while scarf/pendant share a neck slot. Clothing and accessories are saved independently of lesson success.

Version-1 saves and the existing save key remain supported. New fields are initialized when needed: secured objects, dance-practice/skill flags, acting round/skill, outfit, accessories/equipment, visited paths and finished status. Story rewards and journal entries are unique. The earlier “ferry unavailable” journal wording is updated on scene entry. Existing food, pizza, inventory, newspaper and D3 calculations/data are preserved.

## Editable files

- `src/data/finale.js`: working dialogue, emotion prompts/lines, costume names, destinations, dance sequence, timing and success threshold.
- `src/chapters/FinalChapters.js`: route gates, NPCs, deck dragging, accessories, ending and equipment overlays.
- `src/chapters/DanceLesson.js`: practice and timed cue engine, retry and canceled animation-frame handling.
- `src/chapters/finale-state.js`: unique progression operations.
- `src/chapters/wardrobe.js`, `finale.css`: illustrated wardrobe and lesson interfaces.
- `src/data/config.js`, `src/art/world.js`, `src/art/assets.js`: scene geometry, image placement and replaceable asset frames.

## Provisional creative details

These working choices use the creator’s prior permission and remain available for review:

- Ferry: sheltered steel maintenance nook with river windows, ropes, warm salvage lamps and a single storage tray; bolt, washer and cork are the three loose objects.
- Ferry worker: lean rat in a navy work shirt and twine belt, carrying a thread mop; generated standing and dance-freeze poses. Dialogue addresses the mop and identifies the bolt as Clive.
- Queens: electrical cabinet framed by large fuses, wires, scrap curtains, mirror and bottle-cap footlights. Director wears a patched dark coat, wire glasses and pencil.
- Rehearsal uses the proposed royal breadcrumb vignette. Exact lines and choices are in `src/data/finale.js`; they are provisional, including the director’s route directions.
- Dance practice: left/right/jump. Main sequence: left, right, jump, left, jump, right, left, jump. Cues lead by 3.2 seconds, spaced 1.7 seconds apart; acceptance window ±0.7 seconds. No missed-step penalties beyond the required five hits.
- All nine costume pieces are the README proposals. Cape/vest/sash/headgear/props are illustrated overlays with simple pose following, not a full rigged animation system. The optional bottle-cap hat reuses the cap-crown artwork.
- The optional scarf/cap/pendant placements, accessory-slot compatibility, service-conduit layout and 3-second silent hold/1.5-second final fade are provisional implementation choices.

## Generated artwork and prompts

All new images were created with built-in imagegen using the existing Ratlantis artwork as direct style references. PNG originals and same-dimension WebP runtime siblings are saved under `public/art/`:

- `ferry-deck-v1.png`
- `queens-theater-v1.png`
- `audition-conduit-v1.png`
- `audition-vent-v1.png`
- `final-mentors-v1.png`
- `costume-pieces-v1.png`
- `ferry-accessories-v1.png`
- `acting-emotions-v1.png`

Exact prompts: `public/art/final-chapters-prompts.json` and `public/art/acting-emotions-prompt.json`. This is generated working artwork, not final approved art. The existing generated salvage-tin board is reused for the dance/wardrobe UI. Backgrounds, collision geometry, characters, costume frames and interface logic remain separate.

## Verification

- 16 unit tests: save compatibility, unique rewards/items, 3/4/5-note singing, five-of-eight dance, all nine costumes and emotion checkpoints.
- `tests/finale-browser.mjs`: actual deck-object drags, storage reload, muted practice, failed dance/retry and five hits, all costume choices, wrong acting response, acting reload, conduit/vent ending, return and visited map.
- `tests/accessories-browser.mjs`: high-shelf pickup, equip, reload and unvisited-map gating.
- Existing opening, Brooklyn and newspaper browser checks pass, including original controls, both food options, inventory input isolation, lesson retries, saves, full chart values and direct data-entry save protection.
- Production build passes with the GitHub Pages `/ratlantis/` base path. Artwork and interfaces were visually reviewed for surface alignment and readability. Expression poses were checked separately, including restoration of the normal player.

No concrete implementation blockers remain. Provisional dialogue/artwork, costume alignment and animation style remain creative review items. No later level or story beyond the vent has been invented.

### Ferry worker anatomy revision

Replaced the worker’s two humanoid poses with a separate rat-proportioned atlas:
`public/art/ferry-worker-v2.png` (source) and `.webp` (runtime). Generated with the
built-in imagegen tool using the protagonist atlas as anatomy/style reference;
full prompt: `public/art/ferry-worker-v2-prompt.json`. Navy vest and twig/thread
mop remain; trousers, long human legs and human hands are removed. Registered
both poses to the same floor baseline; idle stays still, with sway only during
the dance lesson. The director's artwork is unchanged. Artwork remains editable
and provisional. Chrome pose/conversation/input-lock check and production build
pass (`tests/worker-browser.mjs`).

### Fitted wardrobe artwork — October 15

The director now says “Every audition needs a costume! Try anything on the rack.
There is no wrong outfit.” The “The dressing rail” heading is removed.

- Added nine imagegen portraits of the player wearing/holding each rack item:
  `public/art/costume-portraits-v1.png` and runtime `.webp`.
- Replaced generic inventory-icon overlays with twelve fitted six-pose sheets:
  `public/art/fitted-{crown,paperHat,helmet,cape,vest,sash,staff,sword,flower,glasses,pendant,scarf}-v1.png`
  and their runtime `.webp` siblings. The original player atlas is the anatomy,
  pose and style reference. New art is provisional and remains replaceable.
- Full built-in imagegen prompts are in `public/art/fitted-costume-prompts.json`.
- `src/art/costume-registration.js` holds editable per-pose attachment points.
  `src/art/costume-fit.js` composes fitted frames for both the preview and game,
  matching authored player frame bounds, foot anchors, facing and squash.
  Original player forepaws render in front of garments and held objects.
- Outfits remain mixable across head/body/prop slots, and existing saved choices
  and accessory equipment continue working. Dressed acting uses the existing
  registered protagonist performance poses, retaining the selected costume;
  undressed acting retains the separate emotion illustrations.
- Runtime costume canvases use half-resolution (ample at player/preview sizes)
  and release full-resolution source textures after composition. The new WebP
  artwork totals about 1.7 MB; PNG originals are retained for editing.
- Verified all nine selections, six poses in both directions, matching preview,
  save/reload, acting rehearsal and final scene. Production build and unit tests
  pass. Visual contact sheets are generated by `tests/costume-browser.mjs`.

Local changes only; not uploaded or deployed.

### Patchwork vest replaced with navy waistcoat

The `vest` save ID now selects **Navy waistcoat**. This uses a fully drawn dressed
protagonist atlas, `public/art/rat-waistcoat-v1.png` and runtime `.webp`, rather
than the detached garment overlay. Each of the six original poses was edited
with built-in imagegen to integrate a short matte navy waistcoat, cream seam and
small brass button under the backpack straps and forepaws. Prompt:
`public/art/rat-waistcoat-v1-prompt.json`. Original pose registration, fur choice,
hats/props, saved selection, and movement remain compatible. Wardrobe thumbnail
and preview use the new dressed artwork. The obsolete vest overlay is no longer
loaded or rendered. Existing speech bubbles/buttons remain unchanged; the soft
UI proposal remains a separate sample only. New artwork remains provisional.

Verified all six poses in both directions, mix-and-match preview, saved outfit
restoration, production build and all 16 unit tests.
