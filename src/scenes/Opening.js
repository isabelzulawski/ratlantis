import Phaser from "phaser";
import { validObjectClick } from "../interaction.js";
import { SCENES, MOVEMENT, DIALOGUE } from "../data/config.js";
import { loadAssets, setupArtFrames, FUR_TINT } from "../art/assets.js";
import { RatVisual } from "../art/RatVisual.js";
import { drawWorld, label, surface } from "../art/world.js";
import { save, learn, releaseAction } from "../state.js";
import { Movement } from "../input/Movement.js";
import { Pizza } from "../objects/Pizza.js";
import { UI } from "../ui.js";
export class Opening extends Phaser.Scene {
  constructor() {
    super("Opening");
  }
  preload() {
    loadAssets(this);
  }
  create() {
    setupArtFrames(this);
    this.ui = new UI(this);
    this.locked = true;
    this.held = false;
    this.movement = new Movement(this);
    this.showTitleArt();
    this.ui.title();
    window.ratlantis = this;
  }
  showTitleArt() {
    this.cameras.main.stopFollow();
    this.cameras.main.setBounds(0, 0, 1200, 675).setScroll(0, 0);
    this.add
      .image(0, 0, "art-neighborhood")
      .setOrigin(0)
      .setDisplaySize(1500, 675)
      .setDepth(-20);
    this.add.rectangle(600, 337, 1200, 675, 0x05101b, 0.15).setDepth(-10);
  }
  persist() {
    if (!save(this.state)) this.saveFailed = true;
  }
  freeze() {
    this.pizzaControl?.cancel();
    this.locked = true;
    this.held = false;
    this.objectPress = null;
    this.player?.body.setVelocityX(0);
  }
  resetWorld() {
    this.pizzaControl?.cancel();
    this.pizzaControl = null;
    this.objectPress = null;
    this.collider?.destroy();
    this.platforms?.clear(true, true);
    this.rideMaskShape?.destroy();
    this.rideMaskShape = null;
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.children.removeAll(true);
    this.commuters = [];
    this.motes = [];
    this.player = null;
    this.transitioning = false;
    document.querySelector("#hud")?.remove();
    document.querySelector(".hint")?.remove();
  }
  enter(id) {
    this.resetWorld();
    this.id = id;
    this.state.scene = id;
    this.persist();
    this.locked = false;
    this.movement.reset();
    this.exitPrompted = false;
    const def = SCENES[id];
    this.def = def;
    drawWorld(this, id, def.width);
    this.platforms = this.physics.add.staticGroup();
    def.platforms.forEach(([x, y, w, h]) => {
      surface(this, x, y, w, h);
      const body = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0);
      this.physics.add.existing(body, true);
      this.platforms.add(body);
    });
    this.player = this.physics.add
      .sprite(...def.spawn, "rat-atlas", 0)
      .setScale(0.13)
      .setAlpha(0);
    this.player.body
      .setSize(220, 300)
      .setOffset(240, 135)
      .setGravityY(MOVEMENT.gravity);
    this.collider = this.physics.add.collider(
      this.player,
      this.platforms,
      undefined,
      (rat, platform) => {
        if (platform.body.width > 600) return true;
        return (
          rat.body.velocity.y >= 0 &&
          rat.body.prev.y + rat.body.height <= platform.body.top + 8
        );
      },
    );
    this.rat = new RatVisual(this, this.state.fur);
    this.playerArt = this.rat.sprite;
    this.safe = { x: def.spawn[0], y: def.spawn[1] };
    this.cameras.main
      .resetFX()
      .setBounds(0, 0, def.width, 675)
      .startFollow(this.player, true, 0.12, 0.12)
      .setDeadzone(180, 675)
      .setFollowOffset(-45, 0);
    this.cursor = this.add.graphics().setDepth(40);
    this.ui.hud(def.title);
    this.setupProps();
    this.audioToggle();
  }
  transitionTo(id) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.freeze();
    this.cameras.main.fadeOut(160, 7, 18, 26);
    this.time.delayedCall(160, () => {
      this.enter(id);
      this.cameras.main.fadeIn(230, 7, 18, 26);
    });
  }
  // Direct objects use a matching press/release. Moving the mouse while held is
  // still movement; releasing that gesture over a prop never becomes inspection.
  bindObject(object, action) {
    object.setDepth(10);
    object.on("pointerdown", (p) => {
      if (this.locked || performance.now() < (this.inputBlockedUntil || 0))
        return;
      this.held = false;
      this.player.body.setVelocityX(0);
      this.objectPress = {
        target: object,
        pointerId: p.id,
        x: p.x,
        y: p.y,
        startedAt: performance.now(),
      };
    });
    object.on("pointerup", (p) => {
      const press = this.objectPress;
      this.objectPress = null;
      if (validObjectClick(press, object, p, this.locked)) action();
    });
    return object;
  }
  interactive(x, y, w, h, text, action) {
    return this.bindObject(
      this.add
        .rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
        .setInteractive({ useHandCursor: true }),
      action,
    );
  }
  inspectBillboard() {
    if (this.state.flags.audition) {
      return;
    }
    this.ui.dialogue(
      "Open Auditions…",
      DIALOGUE.billboard.map((text) => ({
        text,
        action: () => {
          learn(this.state, "audition", "Goal: try for a Broadway audition.");
          this.persist();
          this.billboard.disableInteractive();
          this.ui.clear();
        },
      })),
    );
  }
  tryStreetExit() {
    if (this.state.flags.map && this.state.flags.audition)
      this.transitionTo("station");
    else if (!this.exitPrompted) {
      this.exitPrompted = true;
      this.ui.message("I should take another look around.");
    }
  }
  setupProps() {
    if (this.id === "street") {
      this.pizzaControl = new Pizza(this);
      this.billboard = this.add
        .image(1565, 266, "art-broadway", "__BASE")
        .setDisplaySize(505, 300)
        .setDepth(2);
      if (!this.state.flags.audition) {
        this.billboard.setInteractive({
          pixelPerfect: true,
          alphaTolerance: 120,
          useHandCursor: true,
        });
        this.bindObject(this.billboard, () => this.inspectBillboard());
      }
      this.map = this.add
        .image(1760, 580, "art-props", "map")
        .setOrigin(0.5, 1)
        .setDisplaySize(139, 70)
        .setDepth(8)
        .setInteractive({
          pixelPerfect: true,
          alphaTolerance: 80,
          useHandCursor: true,
        });
      this.bindObject(this.map, () =>
        this.ui.message(DIALOGUE.map, () => {
          learn(
            this.state,
            "map",
            "Next destination: Broadway–Lafayette station.",
          );
          this.persist();
        }),
      );
      this.map.on("pointerover", () => this.map.setTint(0xfff0bf));
      this.map.on("pointerout", () => this.map.clearTint());
      this.entrance = this.add
        .image(2060, 583, "art-details", "entrance")
        .setOrigin(0.5, 1)
        .setDisplaySize(235, 226)
        .setDepth(7)
        .setInteractive({
          pixelPerfect: true,
          alphaTolerance: 80,
          useHandCursor: true,
        });
      this.bindObject(this.entrance, () => this.tryStreetExit());
    } else if (this.id === "station") {
      this.interactive(1640, 290, 150, 290, null, () =>
        this.transitionTo("ride"),
      );
    } else if (this.id === "ride") {
      this.freeze();
      this.player.body.setAllowGravity(false);
      this.rideElapsed = 0;
      const shape = this.make.graphics({ x: 0, y: 0 }, false);
      this.rideMaskShape = shape;
      for (const [x, y, w, h] of [
        [45, 125, 305, 190],
        [425, 125, 337, 190],
        [825, 125, 337, 190],
      ])
        shape.fillStyle(0xffffff).fillRoundedRect(x, y, w, h, 13);
      const mask = shape.createGeometryMask();
      this.rideTunnel = this.add
        .tileSprite(600, 220, 1200, 210, "art-station", "tunnel-wall")
        .setTint(0x526579)
        .setAlpha(0.7)
        .setDepth(-17)
        .setMask(mask);
      this.rideLights = this.add.graphics().setDepth(-16).setMask(mask);
      this.time.delayedCall(6500, () => this.transitionTo("arrivalStation"));
      const skip = label(this, 1030, 81, "Skip →", 15).setInteractive({
        useHandCursor: true,
      });
      skip.on("pointerup", () => {
        if (!this.ui.root.firstChild) this.transitionTo("arrivalStation");
      });
    } else if (this.id === "arrivalStation") {
      this.drain = this.add
        .image(1248, 581, "art-details", "drain")
        .setOrigin(0.5, 1)
        .setDisplaySize(112, 79)
        .setDepth(6)
        .setInteractive({
          pixelPerfect: true,
          alphaTolerance: 80,
          useHandCursor: true,
        });
      this.bindObject(this.drain, () => this.transitionTo("fall"));
    } else if (this.id === "fall") {
      this.freeze();
      this.player.body.setAllowGravity(false);
      this.tweens.add({
        targets: this.player,
        x: 1050,
        y: 510,
        angle: 38,
        duration: 1500,
        ease: "Quad.in",
        onComplete: () => this.transitionTo("sewer"),
      });
    } else if (this.id === "sewer") {
      this.interactive(1660, 340, 130, 165, null, () =>
        this.transitionTo("neighborhood"),
      );
    } else if (this.id === "neighborhood") {
      this.add
        .image(245, 535, "rat-atlas", "react")
        .setOrigin(238 / 436, 442 / 512)
        .setTint(FUR_TINT.Brown)
        .setScale(0.155)
        .setDepth(12);
      this.add
        .image(258, 532, "art-details", "parcel")
        .setOrigin(0.5, 1)
        .setDisplaySize(25, 16)
        .setDepth(13);
      const bubble = this.add.graphics().setDepth(11);
      bubble.fillStyle(0xede0bd, 0.94).fillRoundedRect(150, 420, 258, 39, 12);
      bubble.fillTriangle(238, 458, 250, 458, 243, 469);
      this.add
        .text(163, 430, "“You can’t park that here!”", {
          fontFamily: "Avenir Next, sans-serif",
          fontSize: 14,
          color: "#3f372a",
        })
        .setDepth(12);
      this.interactive(150, 420, 258, 48, null, () =>
        this.ui.dialogue(
          "You can’t park that here!",
          DIALOGUE.dockChoices.map((text, i) => ({
            text,
            action: () =>
              this.ui.message(DIALOGUE.dockReplies[i], () => {
                if (i === 2)
                  learn(
                    this.state,
                    "brooklyn",
                    "Lead: a retired singer in Brooklyn may help. Onward travel is unavailable in this build.",
                  );
                if (i === 0)
                  learn(
                    this.state,
                    "ratlantis",
                    "This underground neighborhood is Ratlantis.",
                  );
                if (i === 1)
                  learn(
                    this.state,
                    "pipe",
                    "The entry pipe is too high to reach again.",
                  );
                this.persist();
              }),
          })),
        ),
      );
      [600, 1070, 1450, 1810].forEach((x, i) => {
        const r = this.add
          .image(x, 535, "rat-atlas", "walk-a")
          .setOrigin(335 / 530, 436 / 500)
          .setScale(0.115)
          .setTint(FUR_TINT[i % 2 ? "Gray" : "Brown"])
          .setDepth(11);
        const parcel = this.add
          .image(x - 8, 518, "art-details", "parcel")
          .setDisplaySize(18, 12)
          .setDepth(12);
        this.commuters.push({ r, parcel, x, phase: i });
      });
    }
  }
  drawCursor(p) {
    this.cursor.clear();
    if (this.locked) return;
    const hit = this.input.hitTestPointer(this.input.activePointer).length > 0;
    const jump =
      !hit &&
      releaseAction(this.player, p, MOVEMENT.upwardThreshold) === "jump";
    const x = p.x + 17,
      y = p.y + 15;
    this.cursor
      .lineStyle(1.3, jump ? 0xffd88d : 0xe5ddc5, 0.85)
      .strokeCircle(x, y, 9);
    if (hit) {
      this.cursor
        .lineStyle(1.3, 0xffd88d)
        .lineBetween(x - 3, y, x + 3, y)
        .lineBetween(x, y - 3, x, y + 3);
    } else if (jump) {
      this.cursor
        .lineStyle(1.5, 0xffd88d)
        .lineBetween(x, y + 4, x, y - 5)
        .lineBetween(x, y - 5, x - 4, y - 1)
        .lineBetween(x, y - 5, x + 4, y - 1);
    } else this.cursor.fillStyle(0xe5ddc5, 0.85).fillRect(x - 2, y - 2, 4, 4);
  }
  update(time, delta) {
    if (!this.player) return;
    const p = this.input.activePointer.positionToCamera(this.cameras.main),
      panelOpen = !!this.ui.root.firstChild;
    this.drawCursor(p);
    if (this.id === "ride") {
      if (!panelOpen) this.rideElapsed += Math.min(delta, 50);
      this.rideTunnel.tilePositionX = this.rideElapsed * 0.5;
      this.rideLights.clear().fillStyle(0xd8b573, 0.1);
      for (let i = 0; i < 7; i++)
        this.rideLights.fillRect(
          (((i * 200 - this.rideElapsed * 0.55) % 1200) + 1200) % 1200,
          180,
          17,
          80,
        );
      this.rat.update(
        delta,
        this.player.body.center.x,
        this.player.body.bottom,
        { grounded: true, paused: true },
      );
      return;
    }
    if (this.id === "fall") {
      this.rat.update(
        delta,
        this.player.body.center.x,
        this.player.body.bottom,
        { frame: "fall", grounded: false, paused: panelOpen },
      );
      this.playerArt.setRotation(this.player.rotation);
      return;
    }
    this.movement.update(delta, p);
    const b = this.player.body;
    this.player.x = Phaser.Math.Clamp(this.player.x, 30, this.def.width - 30);
    if (b.blocked.down) {
      const stable = this.def.platforms.some(
        ([x, y, w]) =>
          Math.abs(b.bottom - y) < 3 &&
          b.center.x > x + 10 &&
          b.center.x < x + w - 10,
      );
      if (stable) this.safe = { x: this.player.x, y: this.player.y - 3 };
    }
    if (this.player.y > MOVEMENT.recoveryY) {
      this.player.setPosition(this.safe.x, this.safe.y);
      b.setVelocity(0);
      this.movement.reset();
    }
    const tug =
      this.pizzaControl?.pressed &&
      this.pizzaControl.dragged &&
      this.pizzaControl.attached;
    this.rat.update(delta, b.center.x, b.bottom, {
      speed: b.velocity.x,
      vy: b.velocity.y,
      grounded: b.blocked.down,
      facing: tug ? -1 : undefined,
      frame: tug && Math.abs(b.velocity.x) < 8 ? "walk-a" : undefined,
      paused: panelOpen,
    });
    if (!panelOpen) {
      this.motes.forEach(({ mote, x, y, phase }) => {
        mote.x = x + Math.sin(time / 3700 + phase) * 9;
        mote.y = y + Math.cos(time / 2800 + phase) * 7;
      });
      this.commuters.forEach(({ r, parcel, x, phase }) => {
        r.x = x + Math.sin(time / 2400 + phase) * 75;
        const frame = Math.floor(time / 150 + phase) % 2 ? "walk-a" : "walk-b";
        r.setFrame(frame);
        const foot = frame === "walk-a" ? 335 : 290;
        const left = Math.cos(time / 2400 + phase) < 0;
        r.setOrigin(
          left ? 1 - foot / r.frame.realWidth : foot / r.frame.realWidth,
          436 / 500,
        ).setFlipX(left);
        parcel.x = r.x + (left ? 7 : -7);
      });
      if (!this.locked && this.held && b.blocked.down) {
        if (this.id === "street" && b.center.x > 2080) this.tryStreetExit();
        if (this.id === "street" && b.center.x < 1900)
          this.exitPrompted = false;
        if (this.id === "station" && b.center.x > 1670)
          this.transitionTo("ride");
        if (this.id === "arrivalStation" && b.center.x > 1215)
          this.transitionTo("fall");
        if (this.id === "sewer" && b.center.x > 1650)
          this.transitionTo("neighborhood");
      }
    }
  }
  audioToggle() {
    if (this.state.sound) {
      try {
        this.audio ??= new AudioContext();
        this.audio.resume();
        if (!this.ambient) {
          this.ambient = this.audio.createOscillator();
          this.gain = this.audio.createGain();
          this.ambient.type = "sine";
          this.ambient.frequency.value = 74;
          this.gain.gain.value = 0.012;
          this.ambient.connect(this.gain).connect(this.audio.destination);
          this.ambient.start();
        }
        this.gain.gain.value = 0.012;
      } catch {}
    } else if (this.gain) this.gain.gain.value = 0;
  }
  squeak() {
    if (!this.state.sound || !this.audio) return;
    const o = this.audio.createOscillator(),
      g = this.audio.createGain();
    o.frequency.setValueAtTime(800, this.audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(
      1200,
      this.audio.currentTime + 0.07,
    );
    g.gain.setValueAtTime(0.02, this.audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + 0.1);
    o.connect(g).connect(this.audio.destination);
    o.start();
    o.stop(this.audio.currentTime + 0.1);
  }
}
