import { assetUrl } from "../art/assets.js";
import { ARTICLES, SOURCE_NOTES } from "./newspaper-articles.js";
import { LivingNewspaper } from "./living-newspaper.js";
import "./newspaper.css";
import "./flippable-newspaper.css";
import "./living-newspaper.css";
import "./newspaper-figma.css";
import "./newspaper-polish.css";

// Game wrapper: presentation and calculations live in living-newspaper.js.
export class Newspaper {
  constructor(ui = null) {
    this.ui = ui;
    this.root = ui?.root || document.querySelector("#overlay");
  }
  open(view = "newspaper", after = null) {
    this.after = after;
    this.opened = true;
    this.page = 0;
    if (this.ui) this.ui.panel("", true);
    else this.root.innerHTML = '<section class="panel"></section>';
    this.sheet = this.root.firstChild;
    this.sheet.className = "panel newspaper-spread flippable-newspaper";
    this.sheet.setAttribute("role", "dialog");
    this.sheet.setAttribute("aria-modal", "true");
    this.sheet.setAttribute("aria-label", "Discarded newspaper");
    this.sheet.innerHTML = `<button class="paper-close" aria-label="Close City Records">Fold away ×</button><header class="newspaper-masthead"><div class="masthead-edition"><span>A RAT’S-EYE VIEW</span><span>2025 NYC INSPECTIONS</span></div><h1>The City Records</h1><p class="masthead-echo" aria-hidden="true">The City Records</p></header><nav class="paper-navigation" aria-label="Newspaper pages"><button class="paper-previous" aria-label="Previous"> </button><span class="paper-number" aria-live="polite"></span><button class="paper-next" aria-label="Next"> </button></nav><div class="paper-pages"></div>`;
    this.sheet.insertAdjacentHTML("afterbegin", '<div class="newspaper-paper-base" aria-hidden="true"></div>');
    this.sheet.insertAdjacentHTML("beforeend", '<div class="flat-corner-cover corner-right" aria-hidden="true"></div><div class="flat-corner-cover corner-left" aria-hidden="true"></div>');
    this.experience = new LivingNewspaper(this.sheet, ARTICLES, SOURCE_NOTES);
    this.fit = () =>
      this.sheet.style.setProperty(
        "--paper-scale",
        Math.min((innerWidth - 20) / 1440, (innerHeight - 20) / 920, 1),
      );
    this.fit();
    window.addEventListener("resize", this.fit);
    this.sheet.querySelector(".paper-close").onclick = () => this.close();
    this.sheet.querySelector(".paper-previous").onclick = () => this.turn(-1);
    this.sheet.querySelector(".paper-next").onclick = () => this.turn(1);
    this.sheet.onkeydown = (e) => {
      if (e.key === "Escape") this.close();
      if (e.target.matches("input, select")) return;
      if (e.key === "ArrowRight") this.turn(1);
      if (e.key === "ArrowLeft") this.turn(-1);
    };
    this.turn(0);
    this.sheet.querySelector(".paper-close").focus();
  }
  // Freeze the rendered page into a noninteractive DOM copy. Inlining styles
  // lets us remove duplicate IDs while preserving live SVG charts and type.
  pageSnapshot(page) {
    const snapshot = document.createElement("div");
    snapshot.className = "turn-snapshot";
    for (const source of [this.sheet.querySelector(".newspaper-masthead"), page]) {
      const copy = source.cloneNode(true);
      const originals = [source, ...source.querySelectorAll("*")];
      const copies = [copy, ...copy.querySelectorAll("*")];
      originals.forEach((node, i) => {
        const target = copies[i], computed = getComputedStyle(node);
        for (const property of computed) target.style.setProperty(property, computed.getPropertyValue(property));
        target.removeAttribute("id");
        target.removeAttribute("tabindex");
        target.style.animation = "none";
        target.style.transition = "none";
        if (node instanceof HTMLCanvasElement) target.getContext("2d")?.drawImage(node, 0, 0);
      });
      copy.hidden = false;
      copy.style.position = "absolute";
      if (source === page) { copy.style.inset = "0"; copy.style.margin = "0"; }
      snapshot.append(copy);
    }
    return snapshot;
  }
  turn(direction) {
    if (direction && this.turning) return;
    const next = Math.max(0, Math.min(2, this.page + direction));
    if (direction && next === this.page) return;
    const pages = [...this.sheet.querySelectorAll(".paper-pages > .paper-page")];
    const animate = direction && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const oldSnapshot = animate ? this.pageSnapshot(pages[this.page]) : null;
    this.page = next;
    this.sheet.dataset.paperPage = String(this.page);
    if (direction) this.sheet.scrollTop = 0;
    pages.forEach((el, i) => (el.hidden = i !== this.page));
    this.sheet.querySelector(".paper-number").textContent = String(this.page + 1);
    const updateControls = () => {
      this.sheet.querySelector(".paper-previous").disabled = this.turning || this.page === 0;
      this.sheet.querySelector(".paper-next").disabled = this.turning || this.page === 2;
    };
    this.turning = Boolean(animate);
    updateControls();
    const ready = this.experience.show(this.page);
    if (!animate) return;
    const sheet = this.sheet;
    Promise.resolve(ready).then(() => {
      if (!this.opened || this.sheet !== sheet) return;
      const nextSnapshot = this.pageSnapshot(pages[this.page]);
      const stage = document.createElement("div");
      stage.className = `paper-turn-stage ${direction > 0 ? "turn-forward" : "turn-backward"}`;
      stage.setAttribute("aria-hidden", "true");
      stage.inert = true;
      const under = document.createElement("div");
      under.className = "turn-old-under";
      under.append(oldSnapshot.cloneNode(true));
      // cloneNode does not copy canvas pixels.
      under.querySelectorAll("canvas").forEach((canvas, i) => canvas.getContext("2d")?.drawImage(oldSnapshot.querySelectorAll("canvas")[i], 0, 0));
      const leaf = document.createElement("div");
      leaf.className = "turning-leaf";
      const front = document.createElement("div"), back = document.createElement("div");
      front.className = "turn-face turn-front";
      back.className = "turn-face turn-back";
      front.append(oldSnapshot); back.append(nextSnapshot);
      leaf.append(front, back); stage.append(under, leaf); sheet.append(stage);
      const sign = direction > 0 ? -1 : 1;
      this.flipAnimation = leaf.animate([
        {transform:"rotateY(0deg)", boxShadow:"0 0 0 #30211100"},
        {transform:`rotateY(${sign * 80}deg)`, boxShadow:"20px 6px 22px #30211166", offset:.48},
        {transform:`rotateY(${sign * 180}deg)`, boxShadow:"0 0 0 #30211100"}
      ], {duration:1150, easing:"cubic-bezier(.25,.6,.3,1)", fill:"forwards"});
      const animation = this.flipAnimation;
      animation.finished.catch(() => {}).then(() => {
        stage.remove();
        if (this.flipAnimation !== animation) return;
        this.flipAnimation = null;
        this.turning = false;
        if (this.opened && this.sheet === sheet) updateControls();
      });
    }).catch(() => {
      this.turning = false;
      if (this.opened && this.sheet === sheet) updateControls();
    });
  }

  close() {
    if (!this.opened) return;
    this.opened = false;
    this.flipAnimation?.cancel();
    this.turning = false;
    this.sheet.querySelector(".paper-turn-stage")?.remove();
    this.experience?.destroy();
    window.removeEventListener("resize", this.fit);
    if (this.ui) this.ui.clear();
    else
      this.root.innerHTML = `<a class="return-adventure" href="${assetUrl("")}">Return to the adventure</a>`;
    this.after?.();
  }
}
