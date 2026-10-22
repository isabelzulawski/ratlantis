import { assetUrl } from "../art/assets.js";
import { ARTICLES, SOURCE_NOTES } from "./newspaper-articles.js";
import { LivingNewspaper } from "./living-newspaper.js";
import "./newspaper.css";
import "./flippable-newspaper.css";
import "./living-newspaper.css";
import "./newspaper-figma.css";

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
    this.sheet.innerHTML = `<button class="paper-close" aria-label="Close City Records">Fold away ×</button><header class="newspaper-masthead"><div class="masthead-edition"><span>A RAT’S-EYE VIEW</span><span>2025 NYC INSPECTIONS</span></div><h1>The City Records</h1><p class="masthead-echo" aria-hidden="true">The City Records</p></header><nav class="paper-navigation" aria-label="Newspaper pages"><button class="paper-previous" aria-label="Previous" title="Turn back"> </button><span class="paper-number" aria-live="polite"></span><button class="paper-next" aria-label="Next" title="Turn page"> </button></nav><div class="paper-pages"></div>`;
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
  turn(direction) {
    const next = Math.max(0, Math.min(2, this.page + direction));
    if (direction && next === this.page) return;
    this.page = next;
    this.sheet.dataset.paperPage = String(this.page);
    if (direction) this.sheet.scrollTop = 0;
    const pages = [...this.sheet.querySelectorAll(".paper-page")];
    pages.forEach((el, i) => (el.hidden = i !== this.page));
    this.sheet.querySelector(".paper-number").textContent =
      String(this.page + 1);
    this.sheet.querySelector(".paper-previous").disabled = this.page === 0;
    this.sheet.querySelector(".paper-next").disabled = this.page === 2;
    const page = pages[this.page];
    if (direction && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      page.animate(
        [
          {
            opacity: 0.4,
            transform: `perspective(1000px) rotateY(${direction * 4}deg)`,
          },
          { opacity: 1, transform: "perspective(1000px) rotateY(0deg)" },
        ],
        { duration: 240, easing: "ease-out" },
      );
    this.experience.show(this.page);
  }

  close() {
    if (!this.opened) return;
    this.opened = false;
    this.experience?.destroy();
    window.removeEventListener("resize", this.fit);
    if (this.ui) this.ui.clear();
    else
      this.root.innerHTML = `<a class="return-adventure" href="${assetUrl("")}">Return to the adventure</a>`;
    this.after?.();
  }
}
