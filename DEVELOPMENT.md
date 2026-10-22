# Ratlantis development

Ratlantis uses JavaScript, Phaser, D3, and Vite. The game and its data assets run in the browser.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The root path starts the adventure. Add `?data=newspaper` to open the newspaper without loading or changing game progress.

## Check and build

```sh
npm test
npm run build
```

The production output is written to `dist/`.

With a local server running, focused newspaper checks are:

```sh
node tests/newspaper-polish-browser.mjs
node tests/newspaper-page-turn-browser.mjs
node tests/living-newspaper-browser.mjs
```

Browser scripts use an isolated Chrome context and currently reference the standard macOS Chrome installation. Set `RATLANTIS_TEST_URL` to change their target URL.

## Editing guide

| Area | Files |
| --- | --- |
| World layout and opening dialogue | `src/data/config.js` |
| Movement | `src/input/Movement.js` |
| Game flow | `src/scenes/Opening.js` |
| Brooklyn and final chapters | `src/data/brooklyn.js`, `src/data/finale.js` |
| Newspaper interactions and charts | `src/data/living-newspaper.js` |
| Newspaper layout and page turns | `src/data/Newspaper.js`, `src/data/newspaper-figma.css`, `src/data/newspaper-polish.css` |
| Artwork and generation prompts | `public/art/` |
| Audio provenance | `public/audio/README.md` |

## Saving and publishing

Progress uses browser localStorage. The direct newspaper entry does not alter adventure progress.

GitHub Actions builds and deploys this repository to [Ratlantis on GitHub Pages](https://isabelzulawski.github.io/ratlantis/) when `main` changes. The Pages build uses `/ratlantis/` as its base path.

The [standalone newspaper](https://isabelzulawski.github.io/rat-newspaper/) is maintained in its own repository with its own entry point and base path.

## Existing technical documentation

[RUNNING.md](RUNNING.md) contains additional setup and verification notes. [LIVING-NEWSPAPER.md](LIVING-NEWSPAPER.md) and the chapter reports document implementation history; some older sections describe interactions that have since changed.

The original README is preserved in [DESIGN-NOTES.md](DESIGN-NOTES.md), including historical plans, creative constraints, methodology, and revision notes.
