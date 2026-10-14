# Opening polish pass

## Current behavior

- Title screen now contains just the illustrated Ratlantis wordmark and Begin / Continue / New Game controls. The top dash, tagline and prototype copy are gone.
- Character creation keeps name, preview and six fur colors. “Your little traveler” and the backpack caption are gone. The start button reads **Explore →**.
- Times Square is brighter and more welcoming, with cobalt night, gold foliage, glowing shopfronts and paved-street reflections. It remains nighttime and contains no humans.
- The pizza and folded map share the sidewalk's ground plane. Pizza is scaled as a slice lying on pavement. Street platforms are grounded cardboard objects rather than floating planks.
- Dragging the pizza makes the rat approach, grip the crust and pull the slice along the pavement. Release stops the pull; it never causes a jump or opens packing dialogue. A plain click still offers Pack a piece / Leave it. The piece can only be collected once. The slice's dragged position is saved.
- Billboard and map are directly clickable without inspection labels. A press and release on the same object is required. Movement gestures released over them do not inspect. After the audition goal is recorded, inspecting the billboard shows its artwork rather than repeating the goal choices.
- Tutorial labels, business overlay labels, pipe annotations and travel instruction labels have been removed. A brief control hint fades away; pause/help remains available. The dockworker's persistent speech cue and onward-travel availability notice remain because they convey actual story/build information.
- Fixed a texture-frame bug that replaced the station backdrop with a small wall crop, hiding its stairs and train. Backdrops now explicitly select the complete image frame.
- Subway entrance, boarding doorway and drainage opening are visible objects. Main travel exits also respond to walking into them, with a short fade between scenes in the same browser window.
- The player is slightly larger and has a subtle warm rim light, local illumination and contact shadow. All poses are registered to a common physical foot point. Stride timing follows travel distance; pose changes blend briefly, and landing has a small visual squash. Art effects never alter the physics body.
- Movement accelerates gently, slows near the pointer, stops immediately on ordinary release, and allows a short forgiving edge-jump window. Near-vertical pointer releases produce vertical jumps instead of an unexpected sideways launch. There is still no double jump.
- Ride animation pauses with interface panels. Fall recovery uses stable points on platforms. Existing saves remain compatible.

## Assets and provisional choices

New artwork was made with the built-in **imagegen** tool. Project-bound files are `public/art/times-square-v3.png` and `public/art/street-props-v3.png`. The exact prompts are in `public/art/polish-prompts.json`; the earlier art and prompt files remain available. Backgrounds, props, character rendering, collision geometry and input logic remain separate.

The warmer art direction, box/entrance/drain/parcel designs, player light/scale, pose registration, transitions and movement tuning are provisional production choices. The new functional thought at an exit before the goals are learned is: “I should take another look around.” No new story chapter, quest, recipient, performance game or major mechanic was added. The mouth-drag intentionally moves the rat as requested in this polish pass; inventory dragging and ordinary object clicks remain isolated from movement.

This is a more polished prototype, not final hand-authored animation. Walking still uses two illustrated stride poses, with blending and stable anchors. Fur options still use runtime tints/preview filters. The large raster assets prioritize local visual quality; download-size optimization remains a production task.

## Verification

Production build and state/interaction tests pass. Browser checks cover the complete title-to-neighborhood sequence, the removed copy, Explore button, jump/stop and no double jump, mouth grip, common pizza/rat ground plane, drag-release isolation, one-time packing, invalid inventory drops, direct billboard/map inspection, movement releases over the billboard, natural travel exits, ride pause/skip, boat-to-ledge landing, fall recovery, save/Continue and New Game protection. Rendered screenshots are in `tests/` with `-v3` names.
