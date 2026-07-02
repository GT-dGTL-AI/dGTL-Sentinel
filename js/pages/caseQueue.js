/**
 * dGTL Sentinel — Case Queue. BRD §8.2.
 */
(function () {
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;
  const Badge = window.SentinelBadge;
  const Icons = window.SentinelIcons;
  const Tbl = window.SentinelTable;
  const Dom = window.SentinelDom;

  const state = {
    search: "", status: "all", category: "all", riskScore: "all", analystId: "all", scenarioId: "all",
    sortKey: "dateFlagged", sortDir: "desc", page: 1, pageSize: 10, selected: new Set(),
  };

  const STATUSES = ["New", "In Review", "Escalated", "Closed"];
  const CATEGORIES = ["Behavioural Anomaly", "Access Anomaly", "Structuring Pattern"];

  function filtersToolbar() {
    const scenarios = Data.getScenarioDefs();
    const analysts = Data.getAnalysts().filter((a) => a.role !== "Business Admin");
    return `
      <div class="table-toolbar queue-filters">
        <div class="table-toolbar__search">
          ${Icons.icon("search", { size: 16 })}
          <input type="text" id="cq-search" placeholder="Search case ID, policyholder, policy number…" />
        </div>
        <select class="filter-select" id="cq-status">
          <option value="all">All statuses</option>
          ${STATUSES.map((s) => `<option value="${s}">${s}</option>`).join("")}
        </select>
        <select class="filter-select" id="cq-risk">
          <option value="all">All risk scores</option>
          ${[5, 4, 3, 2, 1].map((s) => `<option value="${s}">${s} — ${window.SentinelRisk.band(s).label}</option>`).join("")}
        </select>
        <select class="filter-select" id="cq-category">
          <option value="all">All categories</option>
          ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
        <select class="filter-select" id="cq-scenario">
          <option value="all">All scenarios</option>
          ${scenarios.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}
        </select>
        <select class="filter-select" id="cq-analyst">
          <option value="all">All analysts</option>
          <option value="unassigned">Unassigned</option>
          ${analysts.map((a) => `<option value="${a.id}">${a.name}</option>`).join("")}
        </select>
        <button class="filter-reset" id="cq-reset">Reset filters</button>
      </div>
    `;
  }

  function rowHtml(c) {
    const ph = Data.getPolicyholder(c.policyholderId);
    const analyst = c.assignedAnalystId ? Data.getAnalyst(c.assignedAnalystId) : null;
    const checked = state.selected.has(c.id);
    return `
      <tr class="is-clickable" data-row-case="${c.id}">
        <td class="is-checkbox" data-no-nav="1"><input type="checkbox" data-select-case="${c.id}" ${checked ? "checked" : ""} aria-label="Select ${c.id}" /></td>
        <td>${Badge.riskPill(c.riskScore)}</td>
        <td><span class="cell-primary mono">${c.id}</span></td>
        <td class="col-policyholder">
          <div class="cell-stack">
            <span class="cell-primary">${Fmt.maskName(ph.name)}</span>
            <span class="cell-secondary">${ph.policyNumber} · ${ph.productType.name}</span>
          </div>
        </td>
        <td class="col-scenario">
          <div class="cell-stack">
            <span>${Badge.categoryBadge(c.category)}</span>
            <span class="cell-secondary">${c.scenarioLabels.join(", ")}</span>
          </div>
        </td>
        <td>
          <div class="cell-stack">
            <span>${Fmt.formatDate(c.dateFlagged)}</span>
            <span class="cell-secondary">${Fmt.timeAgo(c.dateFlagged)}</span>
          </div>
        </td>
        <td>${Badge.statusBadge(c.status)}</td>
        <td>
          ${analyst ? `
            <div class="flex items-center gap-2">
              <span class="avatar avatar--sm">${analyst.initials}</span>
              <span class="cell-secondary" style="color:var(--text-primary);">${analyst.name}</span>
            </div>
          ` : `<span class="badge badge--neutral">Unassigned</span>`}
        </td>
      </tr>
    `;
  }

  function bulkBarHtml() {
    if (state.selected.size === 0) return "";
    return `
      <div class="bulk-bar">
        <span>${state.selected.size} case${state.selected.size > 1 ? "s" : ""} selected</span>
        <button class="btn btn--primary btn--sm" id="cq-bulk-assign">${Icons.icon("user-check", { size: 14 })} Assign to analyst</button>
        <button class="btn btn--ghost btn--sm" id="cq-clear-selection">Clear selection</button>
      </div>
    `;
  }

  function openBulkAssignModal() {
    const analysts = Data.getAnalysts().filter((a) => a.role !== "Business Admin" && a.status === "Active");
    const workload = Object.fromEntries(Data.getAnalystWorkload().map((w) => [w.analyst.id, w.openCount]));
    let picked = null;

    const modal = window.SentinelModal.open({
      title: `Assign ${state.selected.size} case${state.selected.size > 1 ? "s" : ""}`,
      bodyHtml: `
        <p class="form-hint" style="margin-bottom:12px;">Select an analyst to route the selected cases to. This updates the queue immediately.</p>
        <div class="analyst-pick-list">
          ${analysts.map((a) => `
            <div class="analyst-pick-item" data-pick-analyst="${a.id}">
              <span class="avatar avatar--sm">${a.initials}</span>
              <div class="analyst-pick-item__meta">
                <div class="analyst-pick-item__name">${a.name}</div>
                <div class="analyst-pick-item__role">${a.role}</div>
              </div>
              <div class="analyst-pick-item__load">${workload[a.id] || 0} open</div>
            </div>
          `).join("")}
        </div>
      `,
      footerButtons: [
        { label: "Cancel", variant: "ghost" },
        {
          label: "Confirm assignment", variant: "primary", close: true,
          onClick: () => {
            if (!picked) return;
            const analyst = Data.getAnalyst(picked);
            Data.bulkAssignCases(Array.from(state.selected), picked, Data.getCurrentUser().name);
            window.SentinelToast.success("Cases assigned", `${state.selected.size} case(s) routed to ${analyst.name}`);
            state.selected.clear();
            refreshResults();
          },
        },
      ],
    });

    modal.querySelectorAll("[data-pick-analyst]").forEach((el) => {
      el.addEventListener("click", () => {
        picked = el.dataset.pickAnalyst;
        modal.querySelectorAll("[data-pick-analyst]").forEach((n) => n.classList.remove("is-selected"));
        el.classList.add("is-selected");
      });
    });
  }

  function refreshResults() {
    const result = Data.getCases(state);
    const resultsRoot = document.getElementById("cq-results");

    resultsRoot.innerHTML = `
      <div id="cq-bulk-bar">${bulkBarHtml()}</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th class="is-checkbox"><input type="checkbox" id="cq-select-all" aria-label="Select all on page" /></th>
            ${Tbl.sortHeaderHtml("Risk", "riskScore", state)}
            <th>Case ID</th>
            ${Tbl.sortHeaderHtml("Policyholder", "policyholder", state)}
            <th>Scenario / Category</th>
            ${Tbl.sortHeaderHtml("Date Flagged", "dateFlagged", state)}
            ${Tbl.sortHeaderHtml("Status", "status", state)}
            ${Tbl.sortHeaderHtml("Analyst", "analyst", state)}
          </tr></thead>
          <tbody id="cq-tbody">
            ${result.rows.length ? result.rows.map(rowHtml).join("") : `<tr><td colspan="8">${Tbl.emptyStateHtml({ icon: "inbox", title: "No cases match these filters", desc: "Try adjusting or resetting your filters to see more results." })}</td></tr>`}
          </tbody>
        </table>
      </div>
      <div id="cq-pagination">${Tbl.paginationHtml(result)}</div>
    `;

    // Row navigation
    resultsRoot.querySelectorAll("[data-row-case]").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest("[data-no-nav]")) return;
        window.location.href = `case-detail.html?id=${row.dataset.rowCase}`;
      });
    });

    // Checkboxes
    resultsRoot.querySelectorAll("[data-select-case]").forEach((cb) => {
      cb.addEventListener("click", (e) => e.stopPropagation());
      cb.addEventListener("change", () => {
        const id = cb.dataset.selectCase;
        cb.checked ? state.selected.add(id) : state.selected.delete(id);
        document.getElementById("cq-bulk-bar").innerHTML = bulkBarHtml();
        bindBulkBar();
      });
    });
    const selectAll = document.getElementById("cq-select-all");
    const pageIds = result.rows.map((r) => r.id);
    selectAll.checked = pageIds.length > 0 && pageIds.every((id) => state.selected.has(id));
    selectAll.addEventListener("change", () => {
      pageIds.forEach((id) => (selectAll.checked ? state.selected.add(id) : state.selected.delete(id)));
      refreshResults();
    });

    // Sort headers
    resultsRoot.querySelectorAll("[data-sort-key]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.sortKey;
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortKey = key; state.sortDir = "asc"; }
        refreshResults();
      });
    });

    Tbl.bindPagination(document.getElementById("cq-pagination"), result, (page) => {
      state.page = page;
      refreshResults();
    });

    bindBulkBar();
  }

  function bindBulkBar() {
    const assignBtn = document.getElementById("cq-bulk-assign");
    const clearBtn = document.getElementById("cq-clear-selection");
    if (assignBtn) assignBtn.addEventListener("click", openBulkAssignModal);
    if (clearBtn) clearBtn.addEventListener("click", () => { state.selected.clear(); refreshResults(); });
  }

  function bindToolbar() {
    const searchInput = document.getElementById("cq-search");
    searchInput.value = state.search;
    searchInput.addEventListener("input", Dom.debounce((e) => {
      state.search = e.target.value; state.page = 1; refreshResults();
    }, 220));

    [["cq-status", "status"], ["cq-risk", "riskScore"], ["cq-category", "category"], ["cq-scenario", "scenarioId"], ["cq-analyst", "analystId"]].forEach(([id, key]) => {
      const el = document.getElementById(id);
      el.value = state[key];
      el.addEventListener("change", () => { state[key] = el.value; state.page = 1; refreshResults(); });
    });

    document.getElementById("cq-reset").addEventListener("click", () => {
      Object.assign(state, { search: "", status: "all", category: "all", riskScore: "all", analystId: "all", scenarioId: "all", page: 1 });
      render(document.getElementById("page-root"));
    });
  }

  function render(root) {
    const openCount = Data.getAllCases().filter((c) => c.status !== "Closed").length;
    root.innerHTML = `
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-header__title">Case Queue</h1>
          <p class="page-header__subtitle">${openCount} open case${openCount === 1 ? "" : "s"} across all analysts and severity bands</p>
        </div>
      </div>
      <div class="card animate-fade-up">
        ${filtersToolbar()}
        <div id="cq-results"></div>
      </div>
    `;
    bindToolbar();
    refreshResults();
  }

  window.SentinelPages = window.SentinelPages || {};
  window.SentinelPages.caseQueue = { render };
})();
