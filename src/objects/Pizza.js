import { collectPizza } from "../state.js";
import { MOVEMENT } from "../data/config.js";
export const PIZZA = { width: 126, height: 64, ground: 594, biteOffset: 82 };
export class Pizza {
  constructor(scene) {
    this.scene = scene;
    this.pressed = false;
    this.dragged = false;
    this.attached = false;
    const saved = scene.state.props?.pizzaX;
    this.image = scene.add
      .image(
        Number.isFinite(saved) ? Math.max(90, Math.min(2050, saved)) : 300,
        PIZZA.ground,
        "art-props",
        "pizza",
      )
      .setOrigin(0.5, 1)
      .setDisplaySize(PIZZA.width, PIZZA.height)
      .setAngle(-5)
      .setDepth(8)
      .setInteractive({
        pixelPerfect: true,
        alphaTolerance: 80,
        useHandCursor: true,
      });
    scene.pizza = this.image;
    scene.input.setDraggable(this.image);
    scene.input.dragDistanceThreshold = 8;
    this.shadow = scene.add
      .ellipse(this.image.x, PIZZA.ground, 119, 7, 0x081421, 0.18)
      .setDepth(5);
    this.image.on("pointerdown", (p) => {
      if (scene.locked) return;
      scene.held = false;
      scene.player.body.setVelocityX(0);
      this.pressed = true;
      this.dragged = false;
      this.attached = false;
      this.offset = p.worldX - this.image.x;
    });
    this.image.on("dragstart", () => {
      if (!this.pressed || scene.locked) return;
      this.dragged = true;
      this.target = this.image.x;
    });
    this.image.on("drag", (p) => {
      if (this.dragged && !scene.locked)
        this.target = Math.max(90, Math.min(2050, p.worldX - this.offset));
    });
    this.image.on("dragend", () => this.release());
    this.image.on("pointerup", () => {
      if (this.pressed && !this.dragged) {
        this.pressed = false;
        this.inspect();
      }
    });
    this.image.on("pointerover", () => this.image.setTint(0xfff4d6));
    this.image.on("pointerout", () => this.image.clearTint());
  }
  inspect() {
    const s = this.scene;
    if (s.locked) return;
    s.ui.dialogue("A discarded pizza slice.", [
      {
        text: "Pack a piece",
        action: () => {
          const added = collectPizza(s.state);
          s.persist();
          s.ui.message(
            added
              ? "A pizza piece is packed."
              : "You already packed a piece from this slice.",
          );
        },
      },
      { text: "Leave it.", action: () => s.ui.clear() },
    ]);
  }
  update(delta) {
    const s = this.scene,
      b = s.player.body;
    const goal =
      (this.attached ? this.target : this.image.x) + PIZZA.biteOffset;
    const dx = goal - b.center.x;
    const desired = Math.max(
      -MOVEMENT.pizzaSpeed,
      Math.min(MOVEMENT.pizzaSpeed, dx * 6),
    );
    b.setVelocityX(Math.abs(dx) < 2 ? 0 : desired);
    if (!this.attached && Math.abs(dx) < 5 && b.blocked.down)
      this.attached = true;
    if (this.attached) {
      this.image.x = Math.max(
        90,
        Math.min(2050, b.center.x - PIZZA.biteOffset),
      );
      this.image.y = PIZZA.ground;
      this.image.setAngle(-2);
    }
    this.shadow.x = this.image.x;
  }
  release() {
    if (!this.pressed && !this.dragged) return;
    const wasDrag = this.dragged;
    // Keep dragged true through this pointer-up dispatch to suppress inspection.
    this.pressed = false;
    this.attached = false;
    this.scene.held = false;
    this.scene.player?.body.setVelocityX(0);
    this.image.y = PIZZA.ground;
    this.image.clearTint().setAngle(-5);
    if (wasDrag) {
      this.scene.state.props ??= {};
      this.scene.state.props.pizzaX = this.image.x;
      this.scene.persist();
    }
  }
  cancel() {
    this.release();
    this.dragged = false;
  }
}
