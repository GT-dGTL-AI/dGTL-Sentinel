/**
 * dGTL Sentinel — badge / pill markup helpers.
 */
(function () {
  const Risk = window.SentinelRisk;
  const Icons = window.SentinelIcons;

  function riskBadge(score) {
    const band = Risk.band(score);
    return `<span class="badge badge--risk-${score}"><span class="badge__dot"></span>${score} · ${band.label}</span>`;
  }

  function riskPill(score) {
    return `<span class="risk-pill risk-pill--${score}" title="${Risk.band(score).label} risk">${score}</span>`;
  }

  function statusBadge(status) {
    const token = Risk.statusToken(status);
    return `<span class="badge badge--${token}">${status}</span>`;
  }

  function categoryBadge(category) {
    return `<span class="badge badge--outline">${category}</span>`;
  }

  function dispositionBadge(disposition) {
    if (!disposition) return `<span class="badge badge--neutral">Pending</span>`;
    const map = {
      "Accommodate": "badge--status-closed",
      "Decline/Block": "badge--risk-5",
      "Escalate": "badge--status-escalated",
      "Hold for Additional Information": "badge--status-in-review",
    };
    return `<span class="badge ${map[disposition] || "badge--neutral"}">${disposition}</span>`;
  }

  function trendPill(value, invert) {
    const isUp = invert ? value < 0 : value > 0;
    const icon = value === 0 ? "minus" : (value > 0 ? "trending-up" : "trending-down");
    const cls = value === 0 ? "" : (isUp ? "is-up" : "is-down");
    return `<span class="kpi-card__trend ${cls}">${Icons.icon(icon, { size: 12 })}${Math.abs(value)}%</span>`;
  }

  window.SentinelBadge = { riskBadge, riskPill, statusBadge, categoryBadge, dispositionBadge, trendPill };
})();
