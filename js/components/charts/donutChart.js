/**
 * dGTL Sentinel — hand-rolled SVG donut chart with animated segments.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  /**
   * renderDonutChart(container, data, opts)
   * data: [{ label, value, color }]
   * opts: { size, thickness, centerLabel, centerValue, showLegend }
   */
  function renderDonutChart(container, data, opts) {
    const o = opts || {};
    const size = o.size || 220;
    const thickness = o.thickness || 26;
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size });
    svg.appendChild(svgEl("circle", { cx, cy, r, fill: "none", stroke: "var(--slate-100)", "stroke-width": thickness }));

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";

    let offset = 0;
    data.forEach((d, i) => {
      const frac = d.value / total;
      const len = frac * circumference;
      const seg = svgEl("circle", {
        cx, cy, r, fill: "none", stroke: d.color, "stroke-width": thickness,
        "stroke-dasharray": `${len} ${circumference - len}`,
        "stroke-dashoffset": -offset,
        transform: `rotate(-90 ${cx} ${cy})`,
        "stroke-linecap": data.length === 1 ? "butt" : "round",
        class: "donut-segment",
        style: `--seg-len: ${len.toFixed(2)}`,
      });
      seg.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        tooltip.innerHTML = `<div class="chart-tooltip__title">${d.label}</div><div class="chart-tooltip__row"><span class="chart-tooltip__swatch" style="background:${d.color}"></span>${d.value} (${Math.round(frac * 100)}%)</div>`;
        tooltip.style.left = (e.clientX - rect.left) + "px";
        tooltip.style.top = (e.clientY - rect.top) + "px";
        tooltip.classList.add("is-visible");
      });
      seg.addEventListener("mouseleave", () => tooltip.classList.remove("is-visible"));
      svg.appendChild(seg);
      offset += len;
    });

    if (o.centerValue != null) {
      const vt = svgEl("text", { x: cx, y: cy - 2, "text-anchor": "middle", class: "donut-center-value" });
      vt.textContent = o.centerValue;
      svg.appendChild(vt);
      const lt = svgEl("text", { x: cx, y: cy + 16, "text-anchor": "middle", class: "donut-center-label" });
      lt.textContent = o.centerLabel || "";
      svg.appendChild(lt);
    }

    const wrap = document.createElement("div");
    wrap.className = "flex flex-col items-center relative";
    const chartBox = document.createElement("div");
    chartBox.className = "chart";
    chartBox.style.width = size + "px";
    chartBox.appendChild(svg);
    chartBox.appendChild(tooltip);
    wrap.appendChild(chartBox);

    if (o.showLegend !== false) {
      const legend = document.createElement("div");
      legend.className = "chart-legend";
      legend.innerHTML = data.map((d) => `
        <span class="chart-legend__item"><span class="chart-legend__swatch" style="background:${d.color}"></span>${d.label} · ${d.value}</span>
      `).join("");
      wrap.appendChild(legend);
    }

    container.innerHTML = "";
    container.appendChild(wrap);
    return wrap;
  }

  window.SentinelCharts = window.SentinelCharts || {};
  window.SentinelCharts.renderDonutChart = renderDonutChart;
})();
