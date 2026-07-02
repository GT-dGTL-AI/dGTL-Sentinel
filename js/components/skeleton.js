/**
 * dGTL Sentinel — skeleton loading state helpers.
 * Used to visually reinforce that detection/AI reasoning is being
 * "computed live" per the dGTL Pulse interaction guidelines.
 */
(function () {
  function kpiSkeleton(count) {
    return Array.from({ length: count || 4 }).map(() => `
      <div class="kpi-card">
        <div class="skeleton skeleton--text" style="width:40%"></div>
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text" style="width:60%"></div>
      </div>
    `).join("");
  }

  function rowsSkeleton(count) {
    return Array.from({ length: count || 6 }).map(() => `<div class="skeleton skeleton--row"></div>`).join("");
  }

  function cardSkeleton(height) {
    return `<div class="skeleton" style="height:${height || 240}px; border-radius: var(--radius-lg);"></div>`;
  }

  function textSkeleton(lines) {
    return Array.from({ length: lines || 3 }).map((_, i) => `<div class="skeleton skeleton--text" style="width:${100 - i * 12}%"></div>`).join("");
  }

  /**
   * Runs `renderFn` after a short simulated analysis delay, swapping the
   * skeleton markup already in `el` for the real content.
   */
  function withDelay(el, renderFn, delay) {
    setTimeout(() => {
      if (!el.isConnected) return;
      renderFn();
    }, delay || 420);
  }

  window.SentinelSkeleton = { kpiSkeleton, rowsSkeleton, cardSkeleton, textSkeleton, withDelay };
})();
