/**
 * dGTL Sentinel — hand-rolled SVG bar chart (vertical grouped or single series).
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  /**
   * renderBarChart(container, data, opts)
   * data: [{ label, value, value2? }]
   * opts: { height, color, color2, seriesLabel, series2Label, valueFormatter }
   */
  function renderBarChart(container, data, opts) {
    const o = opts || {};
    const width = 720;
    const height = o.height || 260;
    const padL = 42, padR = 16, padT = 16, padB = 34;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;
    const color = o.color || "var(--brand)";
    const color2 = o.color2 || "var(--purple-200)";
    const fmt = o.valueFormatter || ((v) => v);
    const hasSeries2 = data.some((d) => d.value2 != null);

    const maxVal = Math.max(1, ...data.map((d) => Math.max(d.value, d.value2 || 0)));
    const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
    const yAt = (v) => padT + innerH - (v / niceMax) * innerH;

    const groupW = innerW / data.length;
    const barW = hasSeries2 ? groupW * 0.28 : groupW * 0.46;

    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none" });

    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = padT + (innerH / gridCount) * i;
      const val = Math.round(niceMax - (niceMax / gridCount) * i);
      svg.appendChild(svgEl("line", { x1: padL, y1: y, x2: width - padR, y2: y, class: "chart-grid-line" }));
      const t = svgEl("text", { x: padL - 8, y: y + 4, class: "chart-axis-label", "text-anchor": "end" });
      t.textContent = fmt(val);
      svg.appendChild(t);
    }

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";

    data.forEach((d, i) => {
      const groupX = padL + i * groupW;
      const x1 = groupX + groupW / 2 - (hasSeries2 ? barW + 3 : barW / 2);
      const h1 = innerH - (yAt(d.value) - padT);
      const bar1 = svgEl("rect", {
        x: x1, y: yAt(d.value), width: barW, height: Math.max(h1, 0.5),
        rx: 4, fill: color, class: "chart-bar",
      });
      bar1.style.animationDelay = `${i * 25}ms`;
      svg.appendChild(bar1);

      bar1.addEventListener("mousemove", (e) => showTip(e, d.label, [{ label: o.seriesLabel || "Value", value: d.value, color }]));
      bar1.addEventListener("mouseleave", hideTip);

      if (hasSeries2) {
        const x2 = groupX + groupW / 2 + 3;
        const h2 = innerH - (yAt(d.value2) - padT);
        const bar2 = svgEl("rect", {
          x: x2, y: yAt(d.value2), width: barW, height: Math.max(h2, 0.5),
          rx: 4, fill: color2, class: "chart-bar",
        });
        bar2.style.animationDelay = `${i * 25 + 60}ms`;
        svg.appendChild(bar2);
        bar2.addEventListener("mousemove", (e) => showTip(e, d.label, [{ label: o.series2Label || "Value 2", value: d.value2, color: color2 }]));
        bar2.addEventListener("mouseleave", hideTip);
      }

      const t = svgEl("text", { x: groupX + groupW / 2, y: height - 10, class: "chart-axis-label", "text-anchor": "middle" });
      t.textContent = d.label;
      svg.appendChild(t);
    });

    const wrap = document.createElement("div");
    wrap.className = "chart relative";
    wrap.appendChild(svg);
    wrap.appendChild(tooltip);

    function showTip(e, title, rows) {
      const rect = wrap.getBoundingClientRect();
      tooltip.innerHTML = `<div class="chart-tooltip__title">${title}</div>` +
        rows.map((r) => `<div class="chart-tooltip__row"><span class="chart-tooltip__swatch" style="background:${r.color}"></span>${r.label}: ${fmt(r.value)}</div>`).join("");
      tooltip.style.left = (e.clientX - rect.left) + "px";
      tooltip.style.top = (e.clientY - rect.top) + "px";
      tooltip.classList.add("is-visible");
    }
    function hideTip() { tooltip.classList.remove("is-visible"); }

    container.innerHTML = "";
    container.appendChild(wrap);
    return wrap;
  }

  window.SentinelCharts = window.SentinelCharts || {};
  window.SentinelCharts.renderBarChart = renderBarChart;
})();
