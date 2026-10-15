import { FUR_TINT } from "./assets.js";
export const POSE = {
  idle: { foot: [308, 438], mouth: [436, 150] },
  "walk-a": { foot: [335, 436], mouth: [510, 273] },
  "walk-b": { foot: [290, 434], mouth: [480, 278] },
  jump: { foot: [350, 370], mouth: [580, 184] },
  fall: { foot: [226, 335], mouth: [343, 112] },
  react: { foot: [238, 442], mouth: [365, 160] },
};
// Poses are registered to a physical foot point, rather than each atlas cell's
// center. Texture margins and different poses cannot shift the collision body.
export class RatVisual {
  constructor(scene, fur, { scale = 0.16 } = {}) {
    this.scene = scene;
    this.scale = scale;
    this.facing = 1;
    this.phase = 0;
    this.current = "idle";
    this.landing = 0;
    this.shadow = scene.add.ellipse(0, 0, 43, 8, 0x05101b, 0.27).setDepth(13);
    this.sprite = scene.add
      .sprite(0, 0, "rat-atlas", "idle")
      .setTint(FUR_TINT[fur])
      .setDepth(17);
  }
  land() {
    this.landing = 120;
  }
  place(sprite, frame, footX, footY, squash = 0) {
    const data = POSE[frame],
      w = sprite.frame.realWidth,
      h = sprite.frame.realHeight;
    sprite
      .setOrigin(
        this.facing > 0 ? data.foot[0] / w : 1 - data.foot[0] / w,
        data.foot[1] / h,
      )
      .setFlipX(this.facing < 0);
    sprite
      .setPosition(footX, footY)
      .setScale(
        this.scale * (1 + squash * 0.15),
        this.scale * (1 - squash * 0.1),
      );
  }
  update(
    delta,
    footX,
    footY,
    { speed = 0, vy = 0, grounded = true, facing, frame, paused = false } = {},
  ) {
    if (facing) this.facing = facing;
    else if (Math.abs(speed) > 5) this.facing = Math.sign(speed);
    if (!paused) this.phase += (Math.abs(speed) * delta) / 1000;
    const next =
      frame ||
      (grounded
        ? Math.abs(speed) > 8
          ? Math.floor(this.phase / 28) % 2
            ? "walk-a"
            : "walk-b"
          : "idle"
        : vy < 0
          ? "jump"
          : "fall");
    const texture = this.scene.state?.outfit?.body === "vest" ? "art-waistcoat" : "rat-atlas";
    if (this.sprite.texture.key !== texture) this.sprite.setTexture(texture, this.current);
    if (next !== this.current) {
      this.current = next;
      this.sprite.setFrame(next);
    }
    this.landing = Math.max(0, this.landing - delta);
    const squash = this.landing / 120;
    this.sprite.setAlpha(1);
    this.place(this.sprite, this.current, footX, footY, squash);
    this.shadow
      .setPosition(footX, footY + 1)
      .setAlpha(grounded ? 0.28 : 0.08)
      .setScale(grounded ? 1 : 0.6, 1);
  }
}
