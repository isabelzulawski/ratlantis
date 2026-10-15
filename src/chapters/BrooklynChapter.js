import { BUSKER } from "../data/brooklyn.js";
import { collectBread, giveFood, awardTicket } from "./brooklyn-state.js";
import { learn } from "../state.js";
import { SingingLesson } from "./SingingLesson.js";
export class BrooklynChapter {
  constructor(scene) {
    this.scene = scene;
  }
  setup() {
    const s = this.scene;
    if (s.id === "neighborhood") {
      if (!s.state.flags.breadPacked) {
        s.bread = s.add
          .image(525, 535, "art-chapter-items", "bread")
          .setOrigin(0.5, 1)
          .setDisplaySize(52, 38)
          .setDepth(9)
          .setInteractive({ pixelPerfect: true, useHandCursor: true });
        s.bindObject(s.bread, () =>
          s.ui.dialogue("A discarded piece of bread.", [
            {
              text: "Pack it",
              action: () => {
                collectBread(s.state);
                s.persist();
                s.bread?.destroy();
                s.ui.clear();
              },
            },
            { text: "Leave it", action: () => s.ui.clear() },
          ]),
        );
      }
      s.interactive(1935, 400, 165, 135, null, () => s.transitionTo("bridge"));
    }
    if (s.id === "bridge") {
      s.interactive(0, 425, 115, 110, null, () =>
        s.transitionTo("neighborhood", [1920, 485]),
      );
      s.interactive(2280, 425, 120, 110, null, () =>
        s.transitionTo("brooklyn"),
      );
    }
    if (s.id === "brooklyn") {
      s.busker = s.add
        .sprite(1000, 535, "art-busker", "idle")
        .setOrigin(0.42, 0.875)
        .setDisplaySize(102, 130)
        .setDepth(12)
        .setInteractive({
          pixelPerfect: true,
          alphaTolerance: 60,
          useHandCursor: true,
        });
      s.bindObject(s.busker, () => this.talk());
      s.interactive(0, 425, 125, 110, null, () =>
        s.transitionTo("bridge", [2260, 485]),
      );
    }
  }
  talk() {
    const s = this.scene;
    if (s.state.flags.singing) {
      if (!s.state.flags.ferryTicketAwarded) this.gift();
      else s.ui.message(BUSKER.revisit, () => {}, s.busker, "Busker");
      return;
    }
    if (s.state.flags.buskerFed) {
      s.ui.dialogue(
        BUSKER.ready,
        [
          { text: "Let’s practice", action: () => this.lesson() },
          { text: "A little later", action: () => s.ui.clear() },
        ],
        s.busker,
        "Busker",
      );
      return;
    }
    s.ui.dialogue(
      BUSKER.greeting,
      BUSKER.choices.map((text, i) => ({
        text,
        action: () =>
          s.ui.message(
            BUSKER.replies[i],
            () => {
              learn(s.state, "buskerMet", "Met a retired busker in Brooklyn.");
              s.persist();
            },
            s.busker,
            "Busker",
          ),
      })),
      s.busker,
      "Busker",
    );
  }
  drop(item, x, y) {
    const s = this.scene;
    if (s.id !== "brooklyn" || !s.busker) return false;
    const bounds = s.busker.getBounds();
    const nearby = Math.abs(s.player.body.center.x - s.busker.x) < 230;
    if (!nearby || !bounds.contains(x, y)) return false;
    if (!giveFood(s.state, item, "busker")) return false;
    s.persist();
    return true;
  }
  afterFood() {
    const s = this.scene;
    s.ui.message(BUSKER.thanks, () => this.talk(), s.busker, "Busker");
  }
  lesson() {
    this.lessonUI?.cancel();
    this.lessonUI = new SingingLesson(this.scene, () => this.gift());
    this.lessonUI.open();
  }
  gift() {
    const s = this.scene;
    if (s.state.flags.ferryTicketAwarded) return;
    let index = 0;
    const next = () => {
      if (index === BUSKER.gift.length) {
        awardTicket(s.state);
        s.persist();
        s.ui.clear();
        return;
      }
      const [speaker, text] = BUSKER.gift[index++];
      s.ui.dialogue(
        text,
        [{ text: "Continue", action: next }],
        speaker === "Busker" ? s.busker : null,
        speaker,
      );
    };
    next();
  }
  travel() {
    const s = this.scene,
      x = s.player.body.center.x;
    if (s.id === "neighborhood" && x > 2025) s.transitionTo("bridge");
    else if (s.id === "bridge" && x > 2320) s.transitionTo("brooklyn");
    else if (s.id === "bridge" && x < 65)
      s.transitionTo("neighborhood", [1920, 485]);
    else if (s.id === "brooklyn" && x < 65)
      s.transitionTo("bridge", [2260, 485]);
  }
  cleanup() {
    this.lessonUI?.cancel();
    this.lessonUI = null;
    this.scene.busker = null;
    this.scene.bread = null;
  }
}
