import { assetUrl } from "../art/assets.js";
import { ARTICLES, SOURCE_NOTES } from "./newspaper-articles.js";
import {
  makeBoroughChart,
  makeMonthlyChart,
  makeInspectionMap,
} from "./newspaper-visualizations.js";
import "./newspaper.css";
import "./flippable-newspaper.css";

// Presentation only: chart calculations live in newspaper-visualizations.js.
export class Newspaper {
  constructor(ui = null) {
    this.ui = ui;
    this.root = ui?.root || document.querySelector("#overlay");
  }
  open(view = "newspaper", after = null) {
    this.after = after;
    this.opened = true;
    this.page = view === "trend" ? 1 : 0;
    if (this.ui) this.ui.panel("", true);
    else this.root.innerHTML = '<section class="panel"></section>';
    this.sheet = this.root.firstChild;
    this.sheet.className = "panel newspaper-spread flippable-newspaper";
    this.sheet.setAttribute("role", "dialog");
    this.sheet.setAttribute("aria-modal", "true");
    this.sheet.setAttribute("aria-label", "Discarded newspaper");
    this.sheet.innerHTML = `<button class="paper-close" aria-label="Close City Records">Fold away ×</button><header class="newspaper-masthead"><div>NEW YORK CITY · 2025 INSPECTION RECORDS</div><h1>The City Records</h1></header><nav class="paper-navigation" aria-label="Newspaper pages"><button class="paper-previous" aria-label="Previous" title="Turn back"> </button><span class="paper-number" aria-live="polite"></span><button class="paper-next" aria-label="Next" title="Turn page"> </button></nav><div class="paper-pages">${ARTICLES.map((a, i) => `<section class="paper-page" data-page="${i}" hidden>${a}${i === 1 ? '<p id="monthly-status" role="status">Loading monthly data…</p>' : ""}${SOURCE_NOTES}</section>`).join("")}</div>`;
    // Each article is printed across two facing leaves: copy on the left,
    // its live visualization on the right. No article content is discarded.
    for (const page of this.sheet.querySelectorAll(".paper-page")) {
      const article = page.querySelector("article");
      const copy = document.createElement("div");
      copy.className = "paper-copy";
      const visual = document.createElement("div");
      visual.className = "paper-visual";
      for (const child of [...article.children]) {
        (child.tagName === "FIGURE" || child.hasAttribute("role")
          ? visual
          : copy
        ).append(child);
      }
      copy.append(page.querySelector("footer"));
      const monthlyStatus = page.querySelector("#monthly-status");
      if (monthlyStatus) visual.append(monthlyStatus);
      article.append(copy, visual);
    }
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
      if (e.key === "ArrowRight") this.turn(1);
      if (e.key === "ArrowLeft") this.turn(-1);
    };
    this.drawn = new Set();
    this.turn(0);
    this.sheet.querySelector(".paper-close").focus();
  }
  turn(direction) {
    const next = Math.max(0, Math.min(2, this.page + direction));
    if (direction && next === this.page) return;
    this.page = next;
    if (direction) this.sheet.scrollTop = 0;
    const pages = [...this.sheet.querySelectorAll(".paper-page")];
    pages.forEach((el, i) => (el.hidden = i !== this.page));
    this.sheet.querySelector(".paper-number").textContent =
      `Pages ${this.page * 2 + 1}–${this.page * 2 + 2} · ${this.page + 1} / 3`;
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
    if (!this.drawn.has(this.page)) {
      this.drawn.add(this.page);
      [makeBoroughChart, makeMonthlyChart, makeInspectionMap][this.page]();
    }
  }
  close() {
    if (!this.opened) return;
    this.opened = false;
    window.removeEventListener("resize", this.fit);
    if (this.ui) this.ui.clear();
    else
      this.root.innerHTML = `<a class="return-adventure" href="${assetUrl("")}">Return to the adventure</a>`;
    this.after?.();
  }
}
