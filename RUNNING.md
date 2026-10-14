# Run Ratlantis

Requires Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://127.0.0.1:5173). All transitions stay inside that page. Desktop mouse input is the supported input for this prototype.

```sh
npm test
npm run build
```

The production files are in `dist/`. Serve that directory using a static web server. Progress is stored in this browser's localStorage under `ratlantis-opening-v1`. Continue restores each scene's authored safe spawn rather than an arbitrary mid-jump position. Browser storage must be available for persistence.

## Project organization

- `src/data/config.js`: scene dimensions, platform geometry, movement values, fur palette, dialogue, item definitions.
- `src/scenes/Opening.js`: Phaser scene lifecycle, input separation, transitions, progression, safety recovery.
- `src/art/assets.js`: raster asset loading, sprite frames and fur tints.
- `src/art/world.js`: illustrated background placement, lighting details and playable-surface drawing.
- `public/art/`: generated raster artwork and the exact generation prompts.
- `src/interaction.js`: matched-gesture rules that prevent incidental dialogue.
- `src/input/Movement.js`: mouse hold/release movement and jump tuning.
- `src/objects/Pizza.js`: click-to-pack and dedicated mouth-drag gesture.
- `src/art/RatVisual.js`: registered poses, stride blending, shadow and player rim light.
- `src/ui.js`, `src/style.css`: title, creation, inventory, journal, speech, help, sound.
- `src/state.js`: persistence and idempotent story/item updates.
- `tests/state.test.js`: movement decision and progress invariants.
- `tests/browser-check.mjs`: browser integration checks. Currently uses macOS Chrome at its standard installation path; change `executablePath` for another platform. Run while the dev server is running with `node tests/browser-check.mjs`.

The original README remains the untouched design specification. See `BUILD-REPORT.md` for this section's implementation notes.
