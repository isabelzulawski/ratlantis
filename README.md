Ratlantis
Current newspaper integration: the three articles and D3 visualizations supplied in Desktop/newspaper now replace the static editorial spread. Previous/Next buttons flip between borough, monthly and inspection-map pages. The supplied CSV is preserved byte for byte, with original calculations and filters. See NEWSPAPER-INTEGRATION.md for editable files and verification. This supersedes the historical static-newspaper notes below.
Latest visual update: the Broadway billboard, smaller advertisements, downtown direction and park notices are painted into their backgrounds. Interfaces now use reference-derived illustrated cloud, canvas-backpack, paper and brass-sign assets. Dialogue displays in uppercase with corrected grammar. See REFERENCE-ART-PASS.md for current artwork, verification and provisional details; it supersedes the visual implementation descriptions in SECTION-POLISH.md.
Historical presentation update: dialogue is now anchored to characters as thought bubbles. The squirrel directs the player to the lamppost, then gives the newspaper after the post-reading exchange. Posters and newspaper currently use a static editorial spread with no data controls; the D3 implementation described in section 18 is retained separately for collaborative graph work, not connected to the game UI. See SECTION-POLISH.md for the current implementation and code locations. This update supersedes the older interaction/conversation descriptions below.
Project status
This project implements the opening adventure through the initial Ratlantis neighborhood, now including Washington Square Park and optional City Records data reading. Run instructions are in RUNNING.md. Later mentor lessons, ferry, Queens theater and the final audition-room vent remain design plans, not implemented scenes.
The current route is Times Square → animated downtown travel → Washington Square Park → Broadway–Lafayette subway and train → accidental drainage descent → Ratlantis. No humans appear. The Broadway misunderstanding remains unresolved.
Normal entry is `/`; Data Visualization presentation entry is `/?data=newspaper`. The direct data entry never loads, overwrites or advances a saved game.
The sections below retain the full adventure design, with the revised park and data component described in sections 8 and 18. Current technical values and approved opening dialogue live in `src/data/config.js`.
Throughout this document:
- Confirmed means the direction was agreed upon.
- Working default means a suggested detail that can be used in the draft but still needs review.
- Unresolved means the code generator must not invent an answer.
The goal is to give the creator control over the game’s story, appearance, interactions, and behavior. Technical implementation choices may support this design, but should not introduce new creative content.
1. Overview
Ratlantis is a nighttime, 2D browser adventure set in New York City and the hidden rat society beneath it.
The player controls a small, slightly shy but curious rat. In Times Square, the rat discovers a billboard advertising a fictional human Broadway production of Ratatouille: The Musical.
The rat misunderstands the advertisement. It assumes an actual rat could audition for the rat role and decides to try.
A mistaken interpretation of the name Broadway–Lafayette leads the rat into the subway. From there, it accidentally enters the sewers and discovers Ratlantis: a bustling society where rats have homes, businesses, jobs, routines, and creative ambitions.
The player travels through the city, meeting rats who help them learn:
1. Singing in Brooklyn.
2. Dancing aboard the Staten Island ferry.
3. Acting in Queens.
After completing the lessons, the player follows directions through a pipe into the audition building. The level ends at a vent overlooking the audition room.
Intended experience
The game should feel:
- Curious and exploratory.
- Cozy, mysterious, and slightly theatrical.
- Funny through character behavior and understated dialogue.
- Rewarding without being punishing.
- Like discovering a city that was already living its own life before the player arrived.
Length
Target: approximately 20–30 minutes for a first-time player, including some optional exploration.
This is a design target, not a guaranteed duration. Length should come from meaningful activities, discoveries, and conversations rather than repetitive tasks or unnecessarily long travel.
2. Creative boundaries
Required
- No humans appear anywhere in the game.
- Humans may exist in the story, but remain unseen.
- The subway, bridge, and ferry must all appear.
- The player stands on two legs when idle and moves on all fours.
- Movement uses mouse hold-and-release controls.
- The world uses blue-and-gold nighttime colors.
- The player starts with a backpack.
- Accessories are discovered during play.
- Dialogue includes selectable speech-bubble responses.
- The main route is forgiving.
- The audition misunderstanding remains unresolved at the ending.
- The data visualization is optional and integrated into the setting.
Do not add without approval
- Combat, enemies, health bars, lives, or survival meters.
- Human characters, silhouettes, feet, or crowds.
- Additional major quests or mentors.
- Branching endings or relationship scores.
- A traditional guide who explains the entire adventure.
- A full Staten Island neighborhood.
- A playable Broadway audition or final stage performance.
- Procedurally generated dialogue, quests, or newspaper findings.
- Random character names.
- Microphone-based singing detection.
- Unspecified mechanics intended to extend playtime.
Poptropica is an interaction reference. The game should have its own artwork, characters, interface, dialogue, and story.
3. Visual direction
Overall style
The visual reference is New York Above, Rat City Below-2.png.
Use its general qualities:
- Deep navy and blue nighttime environments.
- Warm gold and amber illumination.
- Rough, sketch-like outlines.
- Textured, illustrated surfaces.
- Brick arches, pipes, water, ledges, and layered spaces.
- Small homes and businesses made from discarded objects.
- Cozy illuminated areas within a darker surrounding city.
The game should look illustrated rather than photorealistic.
The creator does not want to draw the assets manually. Artwork may be generated or otherwise produced later, but must follow a consistent visual system.
Gameplay readability
Detailed scenery must not obscure the playable surfaces.
- Platforms have clear upper edges.
- Interactive objects remain distinguishable from decoration.
- Background details are softer or less visually prominent.
- The player remains readable against both dark and illuminated areas.
- Foreground decoration does not hide important landing spots.
- Lighting directs attention without making the entire scene uniformly bright.
Scale
The rat is mostly realistically small relative to human objects.
Examples:
- A pizza slice is a large object.
- Subway benches tower over the player.
- Food tins can become rooms.
- Toolboxes can become shops.
- Human infrastructure becomes rat-scale pathways.
- Bridge maintenance ledges serve as traversable routes.
- The ferry contains a small rat-maintained area.
- An electrical cabinet can contain a rat theater.
Accessories and small props may be slightly exaggerated for readability.
4. Player character
Personality
The protagonist is:
- A little shy.
- Curious.
- Quietly ambitious.
- Willing to explore unfamiliar places.
Dialogue choices can express different reactions without fundamentally changing the character or branching the story.
Character creation
The opening sequence is:
1. Title screen.
2. Character creation.
3. Times Square street scene.
The player enters a name.
There is no random naming system in the current scope.
Fur colors
The player chooses one of six muted colors:
1. Gray.
2. Brown.
3. Charcoal.
4. Cream.
5. Rusty brown.
6. Blue-gray.
Exact color values remain unresolved.
Starting equipment
The rat begins with a small backpack so it can collect food above ground.
Working appearance: an improvised fabric pouch with string straps and a button closure.
The backpack remains available throughout the adventure.
Animation
Required states include:
- Standing on two legs while idle.
- Moving on all fours.
- Jumping.
- Falling.
- Landing.
- Talking or reacting.
- Singing.
- Dancing.
- Performing emotions during the acting lesson.
- Wearing supported accessories and costumes.
Exact frame counts and animation timing remain unresolved.
5. Movement and interaction
Mouse movement
Confirmed control behavior:
- Hold the mouse button to move toward the pointer horizontally.
- While holding, moving the pointer changes the intended direction.
- Release while pointing upward to jump.
- Release without pointing upward to stop.
- The rat is not directly dragged through the world.
The precise boundary between “pointing upward” and “not pointing upward” still needs to be specified.
Working control feedback
A cursor indicator should show whether releasing will:
- Jump.
- Stop.
- Interact with an object.
Input separation
Working safeguards:
- Clicking dialogue or interface elements must not move the rat.
- Dragging an object must not also control the rat.
- Opening the backpack pauses normal movement input.
- Releasing an object drag must not trigger a jump.
- Clicking an NPC should begin interaction rather than cause a jump.
- Releasing while already airborne must not create an unintended extra jump.
Exact movement speed, acceleration, jump height, and air control remain unresolved.
Difficulty
- Main-route jumps are easy.
- Optional ledges may require more effort.
- Falling should return the player to a nearby safe position.
- Unlimited retries.
- No lives or game-over screen.
6. Camera and scene transitions
The game consists of separate connected scenes.
- Some scenes extend beyond one screen.
- The camera scrolls a limited amount as the player moves.
- Reaching an exit transitions to another scene.
- Scene transitions happen within the same browser window.
- “New window” means a new game scene, not a browser popup.
Exits should be visually understandable: pipes, stairs, passages, stations, or boarding points.
Travel
Transportation is part of the experience.
Required:
- Subway entrance and platform.
- A bridge crossing associated with travel to Brooklyn.
- Staten Island ferry.
- Travel onward to Queens and back toward Manhattan.
Short animated travel scenes are acceptable. They should depict actual travel rather than impose artificial loading delays.
Exact routes, transition lengths, and which travel scenes are playable remain unresolved.
7. Main story progression
Stage	Location	Main event
1	Times Square	Explore, interact with pizza, discover the musical billboard
2	Downtown travel	A short animated transition to Washington Square Park
3	Washington Square Park	Meet the squirrel; receive a newspaper; optional data posters
4	Park directions	Inspect the discarded Broadway–Lafayette subway map
5	Broadway–Lafayette subway	Mistake the station name for a route to Broadway; board a train
6	Drainage passage	Accidentally slide into the sewers
7	Ratlantis arrival	Land in an abandoned tin-can boat
8	Underground neighborhood	Discover homes, businesses, and working rats
9	Bridge to Brooklyn	Travel to the retired busker (planned)
10	Brooklyn	Exchange food for a singing lesson (planned)
11	Brooklyn departure	Receive a ferry ticket as a gift (planned)
12	Ferry	Help the ferry worker and learn to dance (planned)
13	Queens	Design a costume and learn acting (planned)
14	Return toward Manhattan	Follow the director’s directions (planned)
15	Audition building	Crawl to a vent overlooking the audition room (planned)


The mentor order is fixed, but completed locations can be revisited.
8. Times Square opening
Purpose
Introduce the player’s scale, movement, backpack, and motivation through exploration.
Pizza
A discarded pizza slice is available on the ground.
- The player can drag it around.
- Dragging is playful and optional.
- There is no required pizza-placement puzzle.
- The player can collect food from it for later use.
Working interaction: inspect the slice and choose “Pack a piece” or “Leave it.” Packing stores a piece in the backpack while leaving the rest of the slice behind.
Exact wording and whether the stored item is a crust or another small piece remain unresolved.
Billboard reveal
The billboard becomes visible as the player moves right and the camera scrolls.
It advertises the fictional production:
Ratatouille: The Musical
It announces open auditions.
No human performer appears on the billboard. An illustrated rat can represent the production.
The player chooses a thought-bubble response that expresses interest in auditioning. All available choices lead to the same goal.
Exact billboard design and response text remain unresolved.
Washington Square Park and subway map
After seeing the billboard, the player travels downtown into a small nighttime park with a bench, tree, poster-covered lamppost and the arch in the background. Background art, interactive papers, characters and collisions are separate. The rat stays small relative to human infrastructure. The squirrel is a local who confidently treats humans feeding him nuts as established connections; he does not teach a performance skill or resolve the audition misunderstanding.

Conversation (click to advance):
- Rat: “Another rodent! I’m looking for Broadway. There’s an audition.”
- Squirrel: “Ah, my favorite, good old-fashioned show biz! Good connections help. Personally, I know several humans.”
- Rat: “You do?”
- Squirrel: “They bring me nuts. Very established relationship.”
- Squirrel, offering the newspaper: “You should know what they’re saying about rats.”
- Squirrel, pointing out the pole: “They keep putting up notices about you. Never seen one about me.”

The supplied “goold” typo was corrected to “good”; the final two lines are unchanged. The newspaper is a persistent, readable backpack item; repeat conversations and reloads cannot duplicate it. Click its picture to read. Food still uses the existing drag-to-target interaction. The encounter and data reading are optional, and the map remains accessible without reading charts.
The player finds a discarded subway map beyond the squirrel and notices Broadway–Lafayette.
The rat mistakes “Broadway” in the station name for the theatrical destination.
The existing line is preserved: “Hmm... Broadway-Lafayette station? Isn't Lafayette that guy from that other musical? Sounds like this is the way to go!”
Inspecting it records Broadway–Lafayette in the journal. Exiting the park transitions to the separate subway scene. Times Square, the park and the station are not depicted as adjacent pieces of the same street.
9. Subway and sewer entry
The subway must be visibly included before the sewer reveal.
Confirmed elements:
- Entrance stairs.
- A deserted platform.
- A rat-sized opening leading toward drainage infrastructure.
- An accidental descent into Ratlantis.
A short deserted train ride with a skip control is implemented before the drainage passage.
Arrival
The rat lands in an abandoned tin-can boat.
The entry pipe is too high to reach, preventing immediate return by the same route.
Working boat interaction: jump out using the boat rim as a platform.
The player then passes through a dim drainage passage. Warm lights and activity gradually reveal the neighborhood beyond.
10. Ratlantis society
Ratlantis is a functioning underground city.
Its residents:
- Have jobs.
- Commute.
- Carry deliveries.
- Repair infrastructure.
- Run businesses.
- Make food.
- Perform and rehearse.
- Have their own routines and concerns.
The society should feel bustling rather than empty or purely decorative.
Buildings and materials
Homes and businesses are constructed from:
- Sewer architecture.
- Brick alcoves.
- Pipes.
- Food tins.
- Toolboxes.
- Crates.
- Fabric scraps.
- Discarded household objects.
Initial neighborhood
Agreed business concepts:
- Café in a food tin.
- Repair shop in a toolbox.
- Delivery depot built from crates.
- Homes in brick alcoves.
A mixture of stationary workers and moving commuters creates activity.
First resident
A dockworker is the working first-contact character.
They are occupied with deliveries rather than waiting to guide the player.
Working opening cue:
“You can’t park that here!”

The player clicks a speech cue to respond.
After hearing about the audition, the dockworker provides a lead toward the Brooklyn singer.
There is no dedicated guide who outlines the entire adventure.
11. Dialogue system
Format
- Speech bubbles.
- Click to advance.
- Text remains visible until advanced.
- Selectable responses appear when relevant.
- Three options are the general working format, not a requirement for every exchange.
Consequences
Dialogue primarily changes:
- Immediate responses.
- Humor.
- Optional information.
- How the protagonist expresses itself.
It does not create major story branches, relationship scores, or alternate endings.
Useful information may be available through optional questions.
Tone
- Understated humor.
- Distinct character personalities.
- Occasional sarcasm.
- No long speeches explaining the theme.
Mentors do not directly explain that humans will play the rat in the Broadway production. They may make a dry comment suggesting the ambition is unusual.
Dialogue status
All sample lines in this README are draft dialogue, not a complete approved script.
The generator must not invent the remaining conversations.
12. Backpack and item use
Confirmed requirement
The player must open the backpack to give an item.
The singer’s conversation may hint that he is hungry, but must not provide an explicit “Offer pizza” dialogue response or automatically recommend the correct item.
The player is expected to make the connection.
Working interaction
1. Open the backpack.
2. Select the item.
3. Click the intended character or object.
4. Show the result.
This select-then-click method is a proposal. Dragging an item from the backpack onto the recipient remains an alternative to decide.
Working safeguards
- Unsuitable items remain in the backpack.
- Required objects cannot be accidentally discarded.
- Successful exchanges consume only the intended item.
- Closing the inventory cancels item selection.
- Interface interaction does not trigger movement or jumping.
Backpack sections
Working organization:
- Quest items and food.
- Wardrobe.
- Journal and directions.
The journal records information the player has learned without directly solving item-use puzzles.
13. Brooklyn singing mentor
Character
A retired subway busker.
- Male.
- Old enough that full performances are no longer practical.
- Still able to demonstrate short phrases and teach.
- Grumpy but kind.
- Proud of his experience.
- Initially impatient, then quietly invested in the player’s effort.
He remains near his old performing spot, with instruments made from discarded objects.
Food exchange
He agrees to help in exchange for food.
The player can use pizza collected above ground.
A bread alternative was discussed to prevent players who missed the pizza from becoming stuck. Its exact location and acquisition method remain unresolved.
The backpack must be used manually to make the exchange.
Singing mini-game
Confirmed mechanic: repeat a melody by clicking notes.
Working rules:
- Four note buttons.
- Three rounds.
- Phrase lengths of 3, 4, and 5 notes.
- Fixed sequences rather than random melodies.
- Buttons light during the demonstration.
- Player repeats note order.
- No rhythm-timing requirement.
- Replay button.
- Mistakes restart only the current round.
- Completion earns the singing skill.
Exact pitches, sequences, button symbols, and timing remain unresolved.
Ferry ticket gift
After the lesson, the busker gives the player a ferry ticket.
The gift is presented as something he has been saving but no longer expects to use.
Draft exchange:
“Here. Ferry ticket. Been saving it.”

“You’re sure?”

“Who am I kidding? I’m never leaving this place anyway. Might as well get some use out of it.”

A note on the back reading “Ask for the rat with the mop” is a working lead to the dance mentor.
14. Ferry dancing mentor
There is no required full Staten Island neighborhood.
The ferry itself is the main setting for this part of the adventure.
Character
An energetic, weird male ferry worker who dances during breaks.
He maintains a rat-scale area aboard the ferry, not the entire human vessel.
Agreed quirks:
- Talks to his mop.
- Names a loose bolt “Clive.”
- Treats ferry noises as music.
- Demonstrates sudden spins and exaggerated freezes.
His small mop can be made from thread.
Preparation task
Secure three loose objects sliding around the deck.
Working interaction:
- Drag each object into a marked storage location.
- Clear the rehearsal area.
- Begin the lesson afterward.
The exact three objects remain unresolved.
Dance mini-game
Confirmed direction: easy and forgiving.
Working rules:
- One practice section.
- Eight cues in the main routine.
- Three buttons: left, right, jump.
- Cues approach a beat line slowly.
- Generous timing window.
- Five correct cues out of eight completes the lesson.
- Misses do not interrupt the routine.
- Immediate retries.
- Visual cues support muted play.
Exact cue sequence, music, and timing values remain unresolved.
Next destination
After the lesson, the ferry worker recommends the Queens acting director and provides directions.
15. Queens acting mentor
Character and setting
Working character: a deadpan community-theater director.
The theater occupies an abandoned electrical cabinet.
Working visual elements:
- Fabric curtain.
- Bottle-cap footlights.
- Small stage.
- Dressing mirror.
- Scrappy costume wardrobe.
Costume design
Confirmed:
- Several costume choices.
- All pieces available immediately.
- No collection quest required.
- Scrappy aesthetic.
- Free preview and combination.
- No correct outfit.
- Wardrobe remains available afterward.
Working pieces:
Slot	Options
Head	Bottle-cap crown, folded-paper hat, thimble helmet
Body	Fabric cape, patchwork vest, ribbon sash
Prop	Matchstick staff, teaspoon sword, button flower


These specific nine items were proposed and should be reviewed before asset production.
The player chooses “Ready for rehearsal” when finished.
Acting mini-game
Confirmed mechanic: match the requested emotion.
Working rules:
- Three emotion challenges: joy, sorrow, anger.
- Director requests an emotion.
- Player selects an appropriate line from speech-bubble choices.
- Rat performs the selected response with expression and posture.
- Incorrect choices receive feedback and allow retry.
- Correct choices advance.
- Completing the lesson earns the acting skill.
A miniature scene involving a monarch’s missing breadcrumb was proposed but is not finalized.
Final directions
After the lesson, the director gives directions to the audition pipe.
The player finds the route independently. The director does not accompany them.
16. Accessories and wardrobe
Accessories are discovered during exploration.
Accepted optional accessory concepts:
- Bottle-cap hat.
- Scarf.
- Jewelry-ring glasses.
- Subway-token pendant.
Exact placement remains unresolved except for the glasses.
Glasses
Confirmed design:
- Two small jewelry jump rings form the frames.
- One brass ring and one silver ring.
- Wire connects them.
- Bent earring hooks form the arms.
- Slightly crooked, scrappy appearance.
- No required lenses.
They are found on a high shelf in the underground repair shop.
Wardrobe
- Preview accessories.
- Equip or remove them.
- Retain discovered pieces.
- Keep costume pieces after the acting lesson.
Rules for incompatible combinations and occupied slots remain unresolved.
17. Exploration and revisiting
Confirmed direction:
- Easy main route.
- More challenging optional ledges.
- Optional accessories.
- Small scenes and conversations.
- Revisiting completed locations.
Travel works physically on the first visit.
A map shortcut becomes available for previously visited destinations.
The travel map and the data visualization map are separate functions and should not be confused.
Optional discoveries must not block completion.
18. City Records data visualization
The planned City Records component is now presented through Washington Square Park's overlapping weathered paper posters and the squirrel's discarded newspaper, rather than a separate underground dashboard. All views share one local cleaned dataset and one in-memory borough selection. Data reading never gates skills or travel. Closing a poster restores the same scene and position; closing the newspaper returns to the still-paused backpack. UI interactions cannot move or jump the rat.

Poster 1: “WHERE ARE THEY LOOKING?”
- Subtitle: “Initial rodent inspections by borough · 2025”.
- Five horizontal bars start at zero and stay in Bronx, Brooklyn, Manhattan, Queens, Staten Island order.
- Switch between number of initial inspections and percentage recording active rat signs. Axis units, marks and caption update together.
- Prompt: “Does more looking mean more finding?”
- Hover, keyboard focus, click or tap reveals exact active-sign counts, all-initial denominators, percentages and unknown outcomes. Selection has an outline and a diamond label as well as an amber fill.

Poster 2: “A YEAR ABOVEGROUND”
- Citywide or selected-borough monthly recorded-active percentages for January–December 2025.
- D3 renders real SVG lines and point marks; missing months create gaps and an explicit missing marker, not zeros.
- Clicking, tapping or focusing a month reveals month, active-sign inspection count, total initial count and percentage. A readable table provides the same values.

Newspaper
- An accurate selectable NYC borough map linked to the comparison, monthly trend and factual summary; Citywide resets the selection.
- Official NYC DCP borough boundaries, 2026 release (water areas excluded). All vertices and polygon topology are retained; coordinates are rounded to five decimal places. Geography is contextual, not a claim about 2025 boundary revisions.
- Factual summaries are deterministic descriptions of the actual local counts and monthly extrema, with no causal or population claims.
- “Still no squirrel section.” is a clearly marked fictional handwritten margin annotation.
- Navy ink, cream paper, restrained amber highlights, crisp chart panels and readable methodology. On narrow screens, the spread stacks vertically and charts/tables scroll in their own containers so labels stay readable.

Source and methodology
Source: [NYC DOHMH Rodent Inspection](https://data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj/about_data), including the current schema and attached data dictionary. The schema's older description refers to “Active Rat Signs”; actual 2025 results and the current dictionary use the failure categories below. Retrieval completed October 13, 2026 in New York (October 14 UTC); the exact UTC timestamp and raw-data SHA-256 are in `public/data/inspections-2025.json`.

- Date range: `inspection_date >= 2025-01-01` and `< 2026-01-01`, using the dataset's calendar-date field, not approval dates or inferred dates.
- Inspection type: the actual exact value `Initial`; other values found were `Compliance`, `Treatments`, `Stoppage`, `Clean Ups`.
- Numerator: exact results `Failed for Rat Activity` plus `Failed for Rat Activity and Other Reason`. The combined category counts once. Observations do not override result categories.
- Denominator: **all included initial inspection events**, including unknown or missing outcomes if present. Unknown outcomes are separately reported, never silently removed or described as negative findings. The measure is the share with *recorded* active signs, not rat prevalence; incomplete outcomes would limit interpretation. This snapshot has no unknown outcomes.
- Recognized other results: `Passed` and `Failed for Other Reason`. The four observed result values and their counts are retained in the audit.
- Borough names are matched after trimming and case normalization against five official names. Missing/unrecognized boroughs are excluded, without inferring from addresses or BBL codes. Citywide means the five included boroughs.
- Exact duplicates are defined by equality across **all 24 published noncomputed fields**, not by BBL, case ID, address or date alone. One identical initial row and two identical treatment/stoppage rows were removed. Different visits to the same property are retained. Identical published rows lack a separate public event identifier; treating them as duplicates is a documented cleaning decision.
- The 2025 retrieval had 216,767 rows: 3 exact duplicates removed, 72,451 remaining non-initial rows excluded, 144,313 initial events included. No included initial events were missing a valid date, borough or result. Date-less source records cannot be assigned to 2025; an all-years audit found 15 `Initial` and 2 `Compliance` rows with missing dates, which were excluded from year-based analysis.
- 97,152 distinct known BBL tax lots, 37,651 with repeated included initial visits; 4,041 included visits lacked a usable BBL. These are audit figures, not the chart's unit. Missing BBL does not exclude an event from the inspection charts.
- An independent server query by borough/result matched all downloaded raw initial groups: 144,314 raw initial rows, reduced to 144,313 after the one exact initial duplicate.

Snapshot findings (events, not individual rats):

| Borough | Initial inspections | Active-sign inspections | Recorded-active percentage |
| --- | ---: | ---: | ---: |
| Bronx | 30,326 | 5,939 | 19.6% |
| Brooklyn | 57,893 | 10,058 | 17.4% |
| Manhattan | 47,602 | 7,725 | 16.2% |
| Queens | 7,355 | 1,883 | 25.6% |
| Staten Island | 1,137 | 72 | 6.3% |
| Citywide | 144,313 | 25,677 | 17.8% |

Limitations: inspected properties are not a random NYC sample; initial inspections can be complaint-driven or proactive. More recorded findings can reflect more inspections. An uninspected location does not demonstrate an absence of rats. Active signs are evidence recorded at a particular visit, not a count of individual rats, an ongoing property condition, or proof of causes behind monthly changes.

Reproducibility and availability
- Run `npm run data:refresh` (Node 20.19+/22.12+ with internet) to retrieve all 2025 records in ordered pages, audit duplicates/missing values, independently cross-check server aggregates, retrieve official geometry, and write local summaries. This is development-time work only.
- Raw pages are stored in ignored `.data-cache/`; the browser loads the roughly 10 KB inspection summary and local borough geometry, not raw inspection events or the entire NYC dataset.
- `npm run data:cached` exactly rebuilds summaries from cached retrieval files. `node scripts/preprocess-data.mjs --resume` retries interrupted retrieval using existing pages; start a fresh refresh when source changes. NYC updates the source daily, so fresh historical snapshots can change.
- A failed acquisition exits with an error and writes `public/data/retrieval-error.json`; it does not invent numbers or replace a previous successful snapshot. If local summaries cannot be loaded, the panel displays “Records unavailable” and the adventure remains playable.
- Direct class presentation entry: `/?data=newspaper` locally, or `/ratlantis/?data=newspaper` under a project-path build. It starts the newspaper without creating a Phaser game or reading/writing story progress. Normal `/` remains the adventure entry.
- Verification commands: `npm test`, `node tests/browser-check.mjs` and `node tests/data-browser.mjs` while a local server runs. Use `RATLANTIS_TEST_URL` to point browser tests at another local build.
19. Sound and interface
Audio
Confirmed direction:
- Quiet nighttime ambience during exploration.
- More prominent music near performers.
- No spoken dialogue.
- Short rat squeaks and expressive animation.
- Sound toggle.
Singing and dancing require visual cues so sound is not the only source of information.
Exact audio tracks and effects remain unresolved.
Interface
Accepted elements:
- Backpack icon.
- Journal containing current goal and learned directions.
- Speech bubbles.
- Response choices.
- Wardrobe.
- Pause/help control.
- Sound control.
- Travel map for visited locations.
The interface should fit the illustrated world and remain visually restrained.
20. Saving
Confirmed direction: automatically remember progress.
Save:
- Player name.
- Fur color.
- Current location.
- Completed lessons.
- Acquired items.
- Discovered and equipped accessories.
- Unlocked destinations.
- Journal progress.
Title screen includes:
- Continue, when a save exists.
- New Game.
Exact save technology and reset behavior remain unresolved.
Reloading should not duplicate gifts or consume an item twice.
21. Ending
Confirmed ending location:
A pipe leads to a vent overlooking the audition room.
Visible elements:
- Empty director’s chair.
- Illuminated audition spot.
- Edge of a curtain.
- No humans.
The rat remains on the hidden side of the vent.
The misunderstanding about the production remains unresolved.
Working final sequence:
1. Crawl through the pipe.
2. Reach the vent.
3. Reveal the audition room.
4. Rat stands and looks through the grate.
5. End silently.
6. Fade to “End of Level One.”
The silent ending and exact fade treatment are working defaults.
There is no audition mini-game or performance beyond this point.
22. Asset planning
Assets will be produced later. The creator should not be required to draw them.
Environment families
- Times Square street and billboard.
- Discarded subway map.
- Subway entrance and platform.
- Optional subway-car transition.
- Drainage pipe and tin-can boat.
- Underground neighborhood.
- Café, repair shop, delivery depot, homes.
- Bridge route.
- Brooklyn busker location.
- Ferry exterior travel view and rat-scale work area.
- Queens electrical-cabinet theater.
- Final pipe and vent.
- Audition-room view.
Character families
- Player with six fur colors.
- Dockworker.
- Retired busker.
- Ferry worker.
- Acting director.
- Limited background workers and commuters.
Background population should be lively without introducing unapproved quest characters.
Props and interface
- Backpack.
- Pizza and bread.
- Ferry ticket.
- Busker instruments.
- Mop and loose ferry objects.
- Costume pieces.
- Optional accessories.
- Noticeboard, map, and newspaper.
- Dialogue bubbles and buttons.
- Journal and wardrobe.
- Travel and interaction cues.
Exact designs require review before final generation.
23. Completion criteria
A complete first level should allow the player to:
- Create and name a rat.
- Select one of six fur colors.
- Move, stop, and jump using the agreed mouse controls.
- Drag pizza and collect food.
- Discover the billboard and subway map.
- Enter the subway and reach Ratlantis.
- Explore a bustling discarded-object neighborhood.
- Cross the bridge route.
- Give food through the backpack without an explicit dialogue shortcut.
- Complete singing.
- Receive the gifted ferry ticket.
- Board the ferry.
- Secure the sliding objects.
- Complete dancing.
- Reach Queens.
- Design a costume.
- Complete the emotion lesson.
- Follow directions to the audition pipe.
- Reach the final vent.
- Discover optional accessories.
- Revisit completed destinations.
- Save and continue.
- Open and close both data-board views without disrupting the game.
24. Remaining decisions
Do not treat the following as permission to invent content:
1. Exact scene layouts and dimensions.
2. Complete dialogue scripts and response choices.
3. Character names and final appearances.
4. Exact movement and jumping values.
5. Inventory select-and-click versus drag-to-use.
6. Exact pizza collection interaction.
7. Bread fallback location and acquisition.
8. Whether the opening includes a train ride.
9. Exact transportation routes and scene durations.
10. Singing pitches and note sequences.
11. Ferry objects and dance sequence.
12. Final costume-piece list.
13. Acting scene and emotion-response text.
14. Optional encounter scripts.
15. Remaining accessory placements.
16. Outfit compatibility rules.
17. Exact title screen, journal, and interface appearance.
18. Audio assets.
19. Data cleaning, date range, charts, and newspaper findings.
20. Final ending timing and text.
21. Technical stack, device support, and deployment.
25. Instructions for future code generation

Additional Information
Inventory: drag an item from the backpack onto the character you want to give it to.
Food fallback: a discarded bread piece beside the underground café if you missed the pizza.
Subway: include a short train ride before entering the sewers.
Mini-games and ending: use the proposed singing rounds, forgiving dance rules, nine scrappy costume pieces, and silent vent ending.

Treat this document as the creative source of truth.
- Implement confirmed decisions faithfully.
- Keep working defaults distinguishable from approved content.
- Flag unresolved creative choices before implementing the affected feature.
- Do not add story content to fill gaps.
- Do not substitute familiar game mechanics for the specified interactions.
- Do not change mouse release behavior.
- Do not automatically suggest the correct inventory item.
- Do not make costume choice affect success.
- Do not make optional data exploration mandatory.
- Do not add humans.
- Do not resolve the audition misunderstanding.
- Do not extend the ending beyond the vent.
- Do not invent data or imply unsupported findings.
- Preserve player progress and prevent accidental softlocks.
- Use technical judgment for implementation details only where it does not alter the intended player experience.
