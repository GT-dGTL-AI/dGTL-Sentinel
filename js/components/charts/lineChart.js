/**
 * dGTL Sentinel — hand-rolled SVG area/line chart (no external chart lib).
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  /**
   * renderLineChart(container, points, opts)
   * points: [{ label, value }]
   * opts: { height, color, valueFormatter(v), xLabelEvery, series2, series2Color, series2Label, seriesLabel }
   */
  function renderLineChart(container, points, opts) {
    const o = opts || {};
    const width = 720;
    const height = o.height || 260;
    const padL = 42, padR = 16, padT = 16, padB = 30;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;
    const color = o.color || "var(--brand)";
    const fmt = o.valueFormatter || ((v) => v);

    const allValues = points.map((p) => p.value).concat(o.series2 ? o.series2.map((p) => p.value) : []);
    const maxVal = Math.max(1, ...allValues);
    const niceMax = Math.ceil(maxVal / 5) * 5 || 5;

    const xStep = innerW / Math.max(1, points.length - 1);
    const xAt = (i) => padL + i * xStep;
    const yAt = (v) => padT + innerH - (v / niceMax) * innerH;

    function pathFor(series) {
      return series.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.value).toFixed(2)}`).join(" ");
    }
    function areaFor(series) {
      const line = pathFor(series);
      return `${line} L ${xAt(series.length - 1).toFixed(2)} ${padT + innerH} L ${xAt(0)} ${padT + innerH} Z`;
    }

    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
      const y = padT + (innerH / gridCount) * i;
      const val = Math.round(niceMax - (niceMax / gridCount) * i);
      return { y, val };
    });

    const labelEvery = o.xLabelEvery || Math.ceil(points.length / 7);

    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none" });

    gridLines.forEach((g) => {
      svg.appendChild(svgEl("line", { x1: padL, y1: g.y, x2: width - padR, y2: g.y, class: "chart-grid-line" }));
      const t = svgEl("text", { x: padL - 8, y: g.y + 4, class: "chart-axis-label", "text-anchor": "end" });
      t.textContent = fmt(g.val);
      svg.appendChild(t);
    });

    points.forEach((p, i) => {
      if (i % labelEvery !== 0 && i !== points.length - 1) return;
      const t = svgEl("text", { x: xAt(i), y: height - 8, class: "chart-axis-label", "text-anchor": "middle" });
      t.textContent = p.label;
      svg.appendChild(t);
    });

    const gradId = "areaGrad" + Math.random().toString(36).slice(2, 8);
    const defs = svgEl("defs");
    const grad = svgEl("linearGradient", { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": color, "stop-opacity": 0.28 }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": color, "stop-opacity": 0.02 }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    svg.appendChild(svgEl("path", { d: areaFor(points), fill: `url(#${gradId})`, class: "chart-area-path" }));
    svg.appendChild(svgEl("path", { d: pathFor(points), class: "chart-line-path", stroke: color }));

    if (o.series2) {
      svg.appendChild(svgEl("path", { d: pathFor(o.series2), class: "chart-line-path", stroke: o.series2Color || "var(--slate-400)", style: "stroke-dasharray:5 4; animation-delay:.15s;" }));
    }

    const hoverLine = svgEl("line", { x1: 0, y1: padT, x2: 0, y2: padT + innerH, class: "chart-hover-line" });
    svg.appendChild(hoverLine);
    const hoverDot = svgEl("circle", { r: 4.5, class: "chart-dot", style: "opacity:0; animation:none;" });
    svg.appendChild(hoverDot);

    const wrap = document.createElement("div");
    wrap.className = "chart relative";
    wrap.appendChild(svg);
    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    wrap.appendChild(tooltip);

    svg.addEventListener("mousemove", (e) => {
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      let idx = Math.round((mx - padL) / xStep);
      idx = Fmt().clamp(idx, 0, points.length - 1);
      const p = points[idx];
      hoverLine.setAttribute("x1", xAt(idx)); hoverLine.setAttribute("x2", xAt(idx));
      hoverLine.style.opacity = 1;
      hoverDot.setAttribute("cx", xAt(idx)); hoverDot.setAttribute("cy", yAt(p.value));
      hoverDot.style.opacity = 1;
      tooltip.innerHTML = `<div class="chart-tooltip__title">${p.label}</div><div class="chart-tooltip__row"><span class="chart-tooltip__swatch" style="background:${color}"></span>${o.seriesLabel || "Alerts"}: ${fmt(p.value)}</div>`;
      const px = (xAt(idx) / width) * rect.width;
      const py = (yAt(p.value) / height) * rect.height;
      tooltip.style.left = px + "px";
      tooltip.style.top = py + "px";
      tooltip.classList.add("is-visible");
    });
    svg.addEventListener("mouseleave", () => {
      hoverLine.style.opacity = 0;
      hoverDot.style.opacity = 0;
      tooltip.classList.remove("is-visible");
    });

    function Fmt() { return window.SentinelFormat; }

    container.innerHTML = "";
    container.appendChild(wrap);
    return wrap;
  }

  window.SentinelCharts = window.SentinelCharts || {};
  window.SentinelCharts.renderLineChart = renderLineChart;
})();
