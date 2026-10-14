# Theme and interaction revision

- Removed the player's halo, rim-light shader and crossfade ghost sprites. Normal illustrated poses remain registered to the physical foot point. The ordinary dark contact shadow remains.
- Softened background art with a neutral tint, leaving characters and interactive props unaffected.
- Moved the pizza onto the foreground pavement, with a slightly irregular angle, instead of snapping its base onto the straight curb edge. It still grips at the rat's mouth during dragging.
- All story dialogue uses an illustrated paper sheet with worn copper repairs and tactile navy response buttons. Menus and inventory remain separate interface panels.
- Replaced the circus-style poster and duplicated chalkboard text with a single Broadway theater poster reading “ON BROADWAY,” “Ratatouille,” “THE MUSICAL,” and “OPEN AUDITIONS.”
- Updated the map thought exactly to: “Hmm... Broadway-Lafayette station? Isn't Lafayette that guy from that other musical? Sounds like this is the way to go!”
- Replaced floating station-name text with a ceramic mosaic plaque. The consistent station spelling is Broadway–Lafayette. Reference research included [NYC subway tile lettering](https://en.wikipedia.org/wiki/New_York_City_Subway_tiles) and the [artist's documentation of Broadway/Lafayette's tile design](https://melchin.org/signal/).
- Replaced the primitive pipe stripes with a complete illustrated cutaway pipe, and aligned the slide to its visible channel.
- Fixed poster repetition in two ways: a hold longer than 300 ms is not a click, and the actual poster artwork is the only target. Once the audition goal is learned, the poster no longer opens any panel, including after reload. The unrequested repeat art-preview popup was removed entirely.

## Assets and prompts

The built-in imagegen tool produced `public/art/broadway-poster-v4.png`, `public/art/station-mosaic-v4.png`, `public/art/pipe-descent-v4.png` and `public/art/dialogue-paper-v4.png`. Exact prompts are saved in `public/art/theme-v4-prompts.json`. These are generated prototype assets, kept separate from scene geometry and interaction logic.

## Verification

Seven state/interaction tests and the production build pass. The full browser opening passes, with explicit checks for long poster holds, movement releases over it, completed-poster inactivity, absence of player lighting effects, the exact map wording, pipe background presence, pizza dragging and packing, inventory safety, station rendering, travel, recovery, pause and save/Continue. Screenshots include `tests/map-dialogue-v4.png` and `tests/pipe-v4.png`.
