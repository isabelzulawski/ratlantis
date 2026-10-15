import { COSTUME_REGISTRATION } from "./costume-registration.js";
import { POSE } from "./RatVisual.js";
// Fitted artwork uses the SAME six-pose registration as RatVisual, rather than
// positioning inventory icons at guessed head/chest offsets. Each sheet is an
// imagegen-drawn paper-doll layer; every cell preserves the original rat pose.
export const FITTED_IDS = [
  'crown', 'paperHat', 'helmet', 'cape', 'sash',
  'staff', 'sword', 'flower', 'glasses', 'pendant', 'scarf',
];
export const FITTED_POSES = ['idle', 'walk-a', 'walk-b', 'jump', 'fall', 'react'];
// Match the hand-authored protagonist frames (the leaping rat crosses the
// nominal grid boundary). Grid slicing would clip its muzzle and held props.
export const FITTED_RECTS = {
  idle: [0, 0, 485, 500],
  'walk-a': [485, 0, 530, 500],
  'walk-b': [1015, 0, 521, 500],
  jump: [0, 512, 640, 512],
  fall: [640, 512, 445, 512],
  react: [1100, 512, 436, 512],
};
export const fittedTexture = id => `art-fit-${id}`;

export function fittedEntries(state) {
  const outfit = state.outfit || {};
  // Back clothing first, then neck/face/head and held props. A costume hat
  // supersedes an optional bottle cap; spectacles can coexist with a hat.
  return [
    outfit.body,
    ...(state.equippedAccessories || []).filter(id => id !== 'cap'),
    outfit.head || ((state.equippedAccessories || []).includes('cap') ? 'crown' : null),
    outfit.prop,
  ].filter(id => FITTED_IDS.includes(id));
}

export function setupFittedFrames(scene) {
  for (const id of FITTED_IDS) {
    const source = scene.textures.get(`art-fit-source-${id}`).getSourceImage();
    // Runtime paper-doll composition, not destructive edits to source artwork.
    // Bake calibrated placement into the frames used by BOTH DOM and WebGL.
    // Half-resolution is ample for an ~80px world rat / 165px preview,
    // and avoids keeping twelve large full-resolution GPU atlases resident.
    const resolution = 0.5;
    const texture = scene.textures.createCanvas(fittedTexture(id), 768, 512);
    const ctx = texture.context;
    FITTED_POSES.forEach((pose, i) => {
      const [x, y, w, h] = FITTED_RECTS[pose];
      const [ax, ay, tx, ty, scale] = COSTUME_REGISTRATION[id][i];
      ctx.save();
      ctx.scale(resolution, resolution);
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.translate(tx, ty); ctx.scale(scale, scale); ctx.translate(-ax, -ay);
      ctx.drawImage(source, x * source.width / 1536, y * source.height / 1024,
        w * source.width / 1536, h * source.height / 1024, x, y, w, h);
      ctx.restore();
      texture.add(pose, 0, ...[x, y, w, h].map(v => Math.round(v * resolution)));
    });
    texture.refresh();
    scene.textures.remove(`art-fit-source-${id}`);
  }
  // Original forepaws sit in FRONT of sleeves and held props. Reusing the
  // player's painted paws avoids the pasted-over hand effect of loose icons.
  const paws = scene.textures.createCanvas('art-costume-paws', 1536, 1024);
  const pawPaths = {
    idle: [[320,224],[337,224],[355,250],[377,254],[390,263],[398,272],[392,284],[376,286],[361,275],[342,273],[330,260]],
    'walk-a': [[892,305],[920,315],[922,360],[940,394],[965,412],[962,430],[942,434],[925,421],[900,383],[887,345]],
    'walk-b': [[1390,315],[1415,330],[1417,370],[1440,399],[1470,416],[1468,432],[1445,433],[1420,413],[1390,380],[1380,345]],
    jump: [[435,725],[457,723],[490,742],[541,752],[570,765],[579,780],[563,789],[539,779],[489,774],[449,755]],
    fall: [[930,652],[946,650],[962,662],[979,657],[989,669],[977,684],[958,685],[951,704],[938,700]],
    react: [[1370,756],[1385,751],[1400,767],[1420,770],[1440,785],[1446,800],[1433,809],[1415,798],[1394,793],[1377,779]],
  };
  const ratSource = scene.textures.get('rat-atlas').getSourceImage();
  for (const [pose, points] of Object.entries(pawPaths)) {
    const ctx = paws.context;
    ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));ctx.closePath();ctx.clip();
    ctx.drawImage(ratSource,0,0);ctx.restore();
    paws.add(pose,0,...FITTED_RECTS[pose]);
  }
  paws.refresh();
  const portraits = scene.textures.get('art-costume-portraits');
  const source = portraits.getSourceImage();
  const cell = Math.floor(source.width / 3), height = Math.floor(source.height / 3);
  ['crown','paperHat','helmet','cape','vest','sash','staff','sword','flower'].forEach((id, i) =>
    portraits.add(id, 0, (i % 3) * cell, Math.floor(i / 3) * height, cell, height),
  );
}

export function placeFitted(rat, layer) {
  const pose = rat.current, rect = FITTED_RECTS[pose], foot = POSE[pose].foot;
  const source = layer.texture.getSourceImage();
  const squash = rat.landing / 120;
  layer.setOrigin(rat.facing > 0 ? foot[0] / rect[2] : 1 - foot[0] / rect[2], foot[1] / rect[3]);
  layer.setFlipX(rat.facing < 0).setPosition(rat.sprite.x, rat.sprite.y);
  layer.setScale(rat.scale * 1536 / source.width * (1 + squash * 0.15), rat.scale * 1024 / source.height * (1 - squash * 0.1));
}
