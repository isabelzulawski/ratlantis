import { FITTED_IDS, FITTED_RECTS, setupFittedFrames } from "./costume-fit.js";
// Raster art is loaded separately from collision geometry and interaction logic.
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
const artwork = {
  ...Object.fromEntries(FITTED_IDS.map(id => [`fit-source-${id}`, `/art/fitted-${id}-v1.webp`])),
  waistcoat: "/art/rat-waistcoat-v1.webp",
  "costume-portraits": "/art/costume-portraits-v1.webp",
  director: "/art/quiet-director-v1.webp",
  auditionRoom: "/art/quiet-auditionRoom-v1.webp",
  grille: "/art/quiet-grate-v1.webp",
  emotions: "/art/acting-emotions-v1.webp",
  ferry: "/art/quiet-ferry-v1.webp",
  queens: "/art/quiet-queens-v1.webp",
  conduit: "/art/quiet-conduit-v1.webp",
  vent: "/art/quiet-vent-v1.webp",
  worker: "/art/ferry-worker-v2.webp",
  mentors: "/art/final-mentors-v1.webp",
  costumes: "/art/costume-pieces-v1.webp",
  "final-objects": "/art/ferry-accessories-v1.webp",
  park: "/art/quiet-park-v1.webp",
  bridge: "/art/quiet-bridge-v1.webp",
  brooklyn: "/art/quiet-brooklyn-v1.webp",
  busker: "/art/busker-poses-v1.webp",
  "chapter-items": "/art/brooklyn-items-v1.webp",
  squirrel: "/art/squirrel-v1.webp",
  street: "/art/quiet-street-v1.webp",
  downtown: "/art/quiet-downtown-v1.webp",
  neighborhood: "/art/quiet-neighborhood-v1.webp",
  station: "/art/quiet-station-v1.webp",
  sewer: "/art/quiet-sewer-v1.webp",
  ride: "/art/quiet-ride-v1.webp",
  rat: "/art/rat-poses-v2.webp",
  props: "/art/props-v2.webp",
  details: "/art/street-props-v3.webp",
  tile: "/art/station-mosaic-v4.webp",
  pipe: "/art/quiet-pipe-v1.webp",
  plaque: "/art/ui-control-v2.webp",
};
export const ART = Object.fromEntries(
  Object.entries(artwork).map(([key, path]) => [key, assetUrl(path.slice(1))]),
);
export const FUR_TINT = {
  Gray: 0xe1e2df,
  Brown: 0xc8aa88,
  Charcoal: 0x8693a0,
  Cream: 0xffeed5,
  "Rusty brown": 0xd49c7a,
  "Blue-gray": 0xabc5d6,
};
export const FUR_FILTER = {
  Gray: "saturate(.6)",
  Brown: "sepia(.25)",
  Charcoal: "brightness(.6) saturate(.5)",
  Cream: "brightness(1.45) saturate(.65)",
  "Rusty brown": "sepia(.3) saturate(1.4)",
  "Blue-gray": "saturate(.4) hue-rotate(170deg)",
};
export function loadAssets(scene) {
  for (const [key, url] of Object.entries(ART)) {
    if (key === "rat")
      scene.load.spritesheet("rat-atlas", url, {
        frameWidth: 512,
        frameHeight: 512,
      });
    else scene.load.image(`art-${key}`, url);
  }
}
export function setupArtFrames(scene) {
  // Fully drawn dressed rat: same authored registration as the original atlas.
  const waistcoat = scene.textures.get("art-waistcoat");
  for (const [pose, rect] of Object.entries(FITTED_RECTS)) waistcoat.add(pose, 0, ...rect);
  setupFittedFrames(scene);
  scene.textures.get("art-grille").add("door", 0, 120, 225, 1270, 580);
  const emotions = scene.textures.get("art-emotions"),
    cell = emotions.getSourceImage().width / 3;
  ["joy", "sorrow", "anger"].forEach((name, i) =>
    emotions.add(
      name,
      0,
      Math.floor(i * cell),
      0,
      Math.floor(cell),
      emotions.getSourceImage().height,
    ),
  );
  // Two natural rat poses; separate from the director's older atlas.
  const worker = scene.textures.get("art-worker");
  const workerSource = worker.getSourceImage();
  const workerWidth = Math.floor(workerSource.width / 2);
  ["worker", "dance"].forEach((name, i) =>
    worker.add(name, 0, i * workerWidth, 0, workerWidth, workerSource.height),
  );
  const mentors = scene.textures.get("art-mentors");
  ["worker", "dance", "director"].forEach((name, i) =>
    mentors.add(name, 0, i * 512, 0, 512, 1024),
  );
  const costumes = scene.textures.get("art-costumes"),
    ratio = costumes.getSourceImage().width / 1280;
  const rects = {
    crown: [35, 110, 400, 220],
    paperHat: [450, 70, 360, 310],
    helmet: [870, 40, 355, 365],
    cape: [0, 415, 495, 380],
    vest: [500, 465, 345, 320],
    sash: [870, 465, 400, 330],
    staff: [70, 805, 310, 440],
    sword: [455, 805, 400, 440],
    flower: [930, 805, 300, 430],
  };
  for (const [name, r] of Object.entries(rects))
    costumes.add(name, 0, ...r.map((v) => Math.floor(v * ratio)));
  const objects = scene.textures.get("art-final-objects");
  for (const [name, r] of Object.entries({
    bolt: [50, 200, 320, 290],
    washer: [460, 250, 275, 230],
    cork: [810, 210, 325, 295],
    glasses: [10, 620, 415, 290],
    scarf: [450, 550, 325, 440],
    pendant: [800, 555, 305, 375],
    tray: [1140, 635, 396, 300],
  }))
    objects.add(name, 0, ...r);

  const busker = scene.textures.get("art-busker");
  busker.add("idle", 0, 0, 0, 800, 1024);
  busker.add("singing", 0, 800, 0, 736, 1024);
  const items = scene.textures.get("art-chapter-items");
  items.add("bread", 0, 0, 260, 535, 575);
  items.add("ticket", 0, 535, 90, 465, 790);
  items.add("note", 0, 1000, 300, 536, 560);
  scene.textures.get("art-station").add("tunnel-wall", 0, 690, 210, 600, 280);
  const rats = scene.textures.get("rat-atlas");
  rats.add("idle", 0, 0, 0, 485, 500);
  rats.add("walk-a", 0, 485, 0, 530, 500);
  rats.add("walk-b", 0, 1015, 0, 521, 500);
  rats.add("react", 0, 1100, 512, 436, 512);
  rats.add("jump", 0, 0, 512, 640, 512);
  rats.add("fall", 0, 640, 512, 445, 512);
  const details = scene.textures.get("art-details");
  for (const [name, rect] of Object.entries({
    box: [20, 390, 490, 155],
    stack: [570, 175, 390, 370],
    entrance: [1024, 55, 512, 500],
    drain: [70, 640, 390, 315],
    parcel: [575, 740, 360, 210],
    step: [990, 750, 520, 190],
  }))
    details.add(name, 0, ...rect);
  const tex = scene.textures.get("art-props");
  // Generated atlas has deliberately generous margins; authored frames avoid
  // clipping lettering or tails instead of assuming a mathematically perfect grid.
  const frames = {
    pizza: [41, 74, 549, 318],
    map: [604, 41, 485, 385],
    boat: [1120, 145, 535, 250],
    poster: [45, 415, 475, 510],
    plank: [535, 585, 640, 255],
    backpack: [1190, 460, 455, 420],
  };
  for (const [name, rect] of Object.entries(frames)) tex.add(name, 0, ...rect);
}
export function itemPicture(scene, id) {
  if (["bread", "ticket"].includes(id))
    return scene.textures.getBase64("art-chapter-items", id);
  return scene.textures.getBase64("art-props", id);
}
