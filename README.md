# Ratlantis

*A small rat in a big city with a Broadway dream!*

Ratlantis is an AI-illustrated browser adventure, set in New York City and the hidden rat society beneath it. A curious rat spots a Broadway audition advertisement and sets off to find its place on the stage. Along the way, everyday city infrastructure becomes a world of rat-sized homes, workplaces, and unexpected encounters.

## Play

**[Play Ratlantis](https://isabelzulawski.github.io/ratlantis/)**

**[Explore The City Records newspaper](https://isabelzulawski.github.io/rat-newspaper/)**

Use a desktop or laptop with a mouse. Choose a new game to create your rat, or Continue to return to saved progress.

## How to play

| Action | Control |
| --- | --- |
| Move | Hold the mouse button to move toward the pointer. |
| Jump | Release the mouse button with the pointer above your rat. |
| Stop | Release with the pointer elsewhere. |
| Investigate or talk | Click objects and characters, then choose a response. |
| Use an item | Open the backpack and drag it onto a character. Food can also be given to the busker using its backpack button. |
| Find your bearings | Read your journal, click your rat for a thought, or use Paths to revisit unlocked locations. |
| Pause or adjust audio | Use Pause / Help and the separate Music and Sound FX controls. |

Progress saves automatically in the same browser when browser storage is available.

## What to explore

Follow the rat through streets, the subway, and an underground neighborhood. Meet characters, collect useful objects, and try short singing, dancing, and acting activities. Discover accessories and put together a costume.

The optional newspaper, **The City Records**, combines fictional rat-world headlines with real NYC inspection data. Turn its pages, switch between finding counts and percentages, crumple away a loose paper scrap, and inspect the map with a magnifying glass. The newspaper can be explored separately without changing game progress.

## Design intent

Ratlantis brings a theatrical, playful perspective to overlooked city spaces. Its textured illustrations, warm lights, and rat-scale objects invite curiosity and exploration. Mouse movement takes inspiration from Poptropica, while the characters and setting give this project its own identity.

The newspaper asks a related question: how does presentation shape what we believe about rats? Its charts distinguish recorded inspection findings from a count of the rat population.

## About this prototype

This midterm build includes the playable Level One route and its ending. Desktop mouse input is the supported interaction method; touch gameplay is not currently supported.

## Credits and sources

- **Concept and creative direction:** Isabel Zulawski.
- **Development:** created with assistance from OpenAI Codex.
- **Visual assets:** AI-generated artwork, with layout and art direction refined in Figma and code. Asset prompts are retained in the repository.
- **Audio:** recordings by tailssonic, theojt, dorian_vd_h, and grantando. See the [audio notes](public/audio/README.md) for the supplied filenames and playback details.
- **Data:** [NYC Department of Health and Mental Hygiene Rodent Inspection dataset](https://data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj/about_data). The newspaper uses a bundled 2025 snapshot; its reader includes source notes and limitations.
- **Typefaces:** Labrada, Oranienbaum, and Texturina. Font licenses are included in [src/data/fonts](src/data/fonts).

## Further reading

- [Story and full Level One plot](STORY.md) **Spoilers**
- [Development and local setup](DEVELOPMENT.md)
- [Original design notes and revision history](DESIGN-NOTES.md)

## Reviewing the newspaper code

Start with [How the newspaper uses data](NEWSPAPER-DATA-GUIDE.md) for the input file, loading and calculation flow, current snapshot audit, limitations, active versus retained code, and styling order.

After installing dependencies, run `node scripts/audit-newspaper-data.mjs` to verify the CSV and its gzip copy without changing them.
