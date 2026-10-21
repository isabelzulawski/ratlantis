// Isabel's D3 visualizations, integrated without changing calculations or filters.
// Edit chart scales, marks, labels and hover titles in the three functions below.
// The game wrapper calls a function only after its page is visible.
import * as d3 from "d3";
import { assetUrl } from "../art/assets.js";

// Parse the supplied CSV once; each original chart keeps its own row conversion.
let csvPromise;
export function loadInspections(convertRow) {
  // Transfer gzip bytes, then parse the identical CSV. No filtering/preaggregation.
  csvPromise ??= (async () => {
    if (!("DecompressionStream" in window))
      return d3.csv(assetUrl("data/rats_2025_initial.csv"));
    const response = await fetch(assetUrl("data/rats_2025_initial.csv.gz"));
    if (!response.ok) throw new Error("Inspection CSV could not be loaded.");
    // Some hosts send Content-Encoding:gzip and the browser already decodes it.
    // Detect the gzip signature to avoid decompressing the CSV twice.
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] !== 0x1f || bytes[1] !== 0x8b)
      return d3.csvParse(new TextDecoder().decode(bytes));
    const decoded = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return d3.csvParse(await new Response(decoded).text());
  })().catch((error) => {
    csvPromise = null;
    throw error;
  });
  return csvPromise.then((rows) => rows.map(convertRow));
}

export async function makeBoroughChart() {
  try {
    // STEP 1: Load the CSV.
    // D3 turns each CSV row into a JavaScript object.
    const inspections = await loadInspections((row) => ({
      borough: row.BOROUGH.trim(),

      // Includes both positive result labels in your dataset.
      ratActivity: row.RESULT.toLowerCase().includes("rat activity"),
    }));

    d3.select("#status").text("");

    // STEP 2: Group inspections by borough and calculate percentages.
    const boroughData = d3
      .rollups(
        inspections,

        (rows) => {
          const total = rows.length;
          const positive = rows.filter((row) => row.ratActivity).length;

          return {
            total,
            positive,
            proportion: positive / total,
          };
        },

        (row) => row.borough,
      )
      .map(([borough, counts]) => ({
        borough,
        ...counts,
      }))
      .sort((a, b) => b.proportion - a.proportion);

    // See the calculated values in your browser's console.
    console.table(boroughData);

    // STEP 3: Define the drawing area and margins.
    const width = 850;
    const height = 380;

    const margin = {
      top: 25,
      right: 75,
      bottom: 65,
      left: 120,
    };

    const svg = d3
      .select("#borough-chart")
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Clear old elements if we run this function again.
    svg.selectAll("*").remove();

    // STEP 4: Create scales.
    // x converts proportions into horizontal pixel positions.
    // For example, 0.20 means 20%.
    const x = d3
      .scaleLinear()
      .domain([0, 0.3])
      .range([margin.left, width - margin.right]);

    // y gives each borough its own horizontal band.
    const y = d3
      .scaleBand()
      .domain(boroughData.map((row) => row.borough))
      .range([margin.top, height - margin.bottom])
      .padding(0.25);

    // STEP 5: Draw the percentage axis along the bottom.
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".0%")));

    // Draw borough names along the left.
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call((group) => group.select(".domain").remove());

    // STEP 6: Bind each borough's data to one rectangle.
    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(boroughData)
      .join("rect")
      .attr("x", x(0))
      .attr("y", (row) => y(row.borough))
      .attr("width", (row) => x(row.proportion) - x(0))
      .attr("height", y.bandwidth())
      .attr("fill", "#41637a");

    // Native browser tooltips show the numerator and denominator.
    bars
      .append("title")
      .text(
        (row) =>
          `${row.borough}\n` +
          `${d3.format(",")(row.positive)} findings out of ` +
          `${d3.format(",")(row.total)} initial inspections\n` +
          `${d3.format(".1%")(row.proportion)} found rat activity`,
      );

    // STEP 7: Put a percentage label at the end of each bar.
    svg
      .append("g")
      .selectAll("text")
      .data(boroughData)
      .join("text")
      .attr("x", (row) => x(row.proportion) + 8)
      .attr("y", (row) => y(row.borough) + y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("font-family", "Times New Roman, Times, serif")
      .attr("font-size", 13)
      .text((row) => d3.format(".1%")(row.proportion));

    // Add the x-axis description.
    svg
      .append("text")
      .attr("x", (margin.left + width - margin.right) / 2)
      .attr("y", height - 12)
      .attr("text-anchor", "middle")
      .attr("font-family", "Times New Roman, Times, serif")
      .attr("font-size", 13)
      .text("Initial inspections finding rat activity (%)");

    //d3.select("#status")
    //  .text(
    //    `Based on ${d3.format(",")(inspections.length)} initial inspections.`
    //  );
  } catch (error) {
    console.error(error);

    d3.select("#status").text(
      "Could not load the chart. Check that the CSV is in this folder " +
        "and that you opened the page through localhost.",
    );
  }
}

// Start loading the data and drawing the chart.
export async function makeMonthlyChart() {
  try {
    // Read the month directly from the exported date text.
    // Handles M/D/YYYY dates and YYYY-MM-DD dates.
    function getMonth(text) {
      const date = text.trim();

      const iso = date.match(/^2025-(\d{2})-\d{2}/);
      if (iso) return Number(iso[1]);

      const slash = date.match(/^(\d{1,2})\/\d{1,2}\/2025\b/);
      if (slash) return Number(slash[1]);

      return null;
    }

    const inspections = await loadInspections((row) => ({
      borough: row.BOROUGH.trim(),
      month: getMonth(row["INSPECTION DATE"]),
      ratActivity: row.RESULT.toLowerCase().includes("rat activity"),
    }));

    // Stop if any date wasn't understood, rather than silently losing rows.
    if (inspections.some((row) => !row.month || row.month > 12)) {
      throw new Error("Some inspection dates could not be parsed.");
    }

    d3.select("#monthly-status").text("");

    // Group first by borough, then by month.
    const grouped = d3.rollup(
      inspections,

      (rows) => ({
        total: rows.length,
        positive: rows.filter((row) => row.ratActivity).length,
      }),

      (row) => row.borough,
      (row) => row.month,
    );

    const boroughs = [
      "Queens",
      "Bronx",
      "Brooklyn",
      "Manhattan",
      "Staten Island",
    ];

    // Build 12 monthly points for each borough.
    // A month with no inspections gets null, rather than a misleading 0%.
    const series = boroughs.map((borough) => ({
      borough,

      values: d3.range(1, 13).map((month) => {
        const counts = grouped.get(borough)?.get(month);

        return {
          month,
          total: counts?.total ?? 0,
          positive: counts?.positive ?? 0,
          proportion: counts ? counts.positive / counts.total : null,
        };
      }),
    }));

    const width = 850;
    const height = 460;
    const margin = { top: 75, right: 35, bottom: 65, left: 90 };

    const svg = d3
      .select("#monthly-chart")
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const colors = d3
      .scaleOrdinal()
      .domain(boroughs)
      .range(["#9c4438", "#976800", "#316c59", "#426b9b", "#79568b"]);

    const x = d3
      .scaleLinear()
      .domain([1, 12])
      .range([margin.left, width - margin.right]);

    const maximum = d3.max(
      series.flatMap((item) => item.values),
      (point) => point.proportion,
    );

    const y = d3
      .scaleLinear()
      .domain([0, maximum || 0.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const months = [
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

    // Horizontal grid lines help compare percentages.
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat(""),
      )
      .call((group) => group.select(".domain").remove())
      .call((group) => group.selectAll("line").attr("stroke", "#c9bea5"));

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(1, 13))
          .tickFormat((month) => months[month - 1]),
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));

    // A line generator turns monthly values into an SVG path.
    const line = d3
      .line()
      .defined((point) => point.proportion !== null)
      .x((point) => x(point.month))
      .y((point) => y(point.proportion));

    for (const item of series) {
      svg
        .append("path")
        .datum(item.values)
        .attr("fill", "none")
        .attr("stroke", colors(item.borough))
        .attr("stroke-width", 2)
        .attr("d", line);

      // Dots mark the actual monthly measurements.
      const dots = svg
        .append("g")
        .selectAll("circle")
        .data(item.values.filter((point) => point.proportion !== null))
        .join("circle")
        .attr("cx", (point) => x(point.month))
        .attr("cy", (point) => y(point.proportion))
        .attr("r", 4)
        .attr("fill", colors(item.borough));

      dots
        .append("title")
        .text(
          (point) =>
            `${item.borough}: ${months[point.month - 1]} 2025\n` +
            `${d3.format(".1%")(point.proportion)} found rat activity\n` +
            `${d3.format(",")(point.positive)} findings / ` +
            `${d3.format(",")(point.total)} initial inspections`,
        );
    }

    // Color legend, arranged across two rows.
    const legend = svg
      .append("g")
      .attr("font-family", "Times New Roman, Times, serif")
      .attr("font-size", 12);

    boroughs.forEach((borough, index) => {
      const left = margin.left + (index % 3) * 220;
      const top = 20 + Math.floor(index / 3) * 24;

      legend
        .append("line")
        .attr("x1", left)
        .attr("x2", left + 22)
        .attr("y1", top)
        .attr("y2", top)
        .attr("stroke", colors(borough))
        .attr("stroke-width", 3);

      legend
        .append("text")
        .attr("x", left + 30)
        .attr("y", top + 4)
        .text(borough);
    });

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + height - margin.bottom) / 2)
      .attr("y", 17)
      .attr("text-anchor", "middle")
      .attr("font-family", "Times New Roman, Times, serif")
      .attr("font-size", 12)
      .text("Inspections finding rat activity (%)");

    // Label the horizontal axis.
    svg
      .append("text")
      .attr("x", (margin.left + width - margin.right) / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("font-family", "Times New Roman, Times, serif")
      .attr("font-size", 13)
      .text("Month of inspection (2025)");

    //d3.select("#monthly-status")
    //  .text("Hover over a dot to see its percentage and inspection count.");
  } catch (error) {
    console.error(error);
    d3.select("#monthly-status").text(
      "Could not draw the monthly chart: " + error.message,
    );
  }
}

export async function makeInspectionMap() {
  const status = d3.select("#map-status");

  try {
    // Load inspection records and official NYC borough boundaries.
    const [inspections, boundaryRows] = await Promise.all([
      loadInspections((row) => ({
        borough: row.BOROUGH.trim(),

        // Blank coordinates become NaN, rather than zero.
        latitude: row.LATITUDE.trim() ? Number(row.LATITUDE) : NaN,

        longitude: row.LONGITUDE.trim() ? Number(row.LONGITUDE) : NaN,

        ratActivity: row.RESULT.toLowerCase().includes("rat activity"),
      })),

      d3.json(assetUrl("data/boroughs.geojson")),
    ]);

    // Local official NYC borough geometry avoids a runtime external dependency.
    const boroughs = boundaryRows;

    if (
      boroughs.features.length !== 5 ||
      boroughs.features.some((feature) => !feature.geometry)
    ) {
      throw new Error("Could not load all five borough boundaries.");
    }

    // Exclude missing or clearly out-of-range coordinates.
    // These records remain included in the other charts.
    const mappedInspections = inspections.filter(
      (row) =>
        Number.isFinite(row.latitude) &&
        Number.isFinite(row.longitude) &&
        row.latitude >= 40.45 &&
        row.latitude <= 40.95 &&
        row.longitude >= -74.3 &&
        row.longitude <= -73.65,
    );

    const canvas = document.querySelector("#inspection-map");
    const context = canvas.getContext("2d");

    const width = 850;
    const height = 650;

    // Sharper rendering on Retina screens.
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    // Convert longitude and latitude into screen positions.
    const projection = d3.geoMercator().fitExtent(
      [
        [25, 25],
        [width - 25, height - 25],
      ],
      {
        type: "MultiPoint",
        coordinates: [
          [-74.26, 40.49],
          [-73.7, 40.92],
        ],
      },
    );

    // Draw geographic shapes directly onto Canvas.
    const path = d3.geoPath().projection(projection).context(context);

    // Calculate screen positions once.
    const points = mappedInspections.map((row) => ({
      ...row,
      position: projection([row.longitude, row.latitude]),
    }));

    // Rat-activity findings are a subset of all inspections.
    const activityPoints = points.filter((point) => point.ratActivity);

    const labels = [
      { name: "Manhattan", coordinates: [-73.98, 40.78] },
      { name: "Bronx", coordinates: [-73.86, 40.86] },
      { name: "Brooklyn", coordinates: [-73.96, 40.65] },
      { name: "Queens", coordinates: [-73.81, 40.73] },
      { name: "Staten Island", coordinates: [-74.15, 40.58] },
    ];

    function drawMap() {
      context.clearRect(0, 0, width, height);

      // Water/background.
      // Transparent water lets the newspaper paper show through the map.

      // Borough land areas.
      context.fillStyle = "#f5eddb";
      context.strokeStyle = "#8d969a";
      context.lineWidth = 1;

      for (const borough of boroughs.features) {
        context.beginPath();
        path(borough);
        context.fill("evenodd");
        context.stroke();
      }

      // Layer 1: all initial inspections in blue.
      context.fillStyle = "rgba(45, 83, 111, 0.15)";

      for (const point of points) {
        const [x, y] = point.position;

        context.beginPath();
        context.arc(x, y, 1.2, 0, Math.PI * 2);
        context.fill();
      }

      // Layer 2: rat-activity findings overlaid in red.
      context.fillStyle = "rgba(198, 60, 40, 0.45)";

      for (const point of activityPoints) {
        const [x, y] = point.position;

        context.beginPath();
        context.arc(x, y, 1.2, 0, Math.PI * 2);
        context.fill();
      }

      // Borough names drawn above both point layers.
      context.font = "bold 16px Times New Roman";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 4;
      context.strokeStyle = "#f5eddb";
      context.fillStyle = "#252525";

      for (const label of labels) {
        const [x, y] = projection(label.coordinates);

        context.strokeText(label.name, x, y);
        context.fillText(label.name, x, y);
      }

      const excluded = inspections.length - points.length;

      status.text(
        `${d3.format(",")(points.length)} initial inspections shown ` +
          `in blue; ${d3.format(",")(activityPoints.length)} of those ` +
          `found rat activity and are overlaid in red. ` +
          `${d3.format(",")(excluded)} records excluded because their ` +
          `coordinates are missing or out of range.`,
      );

      canvas.setAttribute(
        "aria-label",
        "NYC inspection map. All initial inspections appear in blue, " +
          "with inspections finding rat activity overlaid in red. " +
          "Boroughs are labeled.",
      );
    }

    drawMap();
  } catch (error) {
    console.error(error);
    status.text("Could not draw the map: " + error.message);
  }
}
