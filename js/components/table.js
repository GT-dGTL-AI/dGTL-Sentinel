/**
 * dGTL Sentinel — shared table chrome: sortable headers, pagination,
 * and empty states. Individual pages own their row rendering since
 * column shapes differ, but share this chrome for consistency.
 */
(function () {
  const Icons = window.SentinelIcons;

  function sortHeaderHtml(label, key, sort, extraAttrs) {
    const isSorted = sort && sort.key === key;
    const dir = isSorted ? sort.dir : null;
    return `<th class="is-sortable ${isSorted ? "is-sorted" : ""}" data-sort-key="${key}" ${extraAttrs || ""}>
      <span class="th-inner">${label}
        <span class="sort-icon" style="${dir === "asc" ? "transform:rotate(180deg)" : ""}">${Icons.icon("chevron-down", { size: 12 })}</span>
      </span>
    </th>`;
  }

  function paginationHtml(state) {
    const { page, totalPages, total, pageSize } = state;
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    const pages = [];
    const windowSize = 1;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) pages.push(p);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return `
      <div class="table-pagination">
        <span>Showing <strong>${start}–${end}</strong> of <strong>${total}</strong></span>
        <div class="pagination-controls">
          <button class="pagination-btn" data-page-action="prev" ${page <= 1 ? "disabled" : ""} aria-label="Previous page">${Icons.icon("chevron-left", { size: 14 })}</button>
          ${pages.map((p) => p === "…"
            ? `<span style="padding:0 4px;color:var(--text-tertiary)">…</span>`
            : `<button class="pagination-btn ${p === page ? "is-active" : ""}" data-page-num="${p}">${p}</button>`
          ).join("")}
          <button class="pagination-btn" data-page-action="next" ${page >= totalPages ? "disabled" : ""} aria-label="Next page">${Icons.icon("chevron-right", { size: 14 })}</button>
        </div>
      </div>
    `;
  }

  function bindPagination(container, state, onChange) {
    container.querySelectorAll("[data-page-num]").forEach((btn) => {
      btn.addEventListener("click", () => onChange(Number(btn.dataset.pageNum)));
    });
    const prev = container.querySelector('[data-page-action="prev"]');
    const next = container.querySelector('[data-page-action="next"]');
    if (prev) prev.addEventListener("click", () => onChange(Math.max(1, state.page - 1)));
    if (next) next.addEventListener("click", () => onChange(Math.min(state.totalPages, state.page + 1)));
  }

  function emptyStateHtml(opts) {
    return `
      <div class="empty-state">
        ${Icons.icon(opts.icon || "inbox", { size: 44 })}
        <div class="empty-state__title">${opts.title}</div>
        <div class="empty-state__desc">${opts.desc}</div>
      </div>
    `;
  }

  window.SentinelTable = { sortHeaderHtml, paginationHtml, bindPagination, emptyStateHtml };
})();
