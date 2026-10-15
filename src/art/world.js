// Illustrated backdrops never define collisions. Scene data remains the source
// of truth for ledges; only those ledges get a readable painted upper edge.
const FONT = "American Typewriter, Palatino, Georgia, serif";
export function drawWorld(s, id, width) {
  s.add.rectangle(width / 2, 337, width, 675, 0x091a27).setDepth(-30);
  const placement = {
    street: ["street", 24, 675],
    ferry: ["ferry", 0, 735],
    queens: ["queens", 0, 815],
    auditionPipe: ["conduit", 0, 795],
    vent: ["vent", 0, 675],
    auditionRoom: ["auditionRoom", 0, 675],
    bridge: ["bridge", 0, 850],
    brooklyn: ["brooklyn", 0, 720],
    downtown: ["downtown", 24, 675],
    park: ["park", 0, 740],
    station: ["station", 0, 825],
    arrivalStation: ["station", 0, 825],
    neighborhood: ["neighborhood", -4, 838],
    sewer: ["sewer", 0, 806],
    ride: ["ride", 0, 675],
  };
  if (placement[id]) {
    const [key, y, h] = placement[id];
    s.background = s.add
      .image(0, y, `art-${key}`, "__BASE")
      .setOrigin(0)
      .setDisplaySize(width, h)
      .setDepth(-20);
    s.background.setTint(0xc4c6c9);
    if (id === "vent") {
      // Crop uniformly so the pipe floor meets the y=535 collision surface and
      // the small horizontal opening sits ahead of the approaching rat.
      s.background.setDisplaySize(1511, 850).setPosition(-300, -48);
    }
    if (id === "auditionRoom") {
      // Uniform scale, then crop: match the painted vent lip to y=535 without
      // squeezing the human-scale room into a narrow game viewport.
      s.background.setDisplaySize(1600, 900).setPosition(-65, -85);
    }
    if (id === "arrivalStation") {
      // Keep the source artwork's proportions; show a platform crop instead
      // of squeezing the wide station into this shorter scene.
      const source = s.textures.get(`art-${key}`).getSourceImage();
      s.background
        .setDisplaySize((source.width / source.height) * h, h)
        .setX(-650);
    }
  }
  if (id === "ride") {
    const g = s.add.graphics().setDepth(-18);
    for (const [x, y, w, h] of [
      [45, 125, 305, 190],
      [425, 125, 337, 190],
      [825, 125, 337, 190],
    ])
      g.fillStyle(0x071722, 1).fillRoundedRect(x, y, w, h, 13);
  }
  if (id === "station") {
    // Actual stair geometry is drawn over the entrance cutaway and matches data.
    s.add
      .image(875, 315, "art-tile", "__BASE")
      .setDisplaySize(345, 93)
      .setDepth(-10);
  } else if (id === "arrivalStation") {
  } else if (id === "neighborhood") {
    s.add.image(1920, 270, "art-plaque").setDisplaySize(300, 135);
    label(s, 1920, 270, "BROOKLYN BRIDGE →", 14)
      .setOrigin(0.5)
      .setAlign("center");
  } else if (id === "sewer") {
  } else if (id === "fall") {
    s.background = s.add
      .image(0, 0, "art-pipe", "__BASE")
      .setOrigin(0)
      .setDisplaySize(1200, 675)
      .setDepth(-20);
  }
  // Restrained darkness around the frame keeps the rat and warm lights readable.
  const v = s.add.graphics().setScrollFactor(0).setDepth(25);
  for (let i = 0; i < 16; i++) {
    v.fillStyle(0x04111b, 0.012)
      .fillRect(0, 0, 1200, 3 + i * 2)
      .fillRect(0, 665 - i * 2, 1200, 10 + i * 2);
  }
  // Dust motes are decorative and have no input or collision bodies.
  s.motes = [];
  if (["neighborhood", "sewer", "street", "park"].includes(id))
    for (let i = 0; i < 30; i++) {
      const x = (i * 139.3) % width,
        y = 110 + ((i * 83.7) % 370);
      const mote = s.add
        .circle(x, y, i % 3 === 0 ? 1.2 : 0.7, 0xe8c487, 0.15 + (i % 4) * 0.07)
        .setDepth(4);
      s.motes.push({ mote, x, y, phase: i });
    }
}
export function label(s, x, y, text, size = 16) {
  return s.add.text(x, y, text, {
    fontFamily: FONT,
    resolution: 2,
    fontSize: size,
    color: "#ebd7b0",
    stroke: "#091722",
    strokeThickness: 3,
    shadow: { offsetY: 2, color: "#040e18", blur: 5, fill: true },
  });
}
export function surface(s, x, y, w, h) {
  if (s.id === "ride") return;
  if (s.id === "auditionRoom") {
    // The painted metal pipe lip is the platform; do not add a wooden plank.
    return s.add.graphics().setDepth(2).lineStyle(1, 0xcbb586, 0.25).lineBetween(x, y, x + w, y);
  }
  if (s.id === "street" && w < 600) {
    return s.add
      .image(x, y + h, "art-details", x === 420 ? "box" : "stack")
      .setOrigin(0, 1)
      .setDisplaySize(w, h)
      .setDepth(6);
  }
  if (w > 600 || (s.id === "sewer" && x === 100)) {
    const edge = s.add.graphics().setDepth(2);
    edge.lineStyle(1, 0xe2c28a, 0.2).lineBetween(x, y, x + w, y);
    return edge;
  }
  if (s.id === "station")
    return s.add
      .image(x, y, "art-details", "step")
      .setOrigin(0, 0)
      .setDisplaySize(w, Math.max(27, h))
      .setDepth(3);
  const plank = s.add
    .image(x + w / 2, y + Math.min(h, 24) / 2, "art-props", "plank")
    .setDisplaySize(w, Math.max(25, h))
    .setDepth(3);
  const edge = s.add.graphics().setDepth(4);
  edge.lineStyle(1, 0xddc28d, 0.45).lineBetween(x, y, x + w, y);
  return plank;
}
