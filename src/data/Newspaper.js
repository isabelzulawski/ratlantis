import { assetUrl } from "../art/assets.js";
import { BOROUGHS } from "./records-model.js";
import "./records.css";
import "./newspaper.css";
const number = (n) => n.toLocaleString("en-US");
export class Newspaper {
  constructor(ui = null) {
    this.ui = ui;
    this.root = ui?.root || document.querySelector("#overlay");
  }
  async open(view = "newspaper", after = null) {
    this.after = after;
    this.opened = true;
    if (this.ui) this.ui.panel("", true);
    else this.root.innerHTML = '<section class="panel"></section>';
    this.sheet = this.root.firstChild;
    this.sheet.className = "panel newspaper-spread";
    this.sheet.setAttribute("role", "dialog");
    this.sheet.setAttribute("aria-label", "Discarded newspaper");
    this.sheet.onkeydown = (e) => {
      if (e.key === "Escape") this.close();
    };
    this.render();
    try {
      const response = await fetch(assetUrl("data/inspections-2025.json"));
      if (!response.ok) throw new Error("Unavailable");
      this.data = await response.json();
      if (this.data.status !== "available") throw new Error("Unavailable");
    } catch {
      this.error = true;
    }
    if (this.opened) this.render();
  }
  close() {
    this.opened = false;
    if (this.ui) this.ui.clear();
    else
      this.root.innerHTML = `<a class="return-adventure" href="${location.pathname}">Return to the adventure</a>`;
    this.after?.();
  }
  render() {
    const d = this.data;
    this.sheet.innerHTML = `<button class="paper-close" aria-label="Close City Records">Fold away ×</button><header class="newspaper-masthead"><div>NEW YORK CITY · PUBLIC RECORDS EDITION</div><h1>The City Records</h1><div class="paper-date">2025 INSPECTION REVIEW · DOHMH RECORDS</div></header>${this.error ? "<article><h2>Records unavailable</h2><p>The local inspection record could not be loaded. No figures have been substituted.</p></article>" : !d ? '<p role="status">Unfolding the newspaper…</p>' : `<div class="newspaper-columns"><article class="lead-story"><p class="paper-kicker">ABOVEGROUND</p><h2>${number(d.citywide.total)} visits.<br>One city.</h2><p class="paper-deck">The year’s initial rodent inspections tell a story about where the city looked.</p><img class="paper-rat" src="${assetUrl("art/newspaper-item-v2.png")}" alt="Illustrated folded City Records newspaper"><p class="drop-cap">City inspectors recorded ${number(d.citywide.total)} initial inspection events during 2025. ${number(d.citywide.active)} recorded active rat signs—${d.citywide.percent.toFixed(1)}% of the included inspections.</p><p>Brooklyn had the most initial inspections, at ${number(d.boroughs.Brooklyn.total)}. These are visits, not individual rats. Returning to the same property can produce another inspection event.</p><h3>Where the city looked</h3><table><thead><tr><th>Borough</th><th>Visits</th><th>Active signs</th></tr></thead><tbody>${BOROUGHS.map((b) => `<tr><th>${b}</th><td>${number(d.boroughs[b].total)}</td><td>${number(d.boroughs[b].active)}</td></tr>`).join("")}</tbody></table></article><article><p class="paper-kicker">A YEAR ABOVEGROUND</p><h2>A record of visits,<br>not a rat census</h2><p>Initial inspections follow complaints or proactive neighborhood indexing. Inspected properties are not a random sample of New York City.</p><p>More recorded findings can reflect more looking. An uninspected location is not evidence of no rats. Monthly differences alone do not establish their causes.</p><h3>What the inspectors recorded</h3><p>The active-sign total combines “Failed for Rat Activity” and “Failed for Rat Activity and Other Reason.” Each event is counted once. The denominator includes all included initial inspection events.</p><p>This snapshot has ${number(d.citywide.unknown)} missing or unrecognized outcomes. Unknown outcomes are reported separately and are never treated as negative findings.</p><aside class="handwritten"><small>A SQUIRREL’S MARGIN NOTE</small><p>“Still no squirrel section.”</p></aside><h3>From the records desk</h3><p class="paper-source">Source: NYC Open Data, Rodent Inspection, Department of Health and Mental Hygiene. January–December 2025; exact inspection type “Initial.” ${d.audit.exactDuplicateRows} identical published rows removed across all source fields; repeat property visits retained. Retrieved ${d.retrievedAt.slice(0, 10)} UTC.</p></article></div>`}`;
    this.sheet.querySelector(".paper-close").onclick = () => this.close();
  }
}
