import Phaser from "phaser";
import { installIllustratedLook } from "../rendering/IllustratedPipeline.js";
import { validObjectClick } from "../interaction.js";
import { SCENES, MOVEMENT, DIALOGUE } from "../data/config.js";
import { loadAssets, setupArtFrames, FUR_TINT } from "../art/assets.js";
import { RatVisual } from "../art/RatVisual.js";
import { drawWorld, label, surface } from "../art/world.js";
import { save, learn, releaseAction, collectNewspaper } from "../state.js";
import { Movement } from "../input/Movement.js";
import { Pizza } from "../objects/Pizza.js";
import { UI } from "../ui.js";
import { FinalChapters } from "../chapters/FinalChapters.js";
import { BrooklynChapter } from "../chapters/BrooklynChapter.js";
export class Opening extends Phaser.Scene {
  constructor() {
    super("Opening");
  }
  preload() {
    this.load.on("progress", (value) => {
      const indicator = document.querySelector("#loading-progress");
      if (indicator)
        indicator.textContent = `Opening Ratlantis… ${Math.round(value * 100)}%`;
    });
    loadAssets(this);
  }
  create() {
    setupArtFrames(this);
    this.illustratedLook = installIllustratedLook(this);
    this.ui = new UI(this);
    this.chapter = new BrooklynChapter(this);
    this.finale = new FinalChapters(this);
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
    this.chapter?.cleanup();
    this.finale?.cleanup();
    this.pizzaControl?.cancel();
    this.pizzaControl = null;
    this.objectPress = null;
    this.collider?.destroy();
    this.collider = null;
    this.platforms?.clear(true, true);
    this.platforms = null;
    this.rideMaskShape?.destroy();
    this.rideMaskShape = null;
    this.time.removeAllEvents();
    this.tweens.killAll();
    // DisplayList.removeAll(true) skips callbacks; it does not destroy objects.
    // Destroy them so departed props cannot remain invisible input/physics targets.
    [...this.children.getChildren()].forEach((child) => child.destroy());
    this.commuters = [];
    this.motes = [];
    this.player = null;
    this.transitioning = false;
    document.querySelector("#hud")?.remove();
    document.querySelector(".hint")?.remove();
    document.querySelector("#world-cue")?.remove();
    this.ui.cue = null;
  }
  enter(id, spawn = null) {
    this.resetWorld();
    this.id = id;
    this.state.scene = id;
    this.state.journal = this.state.journal.map((line) =>
      line.replace(
        "Onward travel is unavailable in this build.",
        "Take the bridge maintenance ledge past the delivery depot.",
      ),
    );
    this.state.journal = this.state.journal.map((line) =>
      line.replace(
        "Ferry travel is not available yet.",
        "Follow the ferry boarding passage at the right of the Brooklyn alcove.",
      ),
    );
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
      .sprite(...(spawn || def.spawn), "rat-atlas", 0)
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
    this.safe = { x: (spawn || def.spawn)[0], y: (spawn || def.spawn)[1] };
    this.cameras.main
      .resetFX()
      .setBounds(0, 0, def.width, 675)
      .startFollow(this.player, true, 0.12, 0.12)
      .setDeadzone(180, 675)
      .setFollowOffset(-45, 0);
    this.cursor = this.add.graphics().setDepth(40);
    this.ui.hud(def.title);
    this.setupProps();
    this.chapter.setup();
    this.finale.setup();
    this.audioToggle();
  }
  transitionTo(id, spawn = null) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.freeze();
    this.cameras.main.fadeOut(160, 7, 18, 26);
    this.time.delayedCall(160, () => {
      this.enter(id, spawn);
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
    if (this.state.flags.audition) this.transitionTo("downtown");
    else if (!this.exitPrompted) {
      this.exitPrompted = true;
      this.ui.message("I should take another look around.");
    }
  }
  setupProps() {
    if (this.id === "street") {
      this.pizzaControl = new Pizza(this);
      // The art is already painted into the facade; only its exact quadrilateral is interactive.
      this.billboard = this.add.zone(0, 0, 2200, 675).setOrigin(0);
      if (!this.state.flags.audition) {
        this.billboard.setInteractive(
          new Phaser.Geom.Polygon([1272, 189, 1856, 110, 1861, 380, 1280, 432]),
          Phaser.Geom.Polygon.Contains,
        );
        this.billboard.input.cursor = "pointer";
        this.bindObject(this.billboard, () => this.inspectBillboard());
      }
      this.interactive(2045, 312, 150, 53, null, () => this.tryStreetExit());
    } else if (this.id === "downtown") {
      this.freeze();
      this.player.body.setAllowGravity(false);
      this.player.setY(580 - 23.27);
      this.travelPreviousX = this.player.x;
      this.tweens.add({
        targets: this.player,
        x: 1940,
        duration: 6000,
        ease: "Linear",
        onComplete: () => this.transitionTo("park"),
      });
      const skip = label(this, 1030, 81, "Skip →", 15)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      skip.on("pointerup", () => {
        if (!this.ui.root.firstChild) this.transitionTo("park");
      });
    } else if (this.id === "park") {
      this.setupPark();
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
      this.dockworker = this.add
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
      this.ui.worldCue(this.dockworker, "You can’t park that here!", () =>
        this.ui.dialogue(
          "…",
          DIALOGUE.dockChoices.map((text, i) => ({
            text,
            action: () =>
              this.ui.message(
                DIALOGUE.dockReplies[i],
                () => {
                  if (i === 2)
                    learn(
                      this.state,
                      "brooklyn",
                      "Lead: a retired busker in Brooklyn may help. Follow the bridge maintenance ledge past the delivery depot.",
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
                },
                this.dockworker,
                "Dockworker",
              ),
          })),
        ),
      );
      this.bindObject(
        this.dockworker.setInteractive({ useHandCursor: true }),
        () => this.ui.cue?.element.click(),
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
  setupPark() {
    this.squirrel = this.add
      .image(410, 586, "art-squirrel")
      .setOrigin(0.5, 1)
      .setDisplaySize(91, 105)
      .setDepth(12)
      .setInteractive({
        pixelPerfect: true,
        alphaTolerance: 80,
        useHandCursor: true,
      });
    this.bindObject(this.squirrel, () => this.squirrelConversation());
    this.map = this.add
      .image(1060, 587, "art-props", "map")
      .setOrigin(0.5, 1)
      .setDisplaySize(115, 58)
      .setAngle(-7)
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
    // Hit areas follow the notices and enamel sign painted into the lamppost.
    this.posters = [
      this.interactive(1271, 261, 81, 91, null, () =>
        this.ui.records.open("comparison", () => this.afterLamppost()),
      ),
      this.interactive(1278, 350, 79, 75, null, () =>
        this.ui.records.open("trend", () => this.afterLamppost()),
      ),
    ];
    this.interactive(1290, 509, 89, 40, null, () => this.tryParkExit());
  }
  squirrelConversation() {
    const lines = this.state.flags.lamppostInvited
      ? [DIALOGUE.squirrel.at(-1)]
      : DIALOGUE.squirrel;
    this.conversation(lines, () => {
      this.state.flags.lamppostInvited = true;
      this.persist();
    });
  }
  conversation(lines, after = () => {}) {
    let line = 0;
    const next = () => {
      if (line >= lines.length) {
        this.ui.clear();
        after();
        return;
      }
      const [speaker, text] = lines[line++];
      this.ui.dialogue(
        text,
        [{ text: "Continue", action: next }],
        speaker === "Squirrel" ? this.squirrel : null,
        speaker,
      );
    };
    next();
  }
  afterLamppost() {
    if (!this.state.flags.lamppostInvited || this.state.flags.newspaperReceived)
      return;
    this.conversation(DIALOGUE.squirrelAfterReading, () => {
      collectNewspaper(this.state);
      learn(
        this.state,
        "squirrel",
        "A park squirrel gave me a newspaper. I can read it from my backpack.",
      );
      this.persist();
      this.ui.records.open("newspaper");
    });
  }
  tryParkExit() {
    if (this.state.flags.map) this.transitionTo("station");
    else if (!this.exitPrompted) {
      this.exitPrompted = true;
      this.ui.message("I should take another look around.");
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
    this.ui.positionBubble();
    this.finale.update(time);
    const singing =
      this.singingActor && performance.now() < this.singingActor.until
        ? this.singingActor.who
        : null;
    if (this.busker)
      this.busker.setFrame(singing === "busker" ? "singing" : "idle");
    const p = this.input.activePointer.positionToCamera(this.cameras.main),
      panelOpen = !!this.ui.root.firstChild;
    this.drawCursor(p);
    if (this.id === "downtown") {
      const speed = panelOpen
        ? 0
        : Math.max(
            0,
            ((this.player.x - this.travelPreviousX) * 1000) /
              Math.max(1, delta),
          );
      this.travelPreviousX = this.player.x;
      this.rat.update(
        delta,
        this.player.body.center.x,
        this.player.body.bottom,
        { speed, grounded: true, paused: panelOpen },
      );
      return;
    }
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
    const performing =
      this.performance && performance.now() < this.performance.until
        ? this.performance
        : null;
    const lift =
      performing && ["jump", "joy"].includes(performing.action)
        ? Math.sin(((performance.now() - performing.start) / 600) * Math.PI) *
          24
        : 0;
    this.rat.update(delta, b.center.x, b.bottom - lift, {
      speed: b.velocity.x,
      vy: b.velocity.y,
      grounded: b.blocked.down,
      facing: tug ? -1 : undefined,
      frame: performing
        ? performing.frame
        : singing === "player"
          ? "react"
          : tug && Math.abs(b.velocity.x) < 8
            ? "walk-a"
            : undefined,
      paused: panelOpen,
    });
    this.finale.updateAppearance();
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
        this.chapter.travel();
        this.finale.travel();
        if (this.id === "street" && b.center.x > 2080) this.tryStreetExit();
        if (this.id === "street" && b.center.x < 1900)
          this.exitPrompted = false;
        if (this.id === "park" && b.center.x > 1370) this.tryParkExit();
        if (this.id === "park" && b.center.x < 1300) this.exitPrompted = false;
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
    if (["vent", "auditionRoom"].includes(this.id)) {
      if (this.gain) this.gain.gain.value = 0;
      return;
    }
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
  performPlayer(action) {
    const frame =
      action === "jump" ? "jump" : action === "sorrow" ? "fall" : "react";
    this.performance = {
      frame,
      action,
      start: performance.now(),
      until: performance.now() + 600,
    };
    if (action === "left" || action === "right")
      this.rat.facing = action === "left" ? -1 : 1;
  }
  playLessonNote(hz, duration) {
    if (!this.state.sound) return;
    this.audioToggle();
    if (!this.audio) return;
    const oscillator = this.audio.createOscillator(),
      gain = this.audio.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = hz;
    const now = this.audio.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(this.audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
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
