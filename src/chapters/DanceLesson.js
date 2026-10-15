import { DANCE } from "../data/finale.js";
import { earnDancing } from "./finale-state.js";
import "./finale.css";
const symbols = { left: "←", right: "→", jump: "↑" };
export class DanceLesson {
  constructor(scene, done) {
    this.scene = scene;
    this.done = done;
    this.closed = false;
  }
  open(practice = !this.scene.state.flags.dancePractice) {
    this.cancel();
    this.card = null;
    this.closed = false;
    this.practice = practice;
    this.hits = 0;
    const s = this.scene;
    const card = s.ui.panel(
      `<h2>Find the rhythm of the sea</h2><p class="dance-status" role="status">Press the matching control near the gold line.</p><div class="dance-track"><div class="beat-line"></div></div><div class="dance-controls">${Object.entries(
        symbols,
      )
        .map(
          ([key, symbol]) =>
            `<button data-dance="${key}" aria-label="${key}">${symbol}<small>${key}</small></button>`,
        )
        .join("")}</div><button data-later>Practice later</button>`,
    );
    card.classList.add("singing-panel", "dance-panel");
    this.card = card;
    this.cues = (practice ? DANCE.practice : DANCE.cues).map((type, i) => ({
      type,
      due: DANCE.leadMs + i * DANCE.intervalMs,
      hit: false,
    }));
    const track = card.querySelector(".dance-track");
    this.cues.forEach((c) => {
      c.el = document.createElement("span");
      c.el.className = "dance-cue";
      c.el.textContent = symbols[c.type];
      c.el.setAttribute("aria-label", c.type);
      track.append(c.el);
    });
    card
      .querySelectorAll("[data-dance]")
      .forEach((b) => (b.onclick = () => this.press(b.dataset.dance)));
    card.querySelector("[data-later]").onclick = () => {
      this.cancel();
      s.ui.clear();
    };
    this.start = performance.now();
    this.frame = requestAnimationFrame((now) => this.tick(now));
  }
  tick(now) {
    if (this.closed) return;
    this.elapsed = now - this.start;
    this.cues.forEach((c) => {
      const x = 20 + ((c.due - this.elapsed) / DANCE.leadMs) * 75;
      c.el.style.left = `${x}%`;
      c.el.hidden = c.hit || x < 0 || x > 100;
      c.el.classList.toggle(
        "ready",
        Math.abs(c.due - this.elapsed) <= DANCE.windowMs,
      );
    });
    const active = this.cues.find(
      (c) => !c.hit && Math.abs(c.due - this.elapsed) <= DANCE.windowMs,
    );
    this.card
      .querySelectorAll("[data-dance]")
      .forEach((b) =>
        b.classList.toggle("lit", active?.type === b.dataset.dance),
      );
    if (this.elapsed > this.cues.at(-1).due + DANCE.windowMs + 250) {
      this.finish();
      return;
    }
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }
  press(type) {
    if (this.closed) return;
    const cue = this.cues.find(
      (c) =>
        !c.hit &&
        c.type === type &&
        Math.abs(c.due - (performance.now() - this.start)) <= DANCE.windowMs,
    );
    if (cue) {
      cue.hit = true;
      this.hits++;
      this.card.querySelector(".dance-status").textContent =
        `Yes! ${this.hits} steps caught.`;
      this.scene.performPlayer(type);
      this.scene.playLessonNote(
        type === "left" ? 261.63 : type === "right" ? 329.63 : 392,
        0.18,
      );
    } else
      this.card.querySelector(".dance-status").textContent =
        "No hurry. Catch the next mark by the line.";
  }
  finish() {
    this.cancel();
    const s = this.scene;
    if (this.practice) {
      s.state.flags.dancePractice = true;
      s.persist();
      this.card.querySelector(".dance-status").textContent =
        "Practice complete. Ready for eight steps?";
      this.actions("Start dance", () => this.open(false));
      return;
    }
    if (earnDancing(s.state, this.hits)) {
      s.persist();
      s.ui.clear();
      this.done();
    } else {
      this.card.querySelector(".dance-status").textContent =
        `${this.hits} of 8. Five is enough. Have another go.`;
      this.actions("Try again", () => this.open(false));
    }
  }
  actions(text, action) {
    this.card.querySelector(".dance-track").innerHTML = "";
    this.card.querySelector(".dance-controls").innerHTML =
      `<button data-retry>${text}</button>`;
    this.card.querySelector("[data-retry]").onclick = action;
  }
  cancel() {
    this.closed = true;
    cancelAnimationFrame(this.frame);
  }
}
