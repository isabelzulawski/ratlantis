import { AuditionArrival } from "./AuditionArrival.js";
import { fittedEntries, fittedTexture, placeFitted } from "../art/costume-fit.js";
import {
  FINAL_DIALOGUE as TEXT,
  EMOTIONS,
  TRAVEL_NAMES,
} from "../data/finale.js";
import { learn } from "../state.js";
import {
  completeEmotion,
  discoverAccessory,
} from "./finale-state.js";
import { FUR_TINT } from "../art/assets.js";
import { DanceLesson } from "./DanceLesson.js";
import { openWardrobe } from "./wardrobe.js";
export class FinalChapters {
  constructor(s) {
    this.s = s;
    this.overlays = [];
    this.arrival = new AuditionArrival(s);
  }
  setup() {
    const s = this.s;
    s.state.visited ??= [];
    if (TRAVEL_NAMES[s.id] && !s.state.visited.includes(s.id)) {
      s.state.visited.push(s.id);
      s.persist();
    }
    this.overlays = [];
    s.performance = null;
    this.emotionArt = s.add
      .image(0, 0, "art-emotions", "joy")
      .setOrigin(0.5, 0.88)
      .setDisplaySize(74, 100)
      .setTint(FUR_TINT[s.state.fur])
      .setDepth(18)
      .setVisible(false);
    if (s.id === "neighborhood") this.accessory("glasses", 915, 435);
    if (s.id === "brooklyn") {
      this.accessory("pendant", 1385, 380);
      s.add.image(1490, 325, "art-plaque").setDisplaySize(195, 85);
      s.add
        .text(1490, 325, "FERRY →", {
          fontFamily: "Georgia",
          fontSize: 17,
          color: "#ead5a4",
        })
        .setOrigin(0.5);
      s.interactive(1480, 420, 120, 115, null, () => this.board());
    }
    if (s.id === "ferry") {
      s.worker = s.add
        .sprite(790, 535, "art-worker", "worker")
        .setOrigin(0.60, 0.795)
        .setDisplaySize(109, 145);
      s.bindObject(s.worker.setInteractive({ useHandCursor: true }), () =>
        this.workerTalk(),
      );
      s.interactive(0, 420, 110, 115, null, () =>
        s.transitionTo("brooklyn", [1400, 485]),
      );
      s.interactive(1510, 420, 90, 115, null, () => this.toQueens());
    }
    if (s.id === "queens") {
      s.director = s.add
        .sprite(1010, 535, "art-director")
        .setOrigin(0.58, 0.925)
        .setDisplaySize(120, 80);
      s.bindObject(s.director.setInteractive({ useHandCursor: true }), () =>
        this.directorTalk(),
      );
      s.interactive(0, 420, 110, 115, null, () =>
        s.transitionTo("ferry", [1420, 485]),
      );
      s.interactive(1510, 420, 90, 115, null, () => this.toPipe());
    }
    if (s.id === "auditionPipe") {
      s.interactive(0, 420, 100, 115, null, () =>
        s.transitionTo("queens", [1420, 485]),
      );
      s.interactive(1680, 420, 120, 115, null, () => s.transitionTo("vent"));
    }
    this.arrival.setup();
    if (s.id === "vent") {
      s.interactive(0, 420, 100, 115, null, () =>
        s.transitionTo("auditionPipe", [1580, 485]),
      );
    }
  }
  accessory(id, x, y) {
    const s = this.s;
    if (s.state.accessories?.includes(id)) return;
    const item = s.add
      .image(
        x,
        y,
        id === "cap" ? "art-costumes" : "art-final-objects",
        id === "cap" ? "crown" : id,
      )
      .setOrigin(0.5, 1)
      .setDisplaySize(40, 32)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    s.bindObject(item, () => {
      if (
        Math.hypot(s.player.body.center.x - x, s.player.body.bottom - y) >
          135 ||
        (s.player.body.bottom > y + 50)
      ) {
        s.ui.message("Something glints up there.");
        return;
      }
      if (discoverAccessory(s.state, id)) s.playPickup();
      s.persist();
      item.destroy();
      s.ui.message(
        `Found: ${id === "glasses" ? "crooked jewelry-ring glasses" : id === "pendant" ? "a subway-token pendant" : id === "cap" ? "a bottle-cap hat" : "a little scarf"}.`,
      );
    }).setDepth(22);
  }
  board() {
    const s = this.s;
    if (!s.state.flags.ferryTicketAwarded) {
      s.ui.message(TEXT.ferryLocked);
      return;
    }
    s.transitionTo("ferry");
  }
  workerTalk() {
    const s = this.s;
    if (s.state.flags.dancing) {
      s.ui.message(TEXT.workerDone, () => {}, s.worker, "Ferry worker");
      return;
    }
    s.ui.dialogue(
      TEXT.workerReady,
      [
        {
          text: "I guess so",
          action: () => {
            this.dance?.cancel();
            this.dance = new DanceLesson(s, () =>
              s.ui.message(TEXT.workerDone, () => {}, s.worker, "Ferry worker"),
            );
            this.dance.open();
          },
        },
        { text: "I’m not so sure...", action: () => s.ui.clear() },
      ],
      s.worker,
      "Ferry worker",
    );
  }
  toQueens() {
    const s = this.s;
    if (!s.state.flags.dancing) {
      this.workerTalk();
      return;
    }
    s.transitionTo("queens");
  }
  directorTalk() {
    const s = this.s;
    if (s.state.flags.acting) {
      s.ui.message("Try anything on the rack. There is no wrong outfit.", () => openWardrobe(s), s.director, "Director");
      return;
    }
    s.state.flags.wardrobe = true;
    s.persist();
    s.ui.message(
      TEXT.directorIntro,
      () => openWardrobe(s, () => this.act()),
      s.director,
      "Director",
    );
  }
  act() {
    const s = this.s,
      index = s.state.actingRound || 0;
    if (index >= 3) {
      s.ui.message(TEXT.directorDone, () => {}, s.director, "Director");
      return;
    }
    const e = EMOTIONS[index];
    s.ui.dialogue(
      e.request,
      e.choices.map((text, i) => ({
        text,
        action: () => {
          s.performPlayer(e.emotion);
          if (i !== e.correct) {
            s.ui.message(
              TEXT.directorWrong,
              () => this.act(),
              s.director,
              "Director",
            );
            return;
          }
          completeEmotion(s.state, index);
          s.persist();
          s.ui.message(
            index === 2
              ? "That will do. You have your scene."
              : "Yes. Keep that feeling.",
            () => this.act(),
            s.director,
            "Director",
          );
        },
      })),
      s.director,
      "Director",
      "acting-prompt",
    );
  }
  toPipe() {
    const s = this.s;
    if (!s.state.flags.acting) {
      this.directorTalk();
      return;
    }
    s.transitionTo("auditionPipe");
  }
  travel() {
    const s = this.s,
      x = s.player.body.center.x;
    if (s.id === "brooklyn" && x > 1530) this.board();
    if (s.id === "ferry" && x < 65) s.transitionTo("brooklyn", [1400, 485]);
    if (s.id === "ferry" && x > 1540) this.toQueens();
    if (s.id === "queens" && x < 65) s.transitionTo("ferry", [1420, 485]);
    if (s.id === "queens" && x > 1540) this.toPipe();
    if (s.id === "auditionPipe" && x < 65)
      s.transitionTo("queens", [1420, 485]);
    if (s.id === "auditionPipe" && x > 1730) s.transitionTo("vent");
    if (s.id === "vent" && x < 60) s.transitionTo("auditionPipe", [1580, 485]);
  }
  update(time) {
    const s = this.s;
    const acting =
      !s.state.outfit?.body &&
      fittedEntries(s.state).length === 0 &&
      s.performance &&
      performance.now() < s.performance.until &&
      ["joy", "sorrow", "anger"].includes(s.performance.action);
    s.rat.sprite.setVisible(!acting);
    this.emotionArt?.setVisible(Boolean(acting));
    if (acting) {
      const a = s.performance.action;
      this.emotionArt
        .setFrame(a)
        .setPosition(
          s.player.body.center.x +
            (a === "anger" ? Math.sin(time / 40) * 3 : 0),
          s.player.body.bottom -
            (a === "joy"
              ? Math.sin(
                  ((performance.now() - s.performance.start) / 600) * Math.PI,
                ) * 18
              : 0),
        );
    }
    if (s.worker) {
      const swaying = this.dance && !this.dance.closed && Math.floor(time / 700) % 2;
      s.worker.setFrame(swaying ? "dance" : "worker");
      // The sheet's bodies have different horizontal centers; keep paws planted.
      s.worker.setOrigin(swaying ? 0.49 : 0.60, 0.795);
    }
    this.arrival.update();
  }

  updateAppearance() {
    const s = this.s;
    if (!s.rat?.sprite?.active) return;
    const entries = fittedEntries(s.state);
    while (this.overlays.length > entries.length) this.overlays.pop().destroy();
    entries.forEach((id, i) => {
      const texture = fittedTexture(id);
      const layer = (this.overlays[i] ??= s.add.image(0, 0, texture, s.rat.current));
      layer.setTexture(texture, s.rat.current).setDepth(18 + i * 0.01);
      layer.setVisible(s.rat.sprite.visible);
      // Reuse the protagonist's exact foot anchor, facing, scale and landing
      // squash, so clothes do not float, slide, or detach during animation.
      placeFitted(s.rat, layer);
    });
    if ((s.state.outfit?.body && s.state.outfit.body !== "vest") || s.state.outfit?.prop) {
      this.forepaws ??= s.add.image(0,0,'art-costume-paws',s.rat.current).setDepth(20);
      this.forepaws.setFrame(s.rat.current).setTint(FUR_TINT[s.state.fur]).setVisible(s.rat.sprite.visible);
      placeFitted(s.rat,this.forepaws);
    } else this.forepaws?.setVisible(false);
  }

  map() {
    const s = this.s;
    s.ui.panel(
      `<h2>Paths you know</h2>${(s.state.visited || [])
        .filter((id) => TRAVEL_NAMES[id])
        .map((id) => `<button data-travel="${id}">${TRAVEL_NAMES[id]}</button>`)
        .join("")}<button data-close>Close</button>`,
    );
    s.ui.root.querySelectorAll("[data-travel]").forEach(
      (b) =>
        (b.onclick = () => {
          s.ui.clear();
          s.enter(b.dataset.travel);
        }),
    );
    s.ui.root.querySelector("[data-close]").onclick = () => s.ui.clear();
  }
  wardrobe() {
    openWardrobe(this.s);
  }
  cleanup() {
    this.dance?.cancel();
    this.arrival.cleanup();
    this.overlays.forEach((o) => o.destroy());
    this.overlays = [];
    this.forepaws?.destroy();
    this.forepaws = null;
    this.emotionArt?.destroy();
    this.emotionArt = null;
    this.s.worker = null;
    this.s.director = null;
    this.s.ending = false;
  }
}
