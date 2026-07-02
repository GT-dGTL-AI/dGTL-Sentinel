/**
 * dGTL Sentinel — Command Centre (Landing Dashboard). BRD §8.1.
 */
(function () {
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;
  const Badge = window.SentinelBadge;
  const Skel = window.SentinelSkeleton;
  const Charts = window.SentinelCharts;
  const Icons = window.SentinelIcons;
  const Risk = window.SentinelRisk;

  function windowTrend(cases, dateField, days) {
    const now = Date.now();
    const win = days * 86400000;
    const current = cases.filter((c) => now - new Date(c[dateField]).getTime() <= win).length;
    const prior = cases.filter((c) => {
      const age = now - new Date(c[dateField]).getTime();
      return age > win && age <= win * 2;
    }).length;
    if (prior === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prior) / prior) * 100);
  }

  function kpiCard(icon, iconBg, label, value, trend, invert) {
    return `
      <div class="kpi-card animate-fade-up">
        <div class="kpi-card__top">
          <span class="kpi-card__icon" style="background:${iconBg};color:#fff;">${Icons.icon(icon, { size: 20 })}</span>
          ${Badge.trendPill(trend, invert)}
        </div>
        <div class="kpi-card__value">${value}</div>
        <div class="kpi-card__label">${label}</div>
      </div>
    `;
  }

  function renderKpis(root) {
    const kpis = Data.getDashboardKpis();
    const cases = Data.getAllCases();
    const openTrend = windowTrend(cases.filter((c) => c.status !== "Closed"), "dateFlagged", 7);
    const highRiskTrend = windowTrend(cases.filter((c) => c.riskScore >= 4), "dateFlagged", 7);
    const resolvedCases = cases.filter((c) => c.resolvedAt);
    const resTrend = windowTrend(resolvedCases, "resolvedAt", 7);

    root.innerHTML =
      kpiCard("inbox", "linear-gradient(135deg,var(--purple-400),var(--purple-600))", "Total Open Cases", kpis.openCases, openTrend) +
      kpiCard("alert-triangle", "linear-gradient(135deg,#e08a4a,#c43d3d)", "High-Risk Cases (4–5)", kpis.highRiskCases, highRiskTrend) +
      kpiCard("clock", "linear-gradient(135deg,#4c9ac9,#3868c4)", "Avg. Resolution Time", kpis.avgResolutionHours + "h", -Math.abs(resTrend) || 0, true) +
      kpiCard("check-circle", "linear-gradient(135deg,#4c9a6a,#3e8f5c)", "Cases Resolved Today", kpis.resolvedToday, resTrend);
  }

  function renderTrendAndCategory(root) {
    const trend = Data.getAlertTrend(30);
    const category = Data.getCategoryBreakdown();
    const catColors = { "Behavioural Anomaly": "var(--purple-500)", "Access Anomaly": "var(--risk-4)", "Structuring Pattern": "var(--risk-3)" };

    root.innerHTML = `
      <div class="card animate-fade-up">
        <div class="card__header">
          <div>
            <div class="card__title">Alert Volume — Rolling 30 Days</div>
            <div class="card__subtitle">Daily count of newly triggered detection alerts</div>
          </div>
        </div>
        <div class="card__body" id="trend-chart-mount"></div>
      </div>
      <div class="card animate-fade-up stagger-1">
        <div class="card__header">
          <div>
            <div class="card__title">Alerts by Category</div>
            <div class="card__subtitle">Share of triggered detection scenarios</div>
          </div>
        </div>
        <div class="card__body" id="category-chart-mount"></div>
      </div>
    `;

    Charts.renderLineChart(document.getElementById("trend-chart-mount"),
      trend.map((t) => ({ label: `${t.date.getDate()}/${t.date.getMonth() + 1}`, value: t.count })),
      { xLabelEvery: 4, seriesLabel: "Alerts" });

    Charts.renderDonutChart(document.getElementById("category-chart-mount"),
      category.map((c) => ({ label: c.category, value: c.count, color: catColors[c.category] || "var(--slate-400)" })),
      { centerValue: category.reduce((s, c) => s + c.count, 0), centerLabel: "Total Alerts" });
  }

  function renderTopCasesAndRiskSummary(root) {
    const topCases = Data.getTopRiskCases(5);
    const allCases = Data.getAllCases();
    const bandCounts = [5, 4, 3, 2, 1].map((score) => ({
      score, count: allCases.filter((c) => c.riskScore === score).length,
    }));
    const maxBand = Math.max(...bandCounts.map((b) => b.count), 1);

    root.innerHTML = `
      <div class="card animate-fade-up">
        <div class="card__header">
          <div>
            <div class="card__title">Top 5 Highest-Risk Open Cases</div>
            <div class="card__subtitle">Priority queue — requires immediate attention</div>
          </div>
          <a href="case-queue.html" class="link-btn">View all cases</a>
        </div>
        <div id="top-cases-list"></div>
      </div>
      <div class="card animate-fade-up stagger-1">
        <div class="card__header"><div class="card__title">Risk Band Summary</div></div>
        <div class="card__body">
          ${bandCounts.map((b) => `
            <div class="risk-summary-row">
              <span class="risk-summary-row__label">${b.score} · ${Risk.band(b.score).label}</span>
              <span class="risk-summary-row__track progress-track">
                <span class="progress-fill" style="width:${(b.count / maxBand) * 100}%; background:${Risk.colorVar(b.score)};"></span>
              </span>
              <span class="risk-summary-row__count">${b.count}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const list = document.getElementById("top-cases-list");
    if (!topCases.length) {
      list.innerHTML = window.SentinelTable.emptyStateHtml({ icon: "shield-check", title: "No open high-risk cases", desc: "All priority cases have been resolved." });
    } else {
      list.innerHTML = topCases.map((c) => {
        const ph = Data.getPolicyholder(c.policyholderId);
        return `
          <div class="top-case-row" data-case-id="${c.id}">
            ${Badge.riskPill(c.riskScore)}
            <div class="top-case-row__meta">
              <div class="top-case-row__title">${Fmt.maskName(ph.name)} <span class="text-tertiary" style="font-weight:400;">· ${c.id}</span></div>
              <div class="top-case-row__sub">${c.category} · Flagged ${Fmt.timeAgo(c.dateFlagged)}</div>
            </div>
            ${Badge.statusBadge(c.status)}
            ${Icons.icon("arrow-right", { size: 16 })}
          </div>
        `;
      }).join("");
      list.querySelectorAll("[data-case-id]").forEach((row) => {
        row.addEventListener("click", () => { window.location.href = `case-detail.html?id=${row.dataset.caseId}`; });
      });
    }
  }

  function renderRecentAlerts(root) {
    const alerts = Data.getAlerts().slice().sort((a, b) => new Date(b.dateFlagged) - new Date(a.dateFlagged)).slice(0, 8);
    root.innerHTML = `
      <div class="card animate-fade-up">
        <div class="card__header">
          <div>
            <div class="card__title">Recent Alerts</div>
            <div class="card__subtitle">Latest signals surfaced by the detection engine</div>
          </div>
        </div>
        <div class="alert-row" style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-tertiary);font-weight:600;">
          <span>Risk</span><span>Policyholder</span><span>Scenario</span><span>Category</span><span>Flagged</span>
        </div>
        <div id="alerts-list"></div>
      </div>
    `;
    document.getElementById("alerts-list").innerHTML = alerts.map((a) => {
      const ph = Data.getPolicyholder(a.policyholderId);
      return `
        <div class="alert-row">
          ${Badge.riskPill(a.riskScore)}
          <span class="cell-primary">${Fmt.maskName(ph.name)}</span>
          <span class="text-secondary">${a.scenarioLabels[0]}${a.scenarioLabels.length > 1 ? ` +${a.scenarioLabels.length - 1}` : ""}</span>
          <span>${Badge.categoryBadge(a.category)}</span>
          <span class="text-tertiary">${Fmt.timeAgo(a.dateFlagged)}</span>
        </div>
      `;
    }).join("");
  }

  function render(root) {
    root.innerHTML = `
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-header__title">Command Centre</h1>
          <p class="page-header__subtitle">Real-time overview of policyholder risk signals and case workload</p>
        </div>
      </div>
      <div id="kpi-mount" class="grid grid-cols-4">${Skel.kpiSkeleton(4)}</div>
      <div class="dashboard-split" id="trend-category-mount">
        ${Skel.cardSkeleton(340)}${Skel.cardSkeleton(340)}
      </div>
      <div class="dashboard-split" id="top-risk-mount">
        ${Skel.cardSkeleton(320)}${Skel.cardSkeleton(320)}
      </div>
      <div id="recent-alerts-mount">${Skel.cardSkeleton(360)}</div>
    `;

    Skel.withDelay(document.getElementById("kpi-mount"), () => renderKpis(document.getElementById("kpi-mount")), 300);
    Skel.withDelay(document.getElementById("trend-category-mount"), () => renderTrendAndCategory(document.getElementById("trend-category-mount")), 480);
    Skel.withDelay(document.getElementById("top-risk-mount"), () => renderTopCasesAndRiskSummary(document.getElementById("top-risk-mount")), 620);
    Skel.withDelay(document.getElementById("recent-alerts-mount"), () => renderRecentAlerts(document.getElementById("recent-alerts-mount")), 760);
  }

  window.SentinelPages = window.SentinelPages || {};
  window.SentinelPages.dashboard = { render };
})();
