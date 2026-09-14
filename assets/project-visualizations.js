(() => {
  const d3 = window.d3;
  const mounts = Array.from(document.querySelectorAll("[data-project-visualizations]"));

  if (!d3 || !mounts.length) {
    return;
  }

  const featureLabels = {
    heart_rate: "Heart rate (bpm)",
    VO2: "VO2 (mL/min)",
    rf: "Respiratory frequency",
    saturation: "Oxygen saturation (%)",
    power: "Power (W)",
    cadence: "Cadence (rpm)",
    lactate: "Blood lactate (mmol/L)",
    time: "Elapsed time (s)",
    rank: "Ranked gene-list position",
    score: "Running enrichment score",
    avg: "Average latency (s)",
    nes: "Normalized enrichment score",
    balancedAccuracy: "Balanced accuracy",
    price: "Kalshi yes-price ($)",
    share: "Share of sequences",
    minute: "Minutes from shock",
    value: "Correlation with lactate",
    r2: "Test R2",
  };

  const chartColors = ["#c63b34", "#245f8f", "#2f9367", "#b99b45"];

  const text = (value) => String(value ?? "");
  const numberValue = (value) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
  const displayValue = (value, unit = "") => `${value.toFixed(Math.abs(value) < 10 ? 2 : 1)}${unit}`;
  const escapeHtml = (value) =>
    text(value).replace(/[&<>"']/g, (character) => {
      const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return entities[character];
    });

  function extentWithFallback(values) {
    const extent = d3.extent(values);
    const min = extent[0] ?? 0;
    const max = extent[1] ?? 1;
    return min === max ? [min - 1, max + 1] : [min, max];
  }

  function appendSafeXAxisTick(svg, tick, ticks, xScale, y, margin, width) {
    const isFirst = tick === ticks[0];
    const isLast = tick === ticks.at(-1);
    svg
      .append("text")
      .attr("class", "chart-tick")
      .attr("x", Math.max(margin.left, Math.min(width - margin.right, xScale(tick))))
      .attr("y", y)
      .attr("text-anchor", isLast ? "end" : isFirst ? "start" : "middle")
      .text(displayValue(tick));
  }

  function splitAxisLabel(value, maxLineLength = 24, maxLines = 2) {
    const words = text(value).split(/\s+/).filter(Boolean);
    const lines = [];

    words.forEach((word) => {
      const current = lines[lines.length - 1] || "";
      if (!current || `${current} ${word}`.length > maxLineLength) {
        lines.push(word);
      } else {
        lines[lines.length - 1] = `${current} ${word}`;
      }
    });

    if (lines.length > maxLines) {
      const visible = lines.slice(0, maxLines);
      visible[maxLines - 1] = `${visible[maxLines - 1].replace(/\.*$/, "")}...`;
      return visible;
    }

    return lines;
  }

  function createElement(tagName, className, html) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (html != null) {
      element.innerHTML = html;
    }
    return element;
  }

  function createChartFrame(caption) {
    const frame = createElement("div", "chart-frame");
    const meta = createElement("div", "chart-meta");
    const captionElement = createElement("p");
    const readout = createElement("strong");

    captionElement.textContent = caption;
    readout.setAttribute("aria-live", "polite");
    meta.append(captionElement, readout);
    frame.append(meta);

    return { frame, readout, insertChart: (chart) => frame.insertBefore(chart, meta) };
  }

  function renderBarChart({ data, xKey, yKey, unit = "", caption, ariaLabel, showCategoryLabels = false, showValueLabels = true, title, fixedHeight }) {
    const { frame, readout, insertChart } = createChartFrame(caption);
    const width = 760;
    const rowHeight = showCategoryLabels ? 58 : 48;
    const heightPadding = showCategoryLabels ? 116 : 76;
    const height = fixedHeight || Math.max(showCategoryLabels ? 280 : 250, data.length * rowHeight + heightPadding);
    const margin = { top: title ? 54 : 28, right: 104, bottom: 56, left: showCategoryLabels ? 238 : 58 };
    const labelPadding = 14;
    const values = data.map((item) => numberValue(item[yKey]));
    const maxMagnitude = d3.max(values.map(Math.abs)) || 1;
    const hasNegative = values.some((value) => value < 0);
    const xScale = d3
      .scaleLinear()
      .domain(hasNegative ? [-maxMagnitude, maxMagnitude] : [0, maxMagnitude])
      .nice()
      .range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleBand()
      .domain(data.map((item, index) => `${index}-${text(item[xKey])}`))
      .range([margin.top, height - margin.bottom])
      .padding(0.28);
    const xTicks = xScale.ticks(5);
    const zeroX = xScale(0);
    const svg = d3
      .create("svg")
      .attr("class", "native-chart bar-chart-svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", ariaLabel || `${featureLabels[yKey] || yKey} bar chart built with D3 scales`);

    if (title) {
      svg
        .append("text")
        .attr("class", "chart-svg-title")
        .attr("x", margin.left)
        .attr("y", 26)
        .text(title);
    }

    xTicks.forEach((tick) => {
      const group = svg.append("g");
      group
        .append("line")
        .attr("class", "chart-grid-line")
        .attr("x1", xScale(tick))
        .attr("y1", margin.top - 8)
        .attr("x2", xScale(tick))
        .attr("y2", height - margin.bottom);
      appendSafeXAxisTick(svg, tick, xTicks, xScale, height - margin.bottom + 24, margin, width);
    });

    svg
      .append("line")
      .attr("class", "chart-axis")
      .attr("x1", margin.left)
      .attr("y1", height - margin.bottom)
      .attr("x2", width - margin.right)
      .attr("y2", height - margin.bottom);
    svg
      .append("line")
      .attr("class", "chart-axis")
      .attr("x1", zeroX)
      .attr("y1", margin.top - 8)
      .attr("x2", zeroX)
      .attr("y2", height - margin.bottom);
    svg
      .append("text")
      .attr("class", "chart-axis-title")
      .attr("x", margin.left)
      .attr("y", height - 8)
      .text(featureLabels[yKey] || yKey);

    let activeIndex = 0;
    const groups = svg
      .selectAll(".bar-row-g")
      .data(data)
      .join("g")
      .attr("class", "bar-row-g")
      .attr("data-negative", (item) => String(numberValue(item[yKey]) < 0))
      .attr("tabindex", 0);

    groups.append("title").text((item) => `${text(item[xKey])}: ${displayValue(numberValue(item[yKey]), unit)}`);
    if (showCategoryLabels) {
      groups
        .append("text")
        .attr("class", "chart-category-label")
        .attr("x", margin.left - 14)
        .attr("y", (item, index) => (yScale(`${index}-${text(item[xKey])}`) || margin.top) + yScale.bandwidth() / 2)
        .attr("text-anchor", "end")
        .each(function (item) {
          const label = d3.select(this);
          const lines = splitAxisLabel(item[xKey]);
          const lineHeight = 14;
          lines.forEach((line, lineIndex) => {
            label
              .append("tspan")
              .attr("x", margin.left - 14)
              .attr("dy", lineIndex === 0 ? `${-(lines.length - 1) * lineHeight * 0.5 + 4}px` : `${lineHeight}px`)
              .text(line);
          });
        });
    }
    groups
      .append("rect")
      .attr("class", "d3-hit-area")
      .attr("x", 0)
      .attr("y", (item, index) => (yScale(`${index}-${text(item[xKey])}`) || margin.top) - 9)
      .attr("width", width)
      .attr("height", yScale.bandwidth() + 18);
    groups
      .append("rect")
      .attr("class", "chart-bar")
      .attr("x", (item) => {
        const value = numberValue(item[yKey]);
        return value < 0 ? xScale(value) : zeroX;
      })
      .attr("y", (item, index) => yScale(`${index}-${text(item[xKey])}`) || margin.top)
      .attr("width", (item) => Math.max(2, Math.abs(xScale(numberValue(item[yKey])) - zeroX)))
      .attr("height", yScale.bandwidth());
    if (showValueLabels) {
      groups
        .append("text")
        .attr("class", "chart-value-label")
        .attr("x", (item) => {
          const value = numberValue(item[yKey]);
          if (value < 0) {
            return labelPadding;
          }
          return width - labelPadding;
        })
        .attr("y", (item, index) => (yScale(`${index}-${text(item[xKey])}`) || margin.top) + yScale.bandwidth() / 2 + 4)
        .attr("text-anchor", (item) => (numberValue(item[yKey]) < 0 ? "start" : "end"))
        .text((item) => displayValue(numberValue(item[yKey]), unit));
    }

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(data.length - 1, index));
      groups.attr("data-active", (_item, groupIndex) => String(groupIndex === activeIndex));
      const active = data[activeIndex];
      readout.textContent = active ? `${text(active[xKey])}: ${displayValue(numberValue(active[yKey]), unit)}` : "";
    };

    groups.each(function (_item, index) {
      const group = d3.select(this);
      group.on("pointerenter focus", () => setActive(index));
      group.on("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          setActive(index + 1);
          groups.nodes()[activeIndex]?.focus();
        }
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          setActive(index - 1);
          groups.nodes()[activeIndex]?.focus();
        }
      });
    });

    setActive(0);
    insertChart(svg.node());
    return frame;
  }

  function renderLineChart({ data, xKey, yKey, seriesKey, caption, ariaLabel, title }) {
    const { frame, readout, insertChart } = createChartFrame(caption);
    const width = 760;
    const height = 320;
    const margin = { top: title ? 62 : 28, right: 32, bottom: 54, left: 58 };
    const xScale = d3
      .scaleLinear()
      .domain(extentWithFallback(data.map((item) => numberValue(item[xKey]))))
      .nice()
      .range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain(extentWithFallback(data.map((item) => numberValue(item[yKey]))))
      .nice()
      .range([height - margin.bottom, margin.top]);
    const svg = d3
      .create("svg")
      .attr("class", "native-chart interactive-chart")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr("aria-label", ariaLabel || `${featureLabels[yKey] || yKey} line chart built with D3`);
    const lineGenerator = d3
      .line()
      .x((item) => xScale(numberValue(item[xKey])))
      .y((item) => yScale(numberValue(item[yKey])))
      .curve(d3.curveMonotoneX);

    yScale.ticks(5).forEach((tick) => {
      const group = svg.append("g");
      group
        .append("line")
        .attr("class", "chart-grid-line")
        .attr("x1", margin.left)
        .attr("y1", yScale(tick))
        .attr("x2", width - margin.right)
        .attr("y2", yScale(tick));
      group
        .append("text")
        .attr("class", "chart-tick")
        .attr("x", margin.left - 10)
        .attr("y", yScale(tick) + 4)
        .attr("text-anchor", "end")
        .text(displayValue(tick));
    });
    const xTicks = xScale.ticks(5);
    xTicks.forEach((tick) => appendSafeXAxisTick(svg, tick, xTicks, xScale, height - 24, margin, width));
    svg
      .append("line")
      .attr("class", "chart-axis")
      .attr("x1", margin.left)
      .attr("y1", height - margin.bottom)
      .attr("x2", width - margin.right)
      .attr("y2", height - margin.bottom);
    svg
      .append("line")
      .attr("class", "chart-axis")
      .attr("x1", margin.left)
      .attr("y1", margin.top)
      .attr("x2", margin.left)
      .attr("y2", height - margin.bottom);
    if (title) {
      svg.append("text").attr("class", "chart-svg-title").attr("x", margin.left).attr("y", 26).text(title);
    }
    svg.append("text").attr("class", "chart-axis-title").attr("x", margin.left).attr("y", height - 6).text(featureLabels[xKey] || xKey);
    svg
      .append("text")
      .attr("class", "chart-axis-title")
      .attr("x", margin.left)
      .attr("y", title ? margin.top - 12 : 16)
      .text(featureLabels[yKey] || yKey);

    const seriesValues = seriesKey ? Array.from(new Set(data.map((item) => item[seriesKey]))) : ["all"];
    seriesValues.forEach((series, index) => {
      const seriesData = seriesKey ? data.filter((item) => item[seriesKey] === series) : data;
      svg
        .append("path")
        .attr("class", "line-path")
        .attr("d", lineGenerator(seriesData) || "")
        .attr("stroke", chartColors[index % chartColors.length]);
    });

    const cursor = svg.append("line").attr("class", "chart-cursor").attr("y1", margin.top).attr("y2", height - margin.bottom);
    const activePoint = svg.append("circle").attr("class", "active-point").attr("r", 6);
    let activeIndex = Math.max(0, Math.floor(data.length / 2));

    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(data.length - 1, index));
      const active = data[activeIndex];
      const activeX = active ? xScale(numberValue(active[xKey])) : margin.left;
      const activeY = active ? yScale(numberValue(active[yKey])) : height - margin.bottom;
      cursor.attr("x1", activeX).attr("x2", activeX);
      activePoint.attr("cx", activeX).attr("cy", activeY);
      readout.textContent = active
        ? `${featureLabels[xKey] || xKey}: ${displayValue(numberValue(active[xKey]))} | ${featureLabels[yKey] || yKey}: ${displayValue(numberValue(active[yKey]))}`
        : "";
    };

    svg.on("pointermove", (event) => {
      const [pointerX] = d3.pointer(event, svg.node());
      const xTarget = xScale.invert(pointerX);
      const nearest = d3.leastIndex(data, (item) => Math.abs(numberValue(item[xKey]) - xTarget));
      setActive(nearest ?? 0);
    });
    svg.on("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }
    });

    setActive(activeIndex);
    insertChart(svg.node());
    return frame;
  }

  function renderScatterPlot({ data, xKey, yKey, caption, ariaLabel }) {
    const { frame, readout, insertChart } = createChartFrame(caption);
    const width = 760;
    const height = 320;
    const margin = { top: 28, right: 32, bottom: 54, left: 58 };
    const xScale = d3
      .scaleLinear()
      .domain(extentWithFallback(data.map((item) => numberValue(item[xKey]))))
      .nice()
      .range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain(extentWithFallback(data.map((item) => numberValue(item[yKey]))))
      .nice()
      .range([height - margin.bottom, margin.top]);
    const svg = d3
      .create("svg")
      .attr("class", "native-chart interactive-chart")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("tabindex", 0)
      .attr("role", "img")
      .attr("aria-label", ariaLabel || `${featureLabels[xKey] || xKey} versus ${featureLabels[yKey] || yKey} scatter plot built with D3`);
    const colors = { 1: "#c63b34", 2: "#245f8f", 3: "#2f9367" };
    const plottedPoints = data.map((item) => ({
      item,
      x: xScale(numberValue(item[xKey])),
      y: yScale(numberValue(item[yKey])),
    }));
    const delaunay = d3.Delaunay.from(plottedPoints, (point) => point.x, (point) => point.y);

    yScale.ticks(5).forEach((tick) => {
      const group = svg.append("g");
      group.append("line").attr("class", "chart-grid-line").attr("x1", margin.left).attr("y1", yScale(tick)).attr("x2", width - margin.right).attr("y2", yScale(tick));
      group.append("text").attr("class", "chart-tick").attr("x", margin.left - 10).attr("y", yScale(tick) + 4).attr("text-anchor", "end").text(displayValue(tick));
    });
    const xTicks = xScale.ticks(5);
    xTicks.forEach((tick) => appendSafeXAxisTick(svg, tick, xTicks, xScale, height - 24, margin, width));
    svg.append("line").attr("class", "chart-axis").attr("x1", margin.left).attr("y1", height - margin.bottom).attr("x2", width - margin.right).attr("y2", height - margin.bottom);
    svg.append("line").attr("class", "chart-axis").attr("x1", margin.left).attr("y1", margin.top).attr("x2", margin.left).attr("y2", height - margin.bottom);
    svg.append("text").attr("class", "chart-axis-title").attr("x", margin.left).attr("y", height - 6).text(featureLabels[xKey] || xKey);
    svg.append("text").attr("class", "chart-axis-title").attr("x", margin.left).attr("y", 16).text(featureLabels[yKey] || yKey);

    const points = svg
      .selectAll(".scatter-point")
      .data(plottedPoints)
      .join("circle")
      .attr("class", "scatter-point")
      .attr("cx", (point) => point.x)
      .attr("cy", (point) => point.y)
      .attr("fill", (point) => colors[text(point.item.day)] || "#111")
      .attr("r", 3);

    let activeIndex = 0;
    const setActive = (index) => {
      activeIndex = Math.max(0, Math.min(data.length - 1, index));
      points.attr("data-active", (_point, pointIndex) => String(pointIndex === activeIndex)).attr("r", (_point, pointIndex) => (pointIndex === activeIndex ? 6 : 3));
      const active = data[activeIndex];
      readout.textContent = active
        ? `${featureLabels[xKey] || xKey}: ${displayValue(numberValue(active[xKey]))} | ${featureLabels[yKey] || yKey}: ${displayValue(numberValue(active[yKey]))}`
        : "";
    };

    svg.on("pointermove", (event) => {
      const [pointerX, pointerY] = d3.pointer(event, svg.node());
      setActive(delaunay.find(pointerX, pointerY));
    });
    svg.on("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive(activeIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive(activeIndex - 1);
      }
    });

    setActive(0);
    insertChart(svg.node());
    return frame;
  }

  function renderTable(headers, rows) {
    const wrap = createElement("div", "small-table-wrap");
    const table = createElement("table");
    table.innerHTML = `
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    `;
    wrap.append(table);
    return wrap;
  }

  function renderSection({ className = "case-section", label, title, copy, content }) {
    const section = createElement("section", className);
    section.innerHTML = `
      <div class="case-section-head">
        <p class="section-label">${escapeHtml(label)}</p>
        <h2>${escapeHtml(title)}</h2>
        ${copy ? `<p class="case-copy">${escapeHtml(copy)}</p>` : ""}
      </div>
    `;
    if (content) {
      section.append(content);
    }
    return section;
  }

  function renderLastMileHealth(mount, artifact) {
    const fragment = document.createDocumentFragment();
    const benchmarks = createElement(
      "section",
      "case-section",
      `<div class="case-section-head"><p class="section-label">Benchmarks</p><h2>Latency exposes where the agent does real work.</h2><p class="case-copy">The benchmark results show whether the redesign made the agent usable in practice: routine KPI questions return quickly enough for staff-facing workflows, while slower database-backed prompts make the remaining optimization targets visible.</p></div>`
    );
    const benchmarkGrid = createElement("div", "benchmark-grid");
    benchmarkGrid.append(
      renderTable(
        ["Query", "Avg", "Cold", "Rows"],
        (artifact.benchmarks || []).map((row) => [row.query, `${numberValue(row.avg).toFixed(2)}s`, `${numberValue(row.cold).toFixed(2)}s`, row.rows == null ? "-" : row.rows])
      ),
      renderBarChart({
        data: artifact.benchmarks || [],
        xKey: "query",
        yKey: "avg",
        unit: "s",
        caption: "X axis: benchmark prompt. Y value: average warm latency in seconds.",
        showCategoryLabels: true,
        title: "Average latency by benchmark query",
      })
    );
    benchmarks.append(benchmarkGrid);
    fragment.append(benchmarks);
    mount.append(fragment);
  }

  function renderGsea(mount, artifact) {
    const pathways = artifact.pathways || [];
    const fragment = document.createDocumentFragment();

    const grid = createElement("section", "case-section case-two-col gsea-chart-grid");
    const direction = createElement(
      "div",
      "gsea-direction-column",
      `<p class="section-label">Enrichment Direction</p><h2>Pathway signal is read by direction and magnitude.</h2><p class="case-copy">Positive scores indicate concentration toward the top of the ranked WBH-versus-sham contrast; negative scores indicate concentration toward the opposite end. Larger absolute values suggest stronger directional enrichment.</p>`
    );
    direction.append(
      renderBarChart({
        data: pathways,
        xKey: "pathway",
        yKey: "nes",
        caption: "X axis: gene set. Bar value: normalized enrichment score; red bars indicate negative enrichment.",
        showCategoryLabels: true,
        title: "Normalized enrichment score by gene set",
        fixedHeight: 320,
      })
    );

    const running = createElement(
      "div",
      "",
      `<p class="section-label">Running Score</p><h2>The curve shows where enrichment accumulates.</h2><p class="case-copy">Move across the line to inspect the running score at each ranked-list position. A peak early in the list means pathway genes appear disproportionately near the top-ranked genes.</p>`
    );
    const select = createElement("select", "case-select");
    pathways.forEach((pathway) => {
      const option = createElement("option");
      option.value = text(pathway.pathway);
      option.textContent = text(pathway.pathway);
      select.append(option);
    });
    const chartHost = createElement("div");
    const renderRunningChart = () => {
      const active = pathways.find((pathway) => text(pathway.pathway) === select.value) || pathways[0];
      chartHost.replaceChildren(
        renderLineChart({
          data: active?.runningScore || [],
          xKey: "rank",
          yKey: "score",
          caption: "X axis: normalized gene rank from 0 to 1. Y axis: running enrichment score.",
          ariaLabel: `Running enrichment score for ${text(active?.pathway)}`,
        })
      );
    };
    select.addEventListener("change", renderRunningChart);
    running.append(select, chartHost);
    grid.append(direction, running);

    const resultOrder = ["Heat Shock Proteostasis", "Dopamine", "Serotonin", "Interferon Signaling"];
    const tablePathways = resultOrder
      .map((pathwayName) => pathways.find((pathway) => pathway.pathway === pathwayName))
      .filter(Boolean);

    const tableSection = renderSection({
      label: "Results",
      title: "WBH produced pathway-level enrichment trends.",
      copy: "The analysis identified directional enrichment across the selected serotonin, dopamine, intermediate-signaling, and heat-shock gene sets. Results were evaluated using normalized enrichment scores, phenotype-permutation testing, and false-discovery-rate correction rather than interpreting enrichment magnitude alone.",
      content: renderTable(
        ["Gene set", "ES", "NES", "p-value", "Genes"],
        tablePathways.map((row) => [row.pathway, numberValue(row.es).toFixed(3), numberValue(row.nes).toFixed(3), numberValue(row.pvalue ?? row.padj).toFixed(3), row.genes])
      ),
    });

    fragment.append(grid, tableSection);
    mount.append(fragment);
    renderRunningChart();
  }

  function renderBloodLactate(mount, artifact) {
    const fragment = document.createDocumentFragment();
    const daySummary = artifact.daySummary || [];
    const daySelect = createElement("select", "case-select");
    daySummary.forEach((item) => {
      const option = createElement("option");
      option.value = text(item.day);
      option.textContent = `Day ${text(item.day)}`;
      daySelect.append(option);
    });

    const featureSelect = createElement("select", "case-select");
    ["heart_rate", "VO2", "rf", "saturation", "power", "cadence"].forEach((feature) => {
      const option = createElement("option");
      option.value = feature;
      option.textContent = featureLabels[feature];
      featureSelect.append(option);
    });

    const firstGrid = createElement("section", "case-section case-two-col");
    const timeColumn = createElement(
      "div",
      "",
      `<p class="section-label">Time Series</p><h2>Exercise days have distinct lactate trajectories.</h2><p class="case-copy">Time-series traces reveal periods of active exercise and rest between testing days. Heart rate, respiratory frequency, power, cadence, and lactate rise and fall differently across sessions, motivating models that can capture nonlinear and day-dependent behavior.</p>`
    );
    const timeChartHost = createElement("div");
    timeColumn.append(daySelect, timeChartHost);

    const scatterColumn = createElement(
      "div",
      "",
      `<p class="section-label">Feature Relationship</p><h2>Exploring lactate against non-invasive signals.</h2><p class="case-copy">Heart rate, respiratory frequency, cadence, and power cluster together as measures of exercise intensity, while lactate shows a moderately strong relationship with elapsed time. Oxygen saturation behaves differently, decreasing as exercise progresses and lactate rises.</p>`
    );
    const scatterChartHost = createElement("div");
    scatterColumn.append(featureSelect, scatterChartHost);
    firstGrid.append(timeColumn, scatterColumn);

    const secondGrid = createElement("section", "case-section case-two-col");
    const correlation = createElement(
      "div",
      "",
      `<p class="section-label">Correlation</p><h2>Saturation and respiratory frequency show strong relationships.</h2><p class="case-copy">Correlation is a quick linear screen, not a final model. It helps decide which physiological signals deserve closer nonlinear modeling.</p>`
    );
    correlation.append(
      renderBarChart({
        data: (artifact.correlations || []).map((item) => ({
          ...item,
          feature: (featureLabels[item.feature] || text(item.feature)).replace(/\s*\([^)]*\)$/, ""),
        })),
        xKey: "feature",
        yKey: "value",
        showCategoryLabels: true,
        showValueLabels: false,
        caption: "X axis: Pearson correlation with lactate. Y axis: physiological feature.",
      })
    );
    const model = createElement(
      "div",
      "",
      `<p class="section-label">Model Comparison</p><h2>Ensemble models substantially outperformed linear regression.</h2><p class="case-copy">The overall result supported the project hypothesis: nonlinear models were substantially better suited to predicting lactate from these physiological signals than linear models.</p>`
    );
    model.append(
      renderBarChart({
        data: artifact.modelPerformance || [],
        xKey: "model",
        yKey: "r2",
        showCategoryLabels: true,
        caption: "X axis: held-out R2. Y axis: model family.",
      })
    );
    secondGrid.append(correlation, model);

    const renderDayCharts = () => {
      const day = daySelect.value || text(daySummary[0]?.day);
      const feature = featureSelect.value;
      timeChartHost.replaceChildren(
        renderLineChart({
          data: (artifact.timeSeries || []).filter((item) => text(item.day) === day),
          xKey: "time",
          yKey: "lactate",
          caption: "X axis: elapsed time in seconds. Y axis: blood lactate in mmol/L.",
        })
      );
      scatterChartHost.replaceChildren(
        renderScatterPlot({
          data: (artifact.scatter || []).filter((item) => text(item.day) === day),
          xKey: feature,
          yKey: "lactate",
          caption: `X axis: ${featureLabels[feature]}. Y axis: blood lactate in mmol/L.`,
        })
      );
    };

    daySelect.addEventListener("change", renderDayCharts);
    featureSelect.addEventListener("change", renderDayCharts);
    fragment.append(firstGrid, secondGrid);
    mount.append(fragment);
    renderDayCharts();
  }

  function renderSports(mount, artifact) {
    const fragment = document.createDocumentFragment();
    const modelChartHost = document.querySelector("[data-sports-model-chart]");
    if (modelChartHost) {
      modelChartHost.replaceChildren(
        renderBarChart({
          data: artifact.modelPerformance || [],
          xKey: "model",
          yKey: "balancedAccuracy",
          unit: "%",
          showCategoryLabels: true,
          title: "Held-out balanced accuracy by model",
          caption: "X axis: held-out balanced accuracy. Y axis: 1-minute direction model.",
        })
      );
    }

    const eventSection = renderSection({
      className: "case-section sports-event-section",
      label: "Event Window",
      title: "A 20-minute market sequence captures behavior surrounding each shock.",
      copy: "Rather than representing an influential play with a single before-and-after price difference, each event retains its surrounding market history. This allows sequence models to learn patterns in recent price behavior and forecast the immediate post-event response.",
      content: renderLineChart({
        data: artifact.eventSequence || [],
        xKey: "minute",
        yKey: "price",
        title: "Price path around a win-probability shock",
        caption: "X axis: minutes from the win-probability shock. Y axis: Kalshi yes-price in dollars.",
      }),
    });

    fragment.append(eventSection);
    mount.append(fragment);
  }

  const renderers = {
    "last-mile-health-ai-assistant": renderLastMileHealth,
    "hyperthermia-gsea": renderGsea,
    "blood-lactate-prediction": renderBloodLactate,
    "sports-prediction-mispricing": renderSports,
  };

  async function enhance(mount) {
    const projectId = mount.dataset.projectVisualizations;
    const artifactUrl = mount.dataset.artifact;
    const renderer = renderers[projectId];

    if (!renderer || !artifactUrl) {
      return;
    }

    try {
      const response = await fetch(artifactUrl);
      if (!response.ok) {
        throw new Error(`Could not load ${artifactUrl}`);
      }
      const artifact = await response.json();
      renderer(mount, artifact);
      mount.hidden = false;
    } catch (error) {
      console.warn("Project visualization enhancement skipped:", error);
      mount.replaceChildren();
      mount.hidden = true;
    }
  }

  mounts.forEach((mount) => {
    enhance(mount);
  });
})();
