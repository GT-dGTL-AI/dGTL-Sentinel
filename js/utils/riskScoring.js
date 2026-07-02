/**
 * dGTL Sentinel — Risk scoring model (BRD Section 9).
 * Single source of truth for score → band/colour/routing mapping.
 */
(function () {
  const BANDS = {
    1: { label: "Minimal", description: "Isolated minor deviation, low confidence", routing: "Logged only", token: "risk-1" },
    2: { label: "Low", description: "Single weak signal", routing: "Logged, visible in queue", token: "risk-2" },
    3: { label: "Moderate", description: "One strong signal or multiple weak signals", routing: "Standard queue", token: "risk-3" },
    4: { label: "High", description: "Multiple correlated signals", routing: "Priority queue", token: "risk-4" },
    5: { label: "Critical", description: "Strong multi-signal correlation with pattern deviation", routing: "Priority queue, auto-flagged to Senior Reviewer", token: "risk-5" },
  };

  const STATUS_TOKEN = {
    "New": "status-new",
    "In Review": "status-in-review",
    "Escalated": "status-escalated",
    "Closed": "status-closed",
  };

  function band(score) { return BANDS[score] || BANDS[1]; }
  function colorVar(score) { return `var(--risk-${score})`; }
  function bgVar(score) { return `var(--risk-${score}-bg)`; }
  function statusToken(status) { return STATUS_TOKEN[status] || "neutral"; }

  function isPriority(score) { return score >= 4; }

  window.SentinelRisk = { BANDS, band, colorVar, bgVar, statusToken, isPriority };
})();
