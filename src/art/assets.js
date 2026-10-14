// Raster art is loaded separately from collision geometry and interaction logic.
export const ART = {
  street: "/art/times-square-v3.png",
  neighborhood: "/art/neighborhood-v2.png",
  station: "/art/subway-v2.png",
  sewer: "/art/sewer-arrival-v2.png",
  ride: "/art/train-interior-v2.png",
  rat: "/art/rat-poses-v2.png",
  props: "/art/props-v2.png",
  details: "/art/street-props-v3.png",
  broadway: "/art/broadway-poster-v4.png",
  tile: "/art/station-mosaic-v4.png",
  pipe: "/art/pipe-descent-v4.png",
};
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
  return scene.textures.getBase64("art-props", id);
}
