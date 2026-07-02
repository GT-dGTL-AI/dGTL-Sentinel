/**
 * dGTL Sentinel — formatting helpers shared across pages.
 */
(function () {
  function formatCurrency(amount) {
    return "₹" + Math.round(amount).toLocaleString("en-IN");
  }

  function formatCurrencyCompact(amount) {
    if (amount >= 10000000) return "₹" + (amount / 10000000).toFixed(2) + " Cr";
    if (amount >= 100000) return "₹" + (amount / 100000).toFixed(2) + " L";
    if (amount >= 1000) return "₹" + (amount / 1000).toFixed(1) + "K";
    return "₹" + amount;
  }

  function formatDate(iso, opts) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", opts || { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function timeAgo(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  function initials(name) {
    return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }

  function maskName(name) {
    const parts = name.split(" ");
    return parts.map((p, i) => (i === 0 ? p : p[0] + ".")).join(" ");
  }

  function titleCase(str) {
    return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  window.SentinelFormat = {
    formatCurrency, formatCurrencyCompact, formatDate, formatDateTime, formatTime,
    timeAgo, initials, maskName, titleCase, slugify, clamp, escapeHtml,
  };
})();
