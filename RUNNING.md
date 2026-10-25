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

See `BUILD-REPORT.md` for the original opening's implementation notes.
The README is an audience introduction. Current City Records methodology is in NEWSPAPER-DATA-GUIDE.md. See `PARK-DATA-REPORT.md` for the extension's creative decisions and validation.

## Local data presentation

Open `/?data=newspaper` for the interactive three-spread newspaper. This mode does not start the game or alter saves. D3 charts, map selections, borough filters and the paper scrap interaction are active. Normal `/` opens the adventure.

Run `node tests/living-newspaper-browser.mjs` against a running server. `RATLANTIS_TEST_URL` selects a different URL. The older `data-browser.mjs` and `data-browser-d3.mjs` describe retired versions and are not current acceptance checks.

The current newspaper loads the bundled initial-inspection CSV (normally its gzip copy), not the older JSON summary and not a live data API. Run `node scripts/audit-newspaper-data.mjs` to check the current data. `npm run data:refresh` and `npm run data:cached` belong to the earlier acquisition/JSON-summary pipeline; they do not regenerate the CSV used by the current newspaper. See [NEWSPAPER-DATA-GUIDE.md](NEWSPAPER-DATA-GUIDE.md) before replacing data.

# GitHub Pages

The `Deploy Ratlantis to GitHub Pages` workflow builds and publishes `dist` on every push to `main`.
In repository Settings → Pages, set Source to **GitHub Actions**. The live game is
https://isabelzulawski.github.io/ratlantis/.

The Pages build uses `/ratlantis/` as its asset base; local development continues to use `/`.
To preview the Pages build locally, run `GITHUB_ACTIONS=true npm run build` then
`GITHUB_ACTIONS=true npx vite preview` and open `/ratlantis/` on the preview server.



Brooklyn chapter checks: `node tests/brooklyn-browser.mjs` while the local server runs (or set RATLANTIS_TEST_URL to a production preview). Editable dialogue, pitches and melodies are in src/data/brooklyn.js. See BROOKLYN-CHAPTER.md.

Full route checks: `node tests/finale-browser.mjs` and `node tests/accessories-browser.mjs` with the server running. Final chapter dialogue/cue settings: src/data/finale.js. See FULL-GAME-REPORT.md for provisional details and new artwork.

### Illustrated shader look

The WebGL camera uses a single subtle color/texture pass: restrained saturation,
navy shadows, warm highlights, static fine grain and a light edge vignette.
The look is always enabled with WebGL; the old toggle and saved off preference
are no longer used. Canvas renderers retain
original artwork. HTML dialogue, backpack and newspaper/D3 are not filtered.
Edit `src/rendering/IllustratedPipeline.js` (`LOOK` strengths and GLSL) to tune it.
No bloom, blur, flashing grain or sprite halos are applied.
Run `node tests/shader-browser.mjs` with a server on port 5182 (or set
`RATLANTIS_TEST_URL`) for the WebGL/always-on/reload/scene-transition check.

Fitted costumes: edit attachment points in `src/art/costume-registration.js`;
shared preview/world composition is in `src/art/costume-fit.js`. Full generated
portraits/layers and prompts are listed in `FULL-GAME-REPORT.md`. Run
`node tests/costume-browser.mjs` against port 5182 (or `RATLANTIS_TEST_URL`).


## Final readiness checks

After `npm test` and `GITHUB_ACTIONS=true npm run build`, start the Pages preview with `GITHUB_ACTIONS=true npx vite preview --host 127.0.0.1 --port 5196`. For each browser check, set `RATLANTIS_TEST_URL=http://127.0.0.1:5196/ratlantis/`.

Current browser scripts: `browser-check`, `brooklyn-browser`, `finale-browser`, `accessories-browser`, `costume-browser`, `arrival-browser`, `exploration-polish-browser`, `shader-browser`, `living-newspaper-browser`, `persistence-browser`, and `layout-browser` (all in `tests/`, with `.mjs` extensions). They use isolated Chrome contexts. Later-chapter tests seed state to target edge cases. The layout check does not certify touch gameplay. Desktop mouse is the supported prototype input.

If browser storage is blocked, a new game remains playable but will not survive a reload. Pause & help reports save failure. Malformed saves return to Begin rather than offering a crashing Continue route.
