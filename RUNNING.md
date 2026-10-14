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
The README now includes the implemented Washington Square Park route and City Records methodology. See `PARK-DATA-REPORT.md` for the extension's creative decisions and validation.

## Local data presentation
The current presentation is a static newspaper. D3 graphs and selection controls are disconnected for collaborative editing; see SECTION-POLISH.md for the retained source files. `tests/data-browser.mjs` verifies the static paper; `tests/data-browser-d3.mjs` is the previous interactive UI reference, not a current runnable acceptance check.

Open the local server's `/?data=newspaper` URL for the Data Visualization class. This mode does not start a game or alter saves. Normal `/` is the adventure entry.

Run `npm run data:refresh` to retrieve and preprocess real NYC records, or `npm run data:cached` to reproduce the existing cached snapshot. The game only loads local summaries. Run `node tests/data-browser.mjs` alongside the existing adventure browser check; `RATLANTIS_TEST_URL` selects a different local server.

# GitHub Pages

The `Deploy Ratlantis to GitHub Pages` workflow builds and publishes `dist` on every push to `main`.
In repository Settings → Pages, set Source to **GitHub Actions**. The live game is
https://isabelzulawski.github.io/ratlantis/.

The Pages build uses `/ratlantis/` as its asset base; local development continues to use `/`.
To preview the Pages build locally, run `GITHUB_ACTIONS=true pnpm build` then
`GITHUB_ACTIONS=true pnpm exec vite preview` and open `/ratlantis/` on the preview server.

Current newspaper: open /?data=newspaper to preview the supplied three-page D3 component. See NEWSPAPER-INTEGRATION.md. Run `node tests/data-browser.mjs` with the dev server running to check it, or set RATLANTIS_TEST_URL to a production preview URL ending with /ratlantis/.
