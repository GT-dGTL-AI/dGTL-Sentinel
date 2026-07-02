/**
 * dGTL Sentinel — Analytics & Reporting. BRD §8.6.
 */
(function () {
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;
  const Icons = window.SentinelIcons;
  const Charts = window.SentinelCharts;
  const Export = window.SentinelExport;

  const state = { days: 30 };

  const DISPOSITION_COLORS = {
    "Accommodate": "var(--success)",
    "Decline/Block": "var(--danger)",
    "Escalate": "var(--warning)",
    "Hold for Additional Information": "var(--info)",
  };

  function headerHtml() {
    return `
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-header__title">Analytics &amp; Reporting</h1>
          <p class="page-header__subtitle">Portfolio-level view of detection volume, disposition outcomes, and analyst performance</p>
        </div>
        <div class="page-header__actions">
          <select class="filter-select" id="an-period">
            <option value="7">Last 7 days</option>
            <option value="30" selected>Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button class="btn btn--secondary" id="an-export-csv">${Icons.icon("download", { size: 15 })} Export CSV</button>
          <button class="btn btn--primary" id="an-export-pdf">${Icons.icon("printer", { size: 15 })} Export PDF Report</button>
        </div>
      </div>
    `;
  }

  function renderTrendAndResolution() {
    const trend = Data.getAlertTrend(state.days);
    const buckets = Data.getResolutionTimeBuckets();
    document.getElementById("an-trend-mount").innerHTML = "";
    document.getElementById("an-resolution-mount").innerHTML = "";
    Charts.renderLineChart(document.getElementById("an-trend-mount"),
      trend.map((t) => ({ label: `${t.date.getDate()}/${t.date.getMonth() + 1}`, value: t.count })),
      { xLabelEvery: Math.ceil(trend.length / 8), seriesLabel: "Alerts" });
    Charts.renderBarChart(document.getElementById("an-resolution-mount"),
      buckets.map((b) => ({ label: b.label, value: b.count })),
      { color: "var(--purple-500)", seriesLabel: "Cases" });
  }

  function renderDispositionSection() {
    const trend = Data.getDispositionTrend();
    const summary = Data.getDispositionSummary();
    Charts.renderBarChart(document.getElementById("an-disposition-trend-mount"),
      trend.map((w) => ({ label: w.label, value: w.Accommodate, value2: w["Decline/Block"] })),
      { color: "var(--success)", color2: "var(--danger)", seriesLabel: "Accommodate", series2Label: "Decline/Block" });

    Charts.renderDonutChart(document.getElementById("an-disposition-donut-mount"),
      summary.map((s) => ({ label: s.disposition, value: s.count, color: DISPOSITION_COLORS[s.disposition] || "var(--slate-400)" })),
      { centerValue: summary.reduce((s, d) => s + d.count, 0), centerLabel: "Dispositions" });
  }

  function renderWorkload() {
    const workload = Data.getAnalystWorkload();
    const maxAssigned = Math.max(...workload.map((w) => w.totalAssigned), 1);
    const root = document.getElementById("an-workload-mount");
    root.innerHTML = `
      <div class="workload-row workload-row--head">
        <span>Analyst</span><span>Open</span><span>Closed</span><span>Avg. Resolution</span><span>Workload Share</span>
      </div>
      ${workload.map((w) => `
        <div class="workload-row">
          <span class="flex items-center gap-2"><span class="avatar avatar--sm">${w.analyst.initials}</span>
            <span class="cell-stack"><span class="cell-primary">${w.analyst.name}</span><span class="cell-secondary">${w.analyst.role}</span></span>
          </span>
          <span>${w.openCount}</span>
          <span>${w.closedCount}</span>
          <span>${w.avgResolutionHours ? w.avgResolutionHours + "h" : "—"}</span>
          <span class="progress-track"><span class="progress-fill" style="width:${(w.totalAssigned / maxAssigned) * 100}%; background:var(--purple-500);"></span></span>
        </div>
      `).join("")}
    `;
  }

  function exportCsv() {
    const cutoff = Date.now() - state.days * 86400000;
    const cases = Data.getAllCases().filter((c) => new Date(c.dateFlagged).getTime() >= cutoff);
    const rows = cases.map((c) => {
      const ph = Data.getPolicyholder(c.policyholderId);
      const analyst = c.assignedAnalystId ? Data.getAnalyst(c.assignedAnalystId) : null;
      return [c.id, Fmt.maskName(ph.name), c.riskScore, c.category, c.status, c.disposition || "", analyst ? analyst.name : "Unassigned", Fmt.formatDate(c.dateFlagged), c.resolvedAt ? Fmt.formatDate(c.resolvedAt) : ""];
    });
    Export.exportCsv(`dgtl-sentinel-case-activity-${state.days}d.csv`,
      ["Case ID", "Policyholder", "Risk Score", "Category", "Status", "Disposition", "Assigned Analyst", "Date Flagged", "Resolved At"], rows);
    window.SentinelToast.success("CSV exported", `${rows.length} case(s) for the last ${state.days} days`);
  }

  function exportPdf() {
    const kpis = Data.getDashboardKpis();
    const summary = Data.getDispositionSummary();
    const workload = Data.getAnalystWorkload();
    const sections = `
      <h2>Key Metrics — Last ${state.days} Days</h2>
      <table>
        <tr><th>Open Cases</th><th>High-Risk Cases</th><th>Avg. Resolution</th><th>Resolved Today</th></tr>
        <tr><td>${kpis.openCases}</td><td>${kpis.highRiskCases}</td><td>${kpis.avgResolutionHours}h</td><td>${kpis.resolvedToday}</td></tr>
      </table>
      <h2>Disposition Summary</h2>
      <table><tr><th>Disposition</th><th>Count</th></tr>
        ${summary.map((s) => `<tr><td>${s.disposition}</td><td>${s.count}</td></tr>`).join("")}
      </table>
      <h2>Analyst Workload</h2>
      <table><tr><th>Analyst</th><th>Role</th><th>Open</th><th>Closed</th><th>Avg. Resolution</th></tr>
        ${workload.map((w) => `<tr><td>${w.analyst.name}</td><td>${w.analyst.role}</td><td>${w.openCount}</td><td>${w.closedCount}</td><td>${w.avgResolutionHours || "—"}h</td></tr>`).join("")}
      </table>
    `;
    Export.exportPdfReport("Case Activity Report", sections);
  }

  function render(root) {
    root.innerHTML = `
      ${headerHtml()}
      <div class="analytics-grid-2">
        <div class="card animate-fade-up">
          <div class="card__header"><div><div class="card__title">Alert Volume Trend</div><div class="card__subtitle">Detection engine output over the selected period</div></div></div>
          <div class="card__body" id="an-trend-mount"></div>
        </div>
        <div class="card animate-fade-up stagger-1">
          <div class="card__header"><div><div class="card__title">Resolution Time Distribution</div><div class="card__subtitle">Closed cases grouped by turnaround time</div></div></div>
          <div class="card__body" id="an-resolution-mount"></div>
        </div>
      </div>
      <div class="analytics-grid-2">
        <div class="card animate-fade-up stagger-2">
          <div class="card__header"><div><div class="card__title">Disposition Trend</div><div class="card__subtitle">Weekly Accommodate vs. Decline/Block outcomes</div></div></div>
          <div class="card__body" id="an-disposition-trend-mount"></div>
        </div>
        <div class="card animate-fade-up stagger-3">
          <div class="card__header"><div><div class="card__title">Disposition Outcomes</div><div class="card__subtitle">All-time distribution</div></div></div>
          <div class="card__body" id="an-disposition-donut-mount"></div>
        </div>
      </div>
      <div class="card animate-fade-up stagger-4">
        <div class="card__header"><div><div class="card__title">Analyst Workload &amp; Turnaround</div><div class="card__subtitle">Case load and average resolution time per analyst</div></div></div>
        <div id="an-workload-mount"></div>
      </div>
    `;

    renderTrendAndResolution();
    renderDispositionSection();
    renderWorkload();

    document.getElementById("an-period").addEventListener("change", (e) => {
      state.days = Number(e.target.value);
      renderTrendAndResolution();
    });
    document.getElementById("an-export-csv").addEventListener("click", exportCsv);
    document.getElementById("an-export-pdf").addEventListener("click", exportPdf);
  }

  window.SentinelPages = window.SentinelPages || {};
  window.SentinelPages.analytics = { render };
})();
