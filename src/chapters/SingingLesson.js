import { SINGING } from "../data/brooklyn.js";
import { lessonRound, completeRound } from "./brooklyn-state.js";
import "./singing.css";
// UI owns timeouts (world time is paused). Epoch cancellation prevents a closed
// lesson/replay from firing old notes or advancing progress twice.
export class SingingLesson {
  constructor(scene, done) {
    this.scene = scene;
    this.ui = scene.ui;
    this.done = done;
    this.epoch = 0;
    this.timers = new Set();
  }
  open() {
    this.closed = false;
    this.index = 0;
    const card = this.ui.panel(
      `<h2>A little voice practice</h2><p class="lesson-round"></p><p class="lesson-status" role="status"></p><div class="note-controls">${SINGING.notes.map((n, i) => `<button data-note="${i}" aria-label="Note ${n.label}"><span>${n.mark}</span>${n.label}</button>`).join("")}</div><div class="lesson-actions"><button data-replay>Listen again</button><button data-sound>Sound: ${this.scene.state.sound ? "on" : "off"}</button><button data-close>Practice later</button></div>`,
    );
    card.classList.add("singing-panel");
    this.card = card;
    card.style.setProperty(
      "--note-art",
      `url("${this.scene.textures.getBase64("art-chapter-items", "note")}")`,
    );
    const portraits = document.createElement("div");
    portraits.className = "lesson-performers";
    portraits.innerHTML = `<img class="busker-portrait" src="${this.scene.textures.getBase64("art-busker", "idle")}" alt="Busker listening"><img class="player-portrait" src="${this.scene.textures.getBase64("rat-atlas", "idle")}" alt="Your rat listening">`;
    card.prepend(portraits);
    portraits
      .querySelectorAll("img")
      .forEach((img) => (img.dataset.idle = img.src));
    card
      .querySelectorAll("[data-note]")
      .forEach((b) => (b.onclick = () => this.choose(+b.dataset.note)));
    card.querySelector("[data-replay]").onclick = () => this.demonstrate();
    card.querySelector("[data-sound]").onclick = () => {
      this.scene.state.sound = !this.scene.state.sound;
      this.scene.audioToggle();
      this.scene.persist();
      card.querySelector("[data-sound]").textContent =
        `Sound: ${this.scene.state.sound ? "on" : "off"}`;
    };
    card.querySelector("[data-close]").onclick = () => {
      this.cancel();
      this.ui.clear();
      this.scene.ui.hud(this.scene.def.title);
    };
    this.demonstrate();
  }
  later(fn, ms) {
    const epoch = this.epoch;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.closed && epoch === this.epoch) fn();
    }, ms);
    this.timers.add(timer);
  }
  stopTimers() {
    this.epoch++;
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.card
      ?.querySelectorAll("[data-note]")
      .forEach((button) => button.classList.remove("lit"));
    this.card?.querySelectorAll(".lesson-performers img").forEach((img) => {
      img.classList.remove("singing");
      img.src = img.dataset.idle;
    });
  }
  setStatus(text) {
    this.card.querySelector(".lesson-status").textContent = text;
  }
  lock(value) {
    this.accepting = !value;
    this.card
      .querySelectorAll("[data-note]")
      .forEach((b) => (b.disabled = value));
  }
  demonstrate() {
    this.stopTimers();
    this.index = 0;
    this.lock(true);
    const round = lessonRound(this.scene.state);
    if (round === 3) {
      this.finish();
      return;
    }
    this.card.querySelector(".lesson-round").textContent =
      `Phrase ${round + 1} of 3 · ${SINGING.melodies[round].length} notes`;
    this.setStatus("Watch and listen.");
    SINGING.melodies[round].forEach((note, i) =>
      this.later(
        () => this.play(note, "busker"),
        i * (SINGING.noteMs + SINGING.gapMs),
      ),
    );
    this.later(
      () => {
        this.lock(false);
        this.setStatus(
          "Your turn. Repeat the notes in order, at your own pace.",
        );
      },
      SINGING.melodies[round].length * (SINGING.noteMs + SINGING.gapMs),
    );
  }
  play(note, who) {
    const buttons = this.card.querySelectorAll("[data-note]");
    buttons.forEach((b) => b.classList.remove("lit"));
    buttons[note].classList.add("lit");
    this.scene.playLessonNote(SINGING.notes[note].hz, SINGING.noteMs / 1000);
    const performer = this.card.querySelector(
      who === "busker" ? ".busker-portrait" : ".player-portrait",
    );
    performer.src = this.scene.textures.getBase64(
      who === "busker" ? "art-busker" : "rat-atlas",
      who === "busker" ? "singing" : "react",
    );
    performer.classList.add("singing");
    this.later(() => {
      performer.src = this.scene.textures.getBase64(
        who === "busker" ? "art-busker" : "rat-atlas",
        "idle",
      );
      performer.classList.remove("singing");
    }, SINGING.noteMs);
    this.scene.singingActor = {
      who,
      until: performance.now() + SINGING.noteMs,
    };
    this.later(() => buttons[note].classList.remove("lit"), SINGING.noteMs);
  }
  choose(note) {
    if (!this.accepting) return;
    const round = lessonRound(this.scene.state),
      phrase = SINGING.melodies[round];
    this.play(note, "player");
    if (note !== phrase[this.index]) {
      this.index = 0;
      this.lock(true);
      this.setStatus("Nearly. No hurry—let’s listen to this phrase again.");
      this.later(() => this.demonstrate(), SINGING.retryMs);
      return;
    }
    this.index++;
    this.setStatus(`Yes. ${this.index} of ${phrase.length} notes.`);
    if (this.index === phrase.length) {
      this.lock(true);
      completeRound(this.scene.state, round);
      this.scene.persist();
      this.setStatus(
        round === 2 ? "A voice worth using." : "Good. Keep that little phrase.",
      );
      this.later(
        () =>
          lessonRound(this.scene.state) === 3
            ? this.finish()
            : this.demonstrate(),
        SINGING.retryMs,
      );
    }
  }
  finish() {
    this.cancel();
    this.ui.clear();
    this.done();
  }
  cancel() {
    this.closed = true;
    this.stopTimers();
    this.scene.singingActor = null;
    this.scene.busker?.setFrame("idle");
  }
}
