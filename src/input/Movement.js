import { MOVEMENT } from "../data/config.js";
import { releaseAction } from "../state.js";
export function jumpVelocity(dx) {
  if (Math.abs(dx) < MOVEMENT.jumpDeadzone) return 0;
  return Math.max(
    -MOVEMENT.speed,
    Math.min(MOVEMENT.speed, (dx / 140) * MOVEMENT.speed),
  );
}
export class Movement {
  constructor(scene) {
    this.scene = scene;
    scene.input.on("pointerdown", (p, objects) => {
      if (
        !scene.player ||
        scene.locked ||
        objects.length ||
        p.button !== 0 ||
        performance.now() < (scene.inputBlockedUntil || 0)
      )
        return;
      scene.objectPress = null;
      scene.held = true;
    });
    scene.input.on("pointerup", (p) => {
      scene.objectPress = null;
      if (scene.pizzaControl?.pressed) {
        scene.pizzaControl.release();
        scene.held = false;
        return;
      }
      if (!scene.held || scene.locked) return;
      scene.held = false;
      const world = p.positionToCamera(scene.cameras.main);
      scene.player.body.setVelocityX(0);
      if (
        releaseAction(scene.player, world, MOVEMENT.upwardThreshold) ===
          "jump" &&
        !scene.jumping &&
        (scene.player.body.blocked.down ||
          scene.time.now - (scene.lastGrounded ?? -1000) < MOVEMENT.coyoteMs)
      ) {
        scene.player.body.setVelocity(
          jumpVelocity(world.x - scene.player.body.center.x),
          -MOVEMENT.jump,
        );
        scene.jumping = true;
        scene.lastGrounded = -1000;
        scene.squeak();
      }
    });
    const stop = () => {
      scene.pizzaControl?.release();
      scene.held = false;
      scene.objectPress = null;
      scene.player?.body.setVelocityX(0);
    };
    window.addEventListener("blur", stop);
    scene.input.on("gameout", stop);
  }
  reset() {
    this.scene.lastGrounded = -1000;
    this.scene.jumping = false;
    this.scene.held = false;
  }
  update(delta, p) {
    const s = this.scene,
      b = s.player.body;
    if (b.blocked.down) {
      s.lastGrounded = s.time.now;
      if (s.jumping && b.velocity.y >= 0) {
        s.jumping = false;
        s.rat.land();
      }
    }
    if (s.locked) {
      b.setVelocityX(0);
      return;
    }
    if (s.pizzaControl?.pressed && s.pizzaControl.dragged) {
      s.pizzaControl.update(delta, p);
      return;
    }
    if (s.held) {
      const dx = p.x - b.center.x;
      const desired =
        Math.abs(dx) < MOVEMENT.stopRadius
          ? 0
          : Math.max(
              -MOVEMENT.speed,
              Math.min(MOVEMENT.speed, dx * MOVEMENT.pointerGain),
            );
      const step = (MOVEMENT.acceleration * Math.min(delta, 40)) / 1000;
      b.setVelocityX(
        b.velocity.x + Math.max(-step, Math.min(step, desired - b.velocity.x)),
      );
    } else if (b.blocked.down) b.setVelocityX(0);
  }
}
