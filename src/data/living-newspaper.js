// Isabel's interactive editorial layer. D3 marks remain live and data-driven.
// Edit headlines / interaction prompts in SPREADS; chart calculations below.
// Original full articles and source notes are retained in the reader drawer.
import * as d3 from "d3";
import { loadInspections } from "./newspaper-visualizations.js";
import { assetUrl } from "../art/assets.js";

import { ORDER, summarizeNewspaper } from "./living-newspaper-model.js";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const number = d3.format(",");
const percent = (n) => (n == null ? "No data" : d3.format(".1%")(n));
const duration = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;
const SPREADS = [
  ["THE BOROUGH EDITION", "QUEENS TAKES<br>THE CROWN!", "", ""],
  ["THE DECEMBER EXTRA", "DECEMBER<br>SHOCKER!", "", ""],
  [
    "THE CITY UNDER SCRUTINY",
    "RATS<br>EVERYWHERE?",
    "A dramatic map needs a second look.",
    "Move the magnifying glass to inspect an area.",
  ],
];
export class LivingNewspaper {
  constructor(sheet, articles, sources) {
    this.sheet = sheet;
    this.articles = articles;
    this.sources = sources;
    this.selected = "Queens";
    this.mode = "rate";
    this.month = 12;
    this.alive = true;
    this.drawn = new Set();
    sheet.classList.add("living-newspaper");
    sheet.querySelector(".paper-pages").innerHTML = SPREADS.map(
      (
        [edition, headline, deck, prompt],
        i,
      ) => `<section class="paper-page living-page" data-page="${i}" hidden>
      <div class="news-lead"><small class="edition">${edition}</small><h2 class="splash">${headline}</h2><p class="news-deck">${deck}</p><div class="news-action" data-action="${i}"></div><p class="news-invitation">${prompt}</p><div class="ink-detail" data-detail="${i}" role="status" aria-live="polite">Loading the city records…</div><p class="news-correction" data-correction="${i}"></p><button class="read-story" data-read="${i}">Read the full story & sources ↗</button></div>
      <div class="news-graphic"><div class="graphic-top" data-top="${i}"></div>${i === 2 ? '<div class="map-stage"><canvas id="inspection-map" width="740" height="550" tabindex="0" aria-label="Interactive NYC inspection map. Use the layer controls to reveal inspection coverage."></canvas></div>' : `<svg id="${i === 0 ? "borough-chart" : "monthly-chart"}" role="img" aria-label="${i === 0 ? "Borough inspection comparison" : "Monthly inspection finding percentages"}"></svg>`}<p class="graphic-caption" data-caption="${i}"></p></div></section>`,
    ).join("");
    this.pages = [...sheet.querySelectorAll(".living-page")];
    this.pages.forEach((p, i) => {
      const read = p.querySelector("[data-read]");
      read.textContent = "Read the full story & sources";
      if (i > 0) p.querySelector(".news-graphic").append(read);
      read.onclick = () => this.read(i);
    });
    this.sheet.querySelector('[data-action="0"]').innerHTML =
      '<div class="ink-tabs"><button data-mode="active">MOST FINDINGS?</button><button data-mode="rate" aria-pressed="true">HIGHEST PERCENTAGE?</button></div><div class="editorial-rat" aria-hidden="true"></div>';
    this.sheet.querySelectorAll("[data-mode]").forEach(
      (b) =>
        (b.onclick = () => {
          this.mode = b.dataset.mode;
          if (this.model) {
            const winner = d3.greatest(this.model.boroughs, (d) =>
              this.mode === "rate" ? d.rate : d.active,
            );
            this.select(winner.borough);
          }
        }),
    );
    this.contextPull = 0;
    this.sheet.querySelector('[data-action="1"]').innerHTML =
      `<div class="shock-number">Loading…</div><div class="paper-pocket"><button class="context-tab loose-paper" aria-expanded="false" aria-controls="context-clipping" aria-label="Move loose paper aside to read the comparison" title="Drag the loose paper aside" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home Enter"><img src="${assetUrl("art/newspaper-loose-scrap-v1.png")}" alt="" draggable="false"></button></div>`;
    this.setupLoosePaper();
    this.mapView = "findings";
    this.sheet.querySelector('[data-action="2"]').innerHTML =
      '<div class="map-edition-controls" role="group" aria-label="Map layers"><button data-map-view="inspections" aria-pressed="false">Where they looked</button><button data-map-view="findings" aria-pressed="true">What they found</button><button data-map-view="both" aria-pressed="false">Both layers</button></div>';
    this.sheet.querySelectorAll("[data-map-view]").forEach((button) => {
      button.onclick = () => {
        this.mapView = button.dataset.mapView;
        this.drawMap?.();
      };
    });
    this.setCorrection(
      0,
      "Most findings and highest finding percentage are quite different headlines. Neither is a count of rats, but rather reflect which properties were inspected and how often those inspections recorded rat activity.",
    );
    this.setCorrection(
      1,
      "A percentage needs its inspection count. These records alone cannot explain a rise.",
    );
    this.setCorrection(2, "");
    this.loading = loadInspections((row) => row).then((rows) => {
      const model = summarizeNewspaper(rows);
      if (this.alive) this.model = model;
      return model;
    });
    // Attach a rejection handler immediately, including when closing before load.
    this.loading.catch(() => {});
  }
  setCorrection(i, text) {
    this.pages[i].querySelector("[data-correction]").textContent = text;
  }
  detail(i, text) {
    this.pages[i].querySelector("[data-detail]").textContent = text;
  }
  async show(i) {
    this.page = i;
    try {
      await this.loading;
      if (!this.alive || this.drawn.has(i)) return;
      this.drawn.add(i);
      if (i === 0) this.drawBorough();
      if (i === 1) this.drawMonthly();
      if (i === 2) await this.setupMap();
    } catch (error) {
      if (this.alive) {
        this.detail(i, `Records unavailable: ${error.message}`);
        this.pages[i].querySelector(".news-invitation").textContent =
          "Close and reopen the newspaper to retry. No substitute data is shown.";
      }
    }
  }
  read(i) {
    const drawer = document.createElement("section");
    drawer.className = "news-reader";
    drawer.setAttribute("aria-label", "Full article and methodology");
    drawer.innerHTML =
      '<button class="reader-back">← Back</button><div class="reader-text"></div>';
    const body = drawer.querySelector(".reader-text");
    body.innerHTML = this.articles[i] + this.sources;
    body.querySelectorAll("figure").forEach((n) => {
      // Keep original captions and legend wording as well as article copy.
      n.querySelectorAll("p, figcaption").forEach((caption) => {
        const text = document.createElement("p");
        text.className = "original-caption";
        text.textContent = caption.textContent;
        n.before(text);
      });
      n.remove();
    });
    body.querySelectorAll('[role="status"]').forEach((n) => n.remove());
    this.sheet.append(drawer);
    const back = drawer.querySelector("button");
    back.focus();
    back.onclick = () => {
      drawer.remove();
      this.pages[i].querySelector("[data-read]").focus();
    };
    drawer.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === "Escape") back.click();
    };
  }
  select(borough) {
    this.selected = borough;
    this.monthlyAll = false;
    if (this.drawn.has(0)) this.drawBorough();
    if (this.drawn.has(1)) this.drawMonthly();
  }
  drawBorough() {
    if (!this.model) return;
    const svg = d3
      .select(this.pages[0].querySelector("svg"))
      .attr("viewBox", "0 0 740 530");
    svg.selectAll("*").interrupt();
    svg.selectAll(".chart-axis,.chart-title").remove();
    const data = this.model.boroughs,
      rate = this.mode === "rate";
    const x = d3
      .scaleLinear()
      .domain([0, rate ? 0.3 : d3.max(data, (d) => d.active) * 1.18])
      .nice()
      .range([145, 650]);
    const y = d3.scaleBand().domain(ORDER).range([95, 445]).padding(0.3);
    svg
      .append("g")
      .attr("class", "chart-axis")
      .attr("transform", "translate(0,450)")
      .call(
        d3
          .axisBottom(x)
          .ticks(4)
          .tickFormat(rate ? d3.format(".0%") : d3.format("~s")),
      );
    svg
      .append("g")
      .attr("class", "chart-axis")
      .attr("transform", "translate(145,0)")
      .call(d3.axisLeft(y).tickSize(0))
      .call((g) => g.select(".domain").remove());
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", 390)
      .attr("y", 510)
      .attr("text-anchor", "middle")
      .text(
        rate
          ? "Initial inspections recording rat activity (%)"
          : "Initial inspections recording rat activity (visits)",
      );
    const bars = svg
      .selectAll(".news-bar")
      .data(data, (d) => d.borough)
      .join((enter) =>
        enter.append("rect").attr("class", "news-bar").attr("width", 0),
      )
      .attr("x", 145)
      .attr("y", (d) => y(d.borough))
      .attr("height", y.bandwidth())
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr(
        "aria-label",
        (d) =>
          `${d.borough}: ${number(d.active)} findings / ${number(d.total)} inspections; ${percent(d.rate)}. Select borough.`,
      )
      .attr("fill", (d) =>
        d.borough === this.selected ? "#9c7134" : "#d7d3ca",
      );
    bars
      .on("click", (_, d) => this.select(d.borough))
      .on("keydown", (e, d) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.select(d.borough);
        }
      })
      .on("pointerenter", (_, d) => this.boroughDetail(d))
      .on("pointerleave", () =>
        this.boroughDetail(data.find((d) => d.borough === this.selected)),
      );
    bars
      .transition()
      .duration(duration())
      .attr("width", (d) => x(rate ? d.rate : d.active) - 145);
    bars
      .selectAll("title")
      .data((d) => [d])
      .join("title")
      .text(
        (d) =>
          `${d.borough}: ${number(d.active)} / ${number(d.total)} inspections; ${percent(d.rate)}`,
      );
    svg
      .selectAll(".bar-number")
      .data(data, (d) => d.borough)
      .join("text")
      .attr("class", "bar-number")
      .attr("y", (d) => y(d.borough) + y.bandwidth() / 2 + 6)
      .transition()
      .duration(duration())
      .attr("x", (d) => x(rate ? d.rate : d.active) + 10)
      .text((d) => (rate ? percent(d.rate) : number(d.active)));
    const winner = d3.greatest(data, (d) => (rate ? d.rate : d.active));
    const crown = svg
      .selectAll(".ranking-crown")
      .data([winner])
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "ranking-crown")
          .attr(
            "transform",
            `translate(${x(rate ? winner.rate : winner.active) - 20},${y(winner.borough) - 9})`,
          ),
      );
    crown
      .selectAll("path")
      .data([0])
      .join("path")
      .attr("d", "M-18,0 L-23,-20 L-9,-11 L0,-28 L9,-11 L23,-20 L18,0 Z")
      .attr("fill", "#b68b3e")
      .attr("stroke", "#57442c")
      .attr("stroke-width", 2);
    crown
      .transition()
      .duration(duration())
      .attr(
        "transform",
        `translate(${x(rate ? winner.rate : winner.active) - 20},${y(winner.borough) - 9})`,
      );
    this.pages[0].querySelector("[data-top]").textContent =
      `2025 ${rate ? "INITIAL INSPECTION PERCENTAGES" : "FINDING COUNTS AT INITIAL INSPECTION"}`;
    this.pages[0].querySelector("[data-caption]").textContent =
      "Click a bar to see its data and to carry that borough into the next article";
    this.sheet
      .querySelectorAll("[data-mode]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mode === this.mode)),
      );
    this.boroughDetail(data.find((d) => d.borough === this.selected));
  }
  boroughDetail(d) {
    this.detail(
      0,
      `${d.borough.toUpperCase()}\n${number(d.active)} findings / ${number(d.total)} initial inspections\n${percent(d.rate)} recorded rat activity`,
    );
  }
  drawMonthly() {
    const page = this.pages[1],
      top = page.querySelector("[data-top]");
    if (!top.querySelector("select")) {
      top.innerHTML =
        '<div class="comparison-heading">HOW DOES THE REST OF THE CITY COMPARE?</div><label>SHOW <select aria-label="Monthly borough"></select></label>';
      // Chart details belong to the comparison, not the fixed Queens article.
      const detail = page.querySelector('[data-detail="1"]');
      detail.classList.add("monthly-detail");
      page.querySelector("[data-caption]").after(detail);
      top.querySelector("select").innerHTML =
        '<option value="all">All boroughs</option>' +
        ORDER.map((b) => `<option>${b}</option>`).join("");
      top.querySelector("select").onchange = (e) => {
        if (e.target.value === "all") {
          this.monthlyAll = true;
          this.drawMonthly();
        } else this.select(e.target.value);
      };
    }
    top.querySelector("select").value = this.monthlyAll ? "all" : this.selected;
    const series = (this.monthlyAll ? ORDER : [this.selected]).map(
      (borough) => ({
        borough,
        data: this.model.monthly[borough].map((d) => ({ ...d, borough })),
      }),
    );
    const data = this.model.monthly[this.selected].map((d) => ({
      ...d,
      borough: this.selected,
    }));
    const colors = d3.scaleOrdinal(ORDER, [
      "#927027",
      "#3d6b58",
      "#426681",
      "#944936",
      "#756080",
    ]);
    const patterns = ["", "9 4", "3 3", "12 3 2 3", "7 3 2 3 2 3"];
    // The editorial headline always refers to Queens, regardless of chart filters.
    const queensDecember = this.model.monthly.Queens[11];
    page.querySelector(".shock-number").classList.add("has-definition");
    page.querySelector(".shock-number").innerHTML =
      `<span class="rate-value">${percent(queensDecember.rate)}</span><span class="rate-definition">of initial inspections recorded rat activity</span><small>QUEENS<br>DECEMBER 2025</small>`;
    const svg = d3
      .select(page.querySelector("svg"))
      .attr("viewBox", this.monthlyAll ? "0 0 740 445" : "0 0 740 400");
    svg.selectAll("*").interrupt();
    svg.selectAll("*").remove();
    const x = d3.scaleLinear().domain([1, 12]).range([65, 690]),
      y = d3
        .scaleLinear()
        .domain([
          0,
          Math.max(
            0.4,
            d3.max(
              series.flatMap((s) => s.data),
              (d) => d.rate,
            ) || 0,
          ),
        ])
        .nice()
        .range([280, 50]);
    svg
      .append("g")
      .attr("transform", "translate(0,280)")
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(1, 13))
          .tickFormat((m) => MONTHS[m - 1]),
      );
    svg
      .append("g")
      .attr("transform", "translate(65,0)")
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(".0%")));
    svg
      .append("text")
      .attr("x", 380)
      .attr("y", 335)
      .attr("text-anchor", "middle")
      .text("Month of inspection in 2025");
    svg
      .append("text")
      .attr("x", 65)
      .attr("y", 25)
      .text("Initial inspections recording rat activity (%)");
    const line = d3
      .line()
      .defined((d) => d.rate !== null)
      .x((d) => x(d.month))
      .y((d) => y(d.rate));
    // All-borough view uses one shared scale, labeled colors and distinct dashes.
    for (const item of series) {
      const color = this.monthlyAll ? colors(item.borough) : "#9c7134";
      const path = svg
        .append("path")
        .datum(item.data)
        .attr("class", "monthly-series")
        .attr("data-borough", item.borough)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr(
          "stroke-dasharray",
          this.monthlyAll ? patterns[ORDER.indexOf(item.borough)] : null,
        );
      // Fade in patterned lines without temporarily replacing their dash encoding.
      path
        .attr("opacity", 0)
        .transition()
        .duration(duration())
        .attr("opacity", 1);
      svg
        .append("g")
        .selectAll("circle")
        .data(item.data.filter((d) => d.rate !== null))
        .join("circle")
        .attr("cx", (d) => x(d.month))
        .attr("cy", (d) => y(d.rate))
        .attr("r", (d) =>
          d.month === this.month && d.borough === this.selected ? 8 : 5,
        )
        .attr("fill", color)
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr(
          "aria-label",
          (d) =>
            `${d.borough}: ${MONTHS[d.month - 1]}: ${percent(d.rate)}; ${d.active} findings / ${d.total} inspections`,
        )
        .on("click", (_, d) => this.pickMonth(d))
        .on("pointerenter", (_, d) => this.monthDetail(d))
        .on("pointerleave", () =>
          this.monthDetail({
            ...this.model.monthly[this.selected][this.month - 1],
            borough: this.selected,
          }),
        )
        .on("keydown", (e, d) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.pickMonth(d);
          }
        })
        .append("title")
        .text(
          (d) =>
            `${d.borough}: ${MONTHS[d.month - 1]}: ${number(d.active)} / ${number(d.total)} initial inspections; ${percent(d.rate)}`,
        );
    }
    if (this.monthlyAll) {
      const legend = svg.append("g").attr("class", "monthly-legend");
      ORDER.forEach((borough, i) => {
        const entry = legend
          .append("g")
          .attr(
            "transform",
            `translate(${60 + (i % 3) * 225},${370 + Math.floor(i / 3) * 32})`,
          );
        entry
          .append("line")
          .attr("x2", 30)
          .attr("stroke", colors(borough))
          .attr("stroke-width", 3)
          .attr("stroke-dasharray", patterns[i]);
        entry.append("text").attr("x", 38).attr("y", 5).text(borough);
      });
    }
    page.querySelector("[data-caption]").textContent =
      "Tap a month for its counts. Missing months remain gaps, never zero.";
    this.monthDetail(data[this.month - 1]);
    this.revealContext(this.contextPull);
  }
  pickMonth(d) {
    this.month = d.month;
    if (d.borough) this.selected = d.borough;
    this.monthDetail(d);
    d3.select(this.pages[1])
      .selectAll("circle")
      .attr("r", (p) =>
        p.month === d.month && p.borough === this.selected ? 8 : 5,
      );
    this.revealContext(this.contextPull);
  }
  monthDetail(d) {
    this.detail(
      1,
      `${(d.borough || this.selected).toUpperCase()} IN ${MONTHS[d.month - 1].toUpperCase()} 2025\n${number(d.active)} findings / ${number(d.total)} initial inspections (${percent(d.rate)})`,
    );
  }
  // The loose scrap physically covers printed data. Move it freely in two
  // dimensions; release leaves it there. No slider value or snap animation.
  setupLoosePaper() {
    const pocket = this.pages[1].querySelector(".paper-pocket");
    const paper = pocket.querySelector("button");
    this.paperPosition = { x: 0, y: 0 };
    let drag = null,
      suppressClick = false;
    const place = (x, y) => {
      this.paperPosition = {
        x: Math.max(-600, Math.min(650, x)),
        y: Math.max(-440, Math.min(180, y)),
      };
      const pos = this.paperPosition;
      paper.style.setProperty("--paper-x", pos.x + "px");
      paper.style.setProperty("--paper-y", pos.y + "px");
      paper.style.setProperty(
        "--paper-angle",
        Math.max(-9, Math.min(9, pos.x / 45)) + "deg",
      );
      this.revealContext(Math.min(100, (Math.hypot(pos.x, pos.y) / 140) * 100));
    };
    paper.onpointerdown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        start: { ...this.paperPosition },
        moved: false,
      };
      paper.setPointerCapture(e.pointerId);
      pocket.classList.add("pulling");
    };
    paper.onpointermove = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const scale = pocket.getBoundingClientRect().width / pocket.offsetWidth;
      const dx = (e.clientX - drag.x) / scale,
        dy = (e.clientY - drag.y) / scale;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      place(drag.start.x + dx, drag.start.y + dy);
    };
    paper.onpointerup = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      suppressClick = drag.moved;
      drag = null;
      paper.releasePointerCapture(e.pointerId);
      pocket.classList.remove("pulling");
    };
    const cancel = () => {
      drag = null;
      pocket.classList.remove("pulling");
    };
    paper.onpointercancel = cancel;
    paper.onlostpointercapture = cancel;
    paper.onclick = () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const covered =
        Math.hypot(this.paperPosition.x, this.paperPosition.y) < 100;
      // Click/tap and keyboard users can park it at the newspaper's outer edge.
      place(covered ? -560 : 0, covered ? 150 : 0);
    };
    paper.onkeydown = (e) => {
      const directions = {
        ArrowLeft: [-35, 0],
        ArrowRight: [35, 0],
        ArrowUp: [0, -35],
        ArrowDown: [0, 35],
      };
      if (directions[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        const [dx, dy] = directions[e.key];
        place(this.paperPosition.x + dx, this.paperPosition.y + dy);
      }
      if (e.key === "Home") {
        e.preventDefault();
        e.stopPropagation();
        place(0, 0);
      }
    };
  }
  revealContext(value) {
    this.contextPull = value;
    const p = this.pages[1];
    const paper = p.querySelector(".loose-paper");
    paper.setAttribute("aria-expanded", String(value >= 45));
    paper.setAttribute(
      "aria-label",
      value >= 45
        ? "Move loose paper back over the comparison"
        : "Move loose paper aside to read the comparison",
    );
    if (!this.model) return;
    let clipping = p.querySelector(".context-reveal");
    if (!clipping) {
      clipping = document.createElement("div");
      clipping.className = "context-reveal";
      clipping.id = "context-clipping";
      p.querySelector(".paper-pocket").append(clipping);
    }
    const data = this.model.monthly.Queens,
      aug = data[7],
      dec = data[11];
    clipping.innerHTML = `<b>QUEENS IN 2025</b><div><span>AUGUST<strong>${percent(aug.rate)}</strong>${number(aug.active)} findings<br>${number(aug.total)} inspections</span><span>DECEMBER<strong>${percent(dec.rate)}</strong>${number(dec.active)} findings<br>${number(dec.total)} inspections</span></div><em>${dec.rate !== null && aug.rate !== null && dec.rate > aug.rate && dec.active < aug.active ? "A higher percentage. Fewer recorded findings." : "Different months. Read the percentage alongside the visit count."}</em>`;
    clipping.style.setProperty("--unfold", value / 100);
    clipping.hidden = false;
    // The illustration covers the data visually; expose it to assistive tools
    // once the reader starts moving the scrap aside.
    clipping.setAttribute("aria-hidden", String(value === 0));
  }
  async setupMap() {
    const geo = await d3.json(assetUrl("data/boroughs.geojson"));
    if (!this.alive) return;
    if (geo.features.length !== 5 || geo.features.some((f) => !f.geometry))
      throw new Error("Borough boundaries unavailable.");
    const p = this.pages[2],
      canvas = p.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      w = 740,
      h = 550,
      ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    const projection = d3.geoMercator().fitExtent(
      [
        [28, 25],
        [w - 28, h - 25],
      ],
      {
        type: "MultiPoint",
        coordinates: [
          [-74.26, 40.49],
          [-73.7, 40.92],
        ],
      },
    );
    const points = this.model.rows
      .filter(
        (r) =>
          Number.isFinite(r.lat) &&
          Number.isFinite(r.lon) &&
          r.lat >= 40.45 &&
          r.lat <= 40.95 &&
          r.lon >= -74.3 &&
          r.lon <= -73.65,
      )
      .map((r) => ({ ...r, point: projection([r.lon, r.lat]) }));
    const findings = points.filter((r) => r.active);
    const initialLens = projection([-73.96, 40.68]);
    this.lens = { x: initialLens[0], y: initialLens[1] };
    const labels = [
      ["Manhattan", [-73.98, 40.78]],
      ["Bronx", [-73.86, 40.86]],
      ["Brooklyn", [-73.96, 40.65]],
      ["Queens", [-73.81, 40.73]],
      ["Staten Island", [-74.15, 40.58]],
    ];
    // Cache the real marks per view. Moving the glass reuses this image instead
    // of redrawing 140,000 visits on every pointer event.
    const layers = new Map();
    const layerImage = (view) => {
      if (layers.has(view)) return layers.get(view);
      const layer = document.createElement("canvas");
      layer.width = w * ratio;
      layer.height = h * ratio;
      const ink = layer.getContext("2d");
      ink.scale(ratio, ratio);
      const outline = d3.geoPath(projection, ink);
      ink.fillStyle = "#e9dfc6";
      ink.strokeStyle = "#7c8070";
      ink.lineWidth = 1;
      geo.features.forEach((f) => {
        ink.beginPath();
        outline(f);
        ink.fill("evenodd");
        ink.stroke();
      });
      const dots = (list, color) => {
        ink.fillStyle = color;
        ink.beginPath();
        for (const {
          point: [x, y],
        } of list) {
          ink.moveTo(x + 1.2, y);
          ink.arc(x, y, 1.2, 0, Math.PI * 2);
        }
        ink.fill();
      };
      if (view === "inspections" || view === "both")
        dots(points, "rgba(45,83,111,.48)");
      if (view === "findings" || view === "both")
        dots(findings, "rgba(198,60,40,.70)");
      layers.set(view, layer);
      return layer;
    };
    this.drawMap = () => {
      const blue = this.mapView !== "findings",
        red = this.mapView !== "inspections";
      p.querySelectorAll("[data-map-view]").forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.mapView === this.mapView),
        ),
      );
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const layer = layerImage(this.mapView);
      const draw = () => ctx.drawImage(layer, 0, 0, w, h);
      draw();
      // The lens magnifies the same fixed coordinates; points never wander.
      const { x, y } = this.lens;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 68, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#eee2c5";
      ctx.fillRect(x - 70, y - 70, 140, 140);
      ctx.translate(x, y);
      ctx.scale(1.9, 1.9);
      ctx.translate(-x, -y);
      draw();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x, y, 68, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#6b5335";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 48, y + 48);
      ctx.lineTo(x + 80, y + 85);
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.font = "bold 16px Labrada, serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f0e6ce";
      ctx.fillStyle = "#253238";
      labels.forEach(([name, coords]) => {
        const [lx, ly] = projection(coords);
        ctx.strokeText(name, lx, ly);
        ctx.fillText(name, lx, ly);
      });
      // The 1.9x glass samples a smaller circle of the same projected map.
      // Count inspection events, including repeated property visits.
      const radius = 68 / 1.9;
      let visits = 0,
        active = 0;
      for (const point of points) {
        const dx = point.point[0] - x,
          dy = point.point[1] - y;
        if (dx * dx + dy * dy <= radius * radius) {
          visits++;
          if (point.active) active++;
        }
      }
      this.lensCounts = { visits, active };
      this.detail(
        2,
        `UNDER THE MAGNIFYING GLASS\n${number(visits)} initial inspection visits\n${number(active)} recorded rat-activity findings\n${visits ? percent(active / visits) + " of these visits recorded rat activity" : "No mapped inspections in this area."}`,
      );
      p.querySelector("[data-caption]").textContent =
        `${blue ? number(points.length) + " inspection visits in blue" : ""}${blue && red ? "; " : ""}${red ? number(findings.length) + " findings in red" : ""}. ${number(this.model.rows.length - points.length)} visits lack usable coordinates.`;
      p.querySelector("[data-top]").textContent =
        this.mapView === "inspections"
          ? "WHERE THE CITY LOOKED"
          : this.mapView === "findings"
            ? "WHERE INSPECTORS RECORDED RAT ACTIVITY"
            : "INSPECTION COVERAGE AND RECORDED FINDINGS";
      canvas.setAttribute(
        "aria-label",
        `${p.querySelector("[data-top]").textContent}. Move the glass with the mouse or arrow keys. ${visits} inspection visits and ${active} findings under the glass.`,
      );
    };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      this.lens = {
        x: Math.max(70, Math.min(w - 70, ((e.clientX - r.left) * w) / r.width)),
        y: Math.max(70, Math.min(h - 90, ((e.clientY - r.top) * h) / r.height)),
      };
      this.queueMap();
    };
    canvas.onpointermove = move;
    canvas.onpointerdown = (e) => {
      e.preventDefault();
      move(e);
    };
    canvas.onkeydown = (e) => {
      const keys = {
        ArrowLeft: [-20, 0],
        ArrowRight: [20, 0],
        ArrowUp: [0, -20],
        ArrowDown: [0, 20],
      };
      if (keys[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        const [dx, dy] = keys[e.key];
        this.lens = {
          x: Math.max(70, Math.min(w - 70, this.lens.x + dx)),
          y: Math.max(70, Math.min(h - 90, this.lens.y + dy)),
        };
        this.queueMap();
      }
    };
    this.drawMap();
  }
  queueMap() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      if (this.alive) this.drawMap();
    });
  }
  destroy() {
    this.alive = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    d3.select(this.sheet).selectAll("*").interrupt();
  }
}
