# Quiet background pass and connected vent ending

October 15, 2026 · local implementation, not deployed.

The acting director now has the protagonist’s rounded natural rat proportions,
short hind legs and pink paws, pointed muzzle and small dark eyes. A short navy
vest, muted burgundy tie, spectacles and script retain his identity. His closing
line is now: “Good. Crawl through the pipes back to Manhattan. Keep going until
you see a warm light. That's the vent to the audition room.” The journal uses the
same direction.

## Art direction and assets

Repainted every world background using the station and train as style references:
fewer tools, boxes, lights, skyline windows, reflective streaks and speckled
surfaces; broad matte painted shapes, more subdued navy and ochre, and quiet
space behind characters. The subway scenes received a lighter cleanup to keep
their existing character. The title shares the revised neighborhood artwork.
All paintings remain generated, provisional artwork; this is an art-direction
pass, not a claim that they are hand-drawn final assets.

Source PNGs and runtime WebPs are in `public/art/` with these stems:

- `quiet-street-v1`, `quiet-downtown-v1`, `quiet-park-v1`
- `quiet-station-v1`, `quiet-ride-v1`, `quiet-pipe-v1`
- `quiet-sewer-v1`, `quiet-neighborhood-v1`
- `quiet-bridge-v1`, `quiet-brooklyn-v1`, `quiet-ferry-v1`
- `quiet-queens-v1`, `quiet-conduit-v1`, `quiet-vent-v1`
- `quiet-auditionRoom-v1`, `quiet-director-v1`, `quiet-grate-v1`

Generated with the built-in imagegen tool. Full final prompts are saved in
`public/art/quiet-art-pass-prompts.json`. Previous versions remain intact.
Backgrounds remain separate from characters, props, collision geometry and UI.
The newspaper articles, D3, data and methodology are unchanged.

## Ending

The service pipe leads to a separate warm-lit vent screen. Approaching or
clicking the nearby grille opens it on its hinge, then reveals a third view:
the open pipe lip looking into a human-scale empty audition room. The rat stays
at the vent. The room remains visible; there is no forced fade to black or large
modal panel. A small paper end card offers return travel, while movement on the
safe vent ledge, backpack and HUD remain available. Moving back left reconnects
to the pipe route. No humans, audition performance or explanation of the rat’s
misunderstanding is added.

The room layout (one large chair, music stand, curtain, warm floor light), grille
hinge timing (1.1 seconds) and end-card delay (2.2 seconds) are provisional staging
choices. The new behavior is in `src/chapters/AuditionArrival.js`; authored scene
geometry is in `src/data/config.js`. Uniform background crops align painted pipe
floors and the metal vent lip with physics rather than squeezing the paintings.
The vent lip uses its painted metal surface, not a decorative wooden platform.

Version-1 saves remain valid, including saves already at the old vent. New flags
`ventOpened` and `auditionRoomReached` persist alongside the existing `finished`
flag; journal rewards remain unique. Continue restores an authored safe spawn.
Falling from the vent ledge recovers without losing inventory.

## Verification

- `tests/browser-check.mjs`: opening route, pizza, inspection, camera, UI,
  movement, falls and Continue.
- `tests/finale-browser.mjs`: ferry rhythm, retries/muted cues, costume choices,
  acting/checkpoint, revised ending, return and travel.
- `tests/arrival-browser.mjs`: new director/directions, pipe exit, grille
  animation, unobscured room ending, UI input lock, safe reload/fall recovery,
  inventory preservation and end-card cleanup.
- Sixteen unit tests, production build and whitespace checks pass.

The existing Phaser bundle-size warning remains; there are no new dependencies.
