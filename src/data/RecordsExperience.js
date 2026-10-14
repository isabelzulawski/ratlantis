import * as d3 from "d3";
import { BOROUGHS } from "./records-model.js";
import { assetUrl } from "../art/assets.js";
import "./records.css";
const number = d3.format(",d");
const pct = (n) => (n === null ? "Missing" : `${n.toFixed(1)}%`);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const titles = {
  comparison: "WHERE ARE THEY LOOKING?",
  trend: "A YEAR ABOVEGROUND",
  newspaper: "THE CITY RECORDS",
};
export function describeBucket(b) {
  return `${number(b.active)} inspections recorded active rat signs out of ${number(b.total)} initial inspections (${pct(b.percent)}). ${number(b.unknown)} outcomes missing or unrecognized; these remain in the denominator and are not classified as negative findings.`;
}
export class RecordsExperience {
  constructor(ui = null) {
    this.ui = ui;
    this.borough = "Citywide";
    this.metric = "count";
    this.root = ui?.root || document.querySelector("#overlay");
  }
  async load() {
    this.pending ??= Promise.all([
      fetch(assetUrl("data/inspections-2025.json")).then((r) => {
        if (!r.ok)
          throw new Error("The local inspection snapshot could not be loaded.");
        return r.json();
      }),
      fetch(assetUrl("data/boroughs.geojson")).then((r) => {
        if (!r.ok)
          throw new Error("The borough boundary file could not be loaded.");
        return r.json();
      }),
    ])
      .then(([data, map]) => {
        if (
          data.status !== "available" ||
          !data.citywide ||
          !data.monthly ||
          BOROUGHS.some((b) => !data.boroughs[b])
        )
          throw new Error(
            "The local data snapshot is unavailable or incomplete.",
          );
        this.data = data;
        this.map = map;
      })
      .catch((error) => {
        this.error = error.message;
      });
    await this.pending;
  }
  async open(view = "newspaper", after = null) {
    this.view = view;
    this.after = after;
    this.opened = true;
    if (this.ui) this.ui.panel("", true);
    else this.root.innerHTML = '<section class="panel wide"></section>';
    this.sheet = this.root.firstChild;
    this.sheet.className = "panel data-sheet";
    this.sheet.setAttribute("role", "dialog");
    this.sheet.setAttribute("aria-modal", "true");
    this.sheet.onkeydown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        this.close();
      }
    };
    this.sheet.setAttribute(
      "aria-label",
      "City Records: NYC rodent inspections",
    );
    this.render();
    await this.load();
    if (this.opened) this.render();
  }
  close() {
    this.opened = false;
    if (this.ui) {
      this.ui.clear();
      if (this.after) this.after();
    } else {
      this.root.innerHTML = "";
      const link = document.createElement("a");
      link.className = "return-adventure";
      link.href = location.pathname;
      link.textContent = "Return to the adventure";
      this.root.append(link);
    }
  }
  select(borough) {
    this.borough = borough;
    this.render();
  }
  render() {
    const content = this.error
      ? `<div class="data-unavailable" role="status"><h2>Records unavailable</h2><p>${this.error}</p><p>No findings have been substituted. The adventure can continue without these records.</p></div>`
      : !this.data
        ? '<p role="status">Unfolding the local records…</p>'
        : this.content();
    this.sheet.innerHTML = `<div class="records-top"><span>NYC DOHMH · 2025 inspection records</span><button class="records-close" aria-label="Close City Records">Close ×</button></div><header class="records-header"><p class="edition">CITY RECORDS · A DISCARDED PAPER</p><h1>${titles[this.view]}</h1><p>${this.view === "comparison" ? "Initial rodent inspections by borough · 2025" : this.view === "trend" ? "Monthly percentage recording active rat signs · 2025" : "An inspection is a visit, not a rat census."}</p></header><nav class="records-nav" aria-label="City Records views">${Object.entries(
      titles,
    )
      .map(
        ([v, t]) =>
          `<button data-view="${v}" aria-pressed="${v === this.view}">${v === "newspaper" ? "Newspaper" : v === "comparison" ? "Borough poster" : "Monthly poster"}</button>`,
      )
      .join("")}</nav>${content}`;
    this.sheet.querySelector(".records-close").onclick = () => this.close();
    this.sheet.querySelectorAll("[data-view]").forEach(
      (b) =>
        (b.onclick = () => {
          this.view = b.dataset.view;
          this.render();
        }),
    );
    if (!this.data || this.error) return;
    this.sheet
      .querySelectorAll("[data-borough]")
      .forEach((b) => (b.onclick = () => this.select(b.dataset.borough)));
    this.sheet.querySelectorAll("[data-metric]").forEach(
      (b) =>
        (b.onclick = () => {
          this.metric = b.dataset.metric;
          this.render();
        }),
    );
    if (this.view !== "trend") this.comparison();
    if (this.view !== "comparison") this.trend();
    if (this.view === "newspaper") this.boroughMap();
    this.sheet
      .querySelectorAll("details")
      .forEach((d) => d.addEventListener("toggle", () => {}));
  }
  selector() {
    return `<div class="borough-controls" role="group" aria-label="Selected geography">${["Citywide", ...BOROUGHS].map((b) => `<button data-borough="${b}" aria-pressed="${this.borough === b}">${this.borough === b ? "◆ " : ""}${b}</button>`).join("")}</div>`;
  }
  content() {
    const d = this.data,
      b = this.borough === "Citywide" ? d.citywide : d.boroughs[this.borough];
    const sorted = [...BOROUGHS].sort(
      (a, b) => d.boroughs[b].total - d.boroughs[a].total,
    );
    const factual = `${sorted[0]} had the most included initial inspections (${number(d.boroughs[sorted[0]].total)}). These counts describe inspection activity, not the size of rat populations.`;
    const summary = `<div class="factual-summary"><h2>${this.borough} · recorded inspections</h2><p>${describeBucket(b)}</p>${this.borough === "Citywide" ? `<p>${factual}</p>` : ""}</div>`;
    const comparison = `<section class="comparison-section"><h2>Where are they looking?</h2><p>Does more looking mean more finding?</p><div class="metric-controls" role="group" aria-label="Borough chart measure"><button data-metric="count" aria-pressed="${this.metric === "count"}">Number of initial inspections</button><button data-metric="percent" aria-pressed="${this.metric === "percent"}">Percentage recording active rat signs</button></div><div class="bar-chart chart"></div><p class="chart-detail bar-detail" role="status">Select a bar, or hover or focus it, for exact counts.</p><p class="chart-caption">${this.metric === "count" ? "Bars count initial inspection events. Repeat visits at the same tax lot remain separate events." : "Recorded-active percentage = inspections with an active-sign result ÷ all included initial inspections × 100. Unknown outcomes stay in the denominator; they are not negative findings."} Inspection counts are not rat population counts. Borough order stays fixed in both views.</p></section>`;
    const monthly = d.monthly[this.borough];
    const complete = monthly.filter((m) => m.percent !== null);
    const low = complete.reduce(
      (a, b) => (a.percent < b.percent ? a : b),
      complete[0],
    );
    const high = complete.reduce(
      (a, b) => (a.percent > b.percent ? a : b),
      complete[0],
    );
    const pattern = complete.length
      ? `The recorded-active percentage ranged from ${pct(low.percent)} in ${months[low.month - 1]} to ${pct(high.percent)} in ${months[high.month - 1]}. The pattern describes recorded inspection findings; it does not establish causes or directly measure rat population.`
      : "No monthly percentages are available for this selection.";
    const trend = `<section class="trend-section"><h2>A year aboveground · ${this.borough}</h2><div class="trend-chart chart"></div><p class="chart-detail trend-detail" role="status">Select a month, or hover or focus its mark, for exact counts.</p><p class="chart-caption">${pattern} Gaps indicate missing months, never zero. Unknown outcomes, where present, remain separately reported.</p><details><summary>Read monthly values as a table</summary><div class="table-scroll"><table><caption>2025 · ${this.borough} initial inspections</caption><thead><tr><th>Month</th><th>Active signs</th><th>Initial inspections</th><th>Recorded-active %</th><th>Unknown outcomes</th></tr></thead><tbody>${monthly.map((m) => `<tr><th>${months[m.month - 1]}</th><td>${number(m.active)}</td><td>${number(m.total)}</td><td>${pct(m.percent)}</td><td>${number(m.unknown)}</td></tr>`).join("")}</tbody></table></div></details></section>`;
    const map = `<section class="map-section"><h2>Choose a borough</h2><div class="borough-map"></div><p>◆ Selected borough · tap or click a borough to connect the views. Boundaries: NYC DCP, 2026 release, water excluded.</p><aside class="squirrel-margin"><span>Fictional squirrel annotation</span><p>“Still no squirrel section.”</p></aside></section>`;
    return `${this.selector()}${summary}<div class="records-columns">${this.view === "newspaper" ? map : ""}<div>${this.view !== "trend" ? comparison : ""}${this.view !== "comparison" ? trend : ""}</div></div>${this.methodology()}`;
  }
  detail(selector, text) {
    this.sheet.querySelector(selector).textContent = text;
  }
  interactive(selection, label, action) {
    selection
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", label)
      .on("pointerenter", action)
      .on("focus", action)
      .on("click", action)
      .on("keydown", (event, d) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          action(event, d);
        }
      });
  }
  comparison() {
    const w = 700,
      h = 300,
      left = 124,
      right = 90,
      top = 18,
      bottom = 58;
    const svg = d3
      .select(this.sheet.querySelector(".bar-chart"))
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr(
        "aria-label",
        this.metric === "count"
          ? "Initial inspections by borough"
          : "Percentage recording active rat signs by borough",
      );
    const max =
      this.metric === "count"
        ? d3.max(BOROUGHS, (b) => this.data.boroughs[b].total) || 1
        : 100;
    const x = d3
      .scaleLinear()
      .domain([0, max])
      .nice()
      .range([left, w - right]);
    const y = d3
      .scaleBand()
      .domain(BOROUGHS)
      .range([top, h - bottom])
      .padding(0.34);
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(-(h - bottom - top))
          .tickFormat(""),
      )
      .call((g) => g.select(".domain").remove());
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat(
            this.metric === "count" ? d3.format(",d") : (n) => `${n}%`,
          ),
      );
    svg
      .append("line")
      .attr("x1", left)
      .attr("x2", left)
      .attr("y1", top)
      .attr("y2", h - bottom)
      .attr("stroke", "#142d3c");
    const rows = svg
      .selectAll(".bar-row")
      .data(BOROUGHS)
      .join("g")
      .attr("class", "bar-row");
    const value = (b) =>
      this.metric === "count"
        ? this.data.boroughs[b].total
        : this.data.boroughs[b].percent;
    rows
      .append("text")
      .attr("x", left - 9)
      .attr("y", (b) => y(b) + y.bandwidth() / 2 + 5)
      .attr("text-anchor", "end")
      .attr("font-weight", (b) => (b === this.borough ? 700 : 400))
      .text((b) => `${b === this.borough ? "◆ " : ""}${b}`);
    rows
      .append("rect")
      .attr("x", left)
      .attr("y", (b) => y(b))
      .attr("height", y.bandwidth())
      .attr("width", (b) => Math.max(0, x(value(b) || 0) - left))
      .attr("fill", (b) => (b === this.borough ? "#a16e27" : "#294553"))
      .attr("stroke", (b) => (b === this.borough ? "#142d3c" : "none"))
      .attr("stroke-width", 3);
    rows
      .append("text")
      .attr("x", (b) => x(value(b) || 0) + 8)
      .attr("y", (b) => y(b) + y.bandwidth() / 2 + 5)
      .text((b) =>
        this.metric === "count" ? number(value(b)) : pct(value(b)),
      );
    // Full row targets also make zero/missing bars inspectable.
    const targets = rows
      .append("rect")
      .attr("x", 0)
      .attr("y", (b) => y(b) - 6)
      .attr("width", w)
      .attr("height", y.bandwidth() + 12)
      .attr("fill", "transparent");
    this.interactive(
      targets,
      (b) => `${b}: ${describeBucket(this.data.boroughs[b])}`,
      (_e, b) =>
        this.detail(
          ".bar-detail",
          `${b}: ${describeBucket(this.data.boroughs[b])}`,
        ),
    );
    targets.on("click", (_e, b) => {
      this.borough = b;
      this.render();
      this.detail(
        ".bar-detail",
        `${b}: ${describeBucket(this.data.boroughs[b])}`,
      );
    });
    svg
      .append("text")
      .attr("x", (left + w - right) / 2)
      .attr("y", h - 7)
      .attr("text-anchor", "middle")
      .text(
        this.metric === "count"
          ? "Number of initial inspection events"
          : "Recorded-active percentage of initial inspections (%)",
      );
  }
  trend() {
    const data = this.data.monthly[this.borough],
      w = 700,
      h = 295,
      left = 57,
      right = 18,
      top = 18,
      bottom = 62;
    const svg = d3
      .select(this.sheet.querySelector(".trend-chart"))
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr(
        "aria-label",
        `2025 monthly recorded-active percentage, ${this.borough}`,
      );
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.month))
      .range([left, w - right]);
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([h - bottom, top]);
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-(w - left - right))
          .tickFormat(""),
      )
      .call((g) => g.select(".domain").remove());
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((n) => `${n}%`),
      );
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${h - bottom})`)
      .call(d3.axisBottom(x).tickFormat((n) => months[n - 1].slice(0, 3)));
    svg
      .append("path")
      .datum(data)
      .attr("class", "trend-line")
      .attr("fill", "none")
      .attr("stroke", "#294553")
      .attr("stroke-width", 3)
      .attr(
        "d",
        d3
          .line()
          .defined((d) => d.percent !== null)
          .x((d) => x(d.month))
          .y((d) => y(d.percent)),
      );
    const points = svg
      .selectAll(".month-mark")
      .data(data.filter((d) => d.percent !== null))
      .join("circle")
      .attr("class", "month-mark")
      .attr("cx", (d) => x(d.month))
      .attr("cy", (d) => y(d.percent))
      .attr("r", 5)
      .attr("fill", "#bc8b3e")
      .attr("stroke", "#142d3c")
      .attr("stroke-width", 2);
    const missing = svg
      .selectAll(".missing-month")
      .data(data.filter((d) => d.percent === null))
      .join("text")
      .attr("class", "missing-month")
      .attr("x", (d) => x(d.month))
      .attr("y", h - 30)
      .attr("text-anchor", "middle")
      .text("—");
    const show = (_e, d) =>
      this.detail(
        ".trend-detail",
        `${months[d.month - 1]} 2025 · ${this.borough}: ${describeBucket(d)}`,
      );
    // Wide touch targets around each month, without replacing visible data marks.
    const targets = svg
      .selectAll(".month-target")
      .data(data)
      .join("rect")
      .attr("class", "month-target")
      .attr("x", (d) => x(d.month) - 18)
      .attr("y", top)
      .attr("width", 36)
      .attr("height", h - top - bottom)
      .attr("fill", "transparent");
    this.interactive(
      targets,
      (d) => `${months[d.month - 1]}: ${describeBucket(d)}`,
      show,
    );
    points
      .append("title")
      .text((d) => `${months[d.month - 1]}: ${describeBucket(d)}`);
    missing
      .append("title")
      .text((d) => `${months[d.month - 1]}: Missing; no included inspections`);
    svg
      .append("text")
      .attr("x", (w + left) / 2)
      .attr("y", h - 7)
      .attr("text-anchor", "middle")
      .text("Month in 2025 · recorded-active percentage (%)");
  }
  boroughMap() {
    const map = structuredClone(this.map);
    // D3 spherical polygons expect clockwise exterior rings.
    for (const f of map.features)
      if (d3.geoArea(f) > 2 * Math.PI)
        f.geometry.coordinates = f.geometry.coordinates.map((p) =>
          p.map((r) => r.reverse()),
        );
    const projection = d3.geoMercator().fitExtent(
        [
          [20, 20],
          [340, 370],
        ],
        map,
      ),
      path = d3.geoPath(projection);
    const svg = d3
      .select(this.sheet.querySelector(".borough-map"))
      .append("svg")
      .attr("viewBox", "0 0 360 390")
      .attr("aria-label", "NYC borough boundaries; select a borough");
    const shapes = svg
      .selectAll("path")
      .data(map.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (f) =>
        f.properties.name === this.borough ? "#b8893f" : "#c5c9bf",
      )
      .attr("stroke", "#243a45")
      .attr("stroke-width", 1.1)
      .attr("aria-pressed", (f) => f.properties.name === this.borough);
    shapes
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", (f) => `Select ${f.properties.name}`)
      .on("click", (_e, f) => this.select(f.properties.name))
      .on("keydown", (e, f) => {
        if (["Enter", " "].includes(e.key)) {
          e.preventDefault();
          this.select(f.properties.name);
        }
      });
    shapes.append("title").text((f) => f.properties.name);
    svg
      .selectAll("text")
      .data(map.features)
      .join("text")
      .attr("x", (f) => path.centroid(f)[0])
      .attr("y", (f) => path.centroid(f)[1])
      .attr("text-anchor", "middle")
      .attr("class", "map-name")
      .text(
        (f) =>
          `${f.properties.name === this.borough ? "◆ " : ""}${f.properties.name}`,
      );
  }
  methodology() {
    const d = this.data,
      a = d.audit;
    return `<footer class="records-method"><details><summary>Source, cleaning, denominator & limitations</summary><p><a href="${d.source}" target="_blank" rel="noopener">NYC Open Data · Rodent Inspection (DOHMH)</a> · <a href="${d.dictionary}" target="_blank" rel="noopener">Data dictionary</a> · <a href="${d.geometrySource}" target="_blank" rel="noopener">NYC DCP borough geometry</a></p><p>Retrieved ${d.retrievedAt.slice(0, 10)} (UTC). Calendar year 2025, inspection_date ≥ January 1 and &lt; January 1, 2026; exact inspection_type = “Initial.” Borough text is trimmed and case-normalized to five official borough names.</p><p>Active-sign outcomes: ${d.activeResults.map((r) => `“${r}”`).join(", ")}. Exact categories are matched, including the combined rat-activity-and-other-reason result; observations are not used to infer outcomes. Recorded-active percentage = active-sign results ÷ all included initial inspection events × 100.</p><p>${number(a.sourceRows2025)} source rows in 2025; ${number(a.exactDuplicateRows)} exact duplicates removed across all published noncomputed fields; ${number(a.nonInitialRows)} non-initial rows excluded. ${number(a.missingOrInvalidDates)} invalid-date initial records and ${number(a.missingOrUnknownBorough)} initial records without a recognized borough excluded. Records without dates cannot be assigned to 2025; their all-years audit is in the local audit file.</p><p>${number(a.missingResults)} missing and ${number(a.unknownResults)} unrecognized outcomes remain included in the denominator and separately reported as unknown—not negative findings. A percentage of null means no included inspections, never a fabricated zero. Citywide aggregates the five recognized boroughs.</p><p>Repeated visits are inspection events, not automatically duplicates. ${number(a.uniqueKnownTaxlots)} distinct known BBL tax lots; ${number(a.taxlotsWithRepeatedVisits)} had repeated included visits. ${number(a.missingTaxlot)} included events lack a valid BBL. These property counts are an audit, not the chart unit.</p><ul><li>Inspected properties are not a random sample of NYC: inspections respond to complaints or proactive indexing.</li><li>More recorded findings can reflect more inspections.</li><li>An uninspected location is not evidence of no rats.</li><li>Active rat signs are evidence at a visit, not a count of individual rats or an ongoing condition.</li></ul></details><p>Historical inspection snapshot · optional reading · no skills or travel unlocked</p></footer>`;
  }
}
