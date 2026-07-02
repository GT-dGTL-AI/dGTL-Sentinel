/**
 * dGTL Sentinel — application shell (persistent sidebar + top navigation).
 * Rendered once per page load into #app, with the active page's own
 * content mounted into the #page-root placeholder it creates.
 */
(function () {
  const Icons = window.SentinelIcons;
  const Store = window.SentinelStore;
  const Fmt = window.SentinelFormat;

  const NAV_SECTIONS = [
    {
      label: "Overview",
      items: [{ key: "dashboard", label: "Command Centre", href: "dashboard.html", icon: "grid" }],
    },
    {
      label: "Investigation",
      items: [{ key: "case-queue", label: "Case Queue", href: "case-queue.html", icon: "inbox" }],
    },
    {
      label: "Insights",
      items: [{ key: "analytics", label: "Analytics", href: "analytics.html", icon: "bar-chart" }],
    },
    {
      label: "Administration",
      items: [{ key: "configuration", label: "Configuration", href: "configuration.html", icon: "settings", adminOnly: true }],
    },
  ];

  function shellSkeleton() {
    return `
      <div class="app-shell" id="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar__brand">
            <div class="sidebar__brand-mark">${Icons.icon("shield-check", { size: 18 })}</div>
            <div class="sidebar__brand-text">
              <span class="sidebar__brand-name">dGTL Sentinel</span>
              <span class="sidebar__brand-tag">Risk Intelligence</span>
            </div>
          </div>
          <nav class="sidebar__nav" id="sidebar-nav" aria-label="Primary"></nav>
          <div class="sidebar__footer">
            <button class="sidebar__collapse-btn" id="collapse-btn">
              ${Icons.icon("chevrons-left", { size: 17 })}
              <span class="sidebar__footer-text">Collapse</span>
            </button>
          </div>
        </aside>
        <div class="app-main">
          <header class="topbar">
            <button class="icon-btn topbar__mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">${Icons.icon("menu", { size: 20 })}</button>
            <div class="topbar__search relative" id="global-search-wrap">
              ${Icons.icon("search", { size: 17 })}
              <input type="text" id="global-search" placeholder="Search cases, policyholders, policy numbers…" autocomplete="off" aria-label="Global search" />
              <span class="topbar__search-kbd">/</span>
              <div class="dropdown-panel" id="search-results" style="display:none; min-width:100%;"></div>
            </div>
            <div class="topbar__actions">
              <div class="relative">
                <button class="icon-btn" id="notif-btn" aria-label="Notifications">
                  ${Icons.icon("bell", { size: 19 })}
                  <span class="icon-btn__dot" id="notif-dot" style="display:none;"></span>
                </button>
                <div class="dropdown-panel" id="notif-panel" style="display:none;"></div>
              </div>
              <div class="relative">
                <button class="topbar__profile" id="profile-btn">
                  <span class="avatar" id="profile-avatar"></span>
                  <span class="topbar__profile-meta">
                    <span class="topbar__profile-name" id="profile-name"></span>
                    <span class="topbar__profile-role" id="profile-role"></span>
                  </span>
                  ${Icons.icon("chevron-down", { size: 14 })}
                </button>
                <div class="dropdown-panel" id="profile-panel" style="display:none;"></div>
              </div>
            </div>
          </header>
          <main class="page-content" id="page-root"></main>
        </div>
      </div>
    `;
  }

  function renderNav(activeKey, isAdmin) {
    return NAV_SECTIONS.map((section) => `
      <div class="nav-section">
        <div class="nav-section__label">${section.label}</div>
        ${section.items.filter((i) => !i.adminOnly || isAdmin).map((item) => `
          <a class="nav-item ${item.key === activeKey ? "is-active" : ""}" href="${item.href}">
            ${Icons.icon(item.icon, { size: 19 })}
            <span class="nav-item__label">${item.label}</span>
          </a>
        `).join("")}
      </div>
    `).join("");
  }

  function closeAllPanels() {
    document.querySelectorAll(".dropdown-panel").forEach((p) => (p.style.display = "none"));
  }

  function renderNotifPanel() {
    const N = window.SentinelNotifications;
    const items = N.getAll();
    const panel = document.getElementById("notif-panel");
    panel.innerHTML = `
      <div class="dropdown-panel__header">
        <span class="dropdown-panel__title">Notifications</span>
        <button class="dropdown-panel__link" id="notif-mark-all">Mark all read</button>
      </div>
      <div class="dropdown-panel__body">
        ${items.length ? items.map((n) => `
          <a href="case-detail.html?id=${n.caseId}" class="nav-item" style="color:var(--text-primary); border-radius:0; padding:12px 20px; margin:0; align-items:flex-start; ${n.read ? "opacity:.55;" : ""}" data-notif-id="${n.id}">
            <span style="color:var(--${N.COLORS[n.type]});flex-shrink:0;margin-top:1px;">${Icons.icon(N.ICONS[n.type], { size: 17 })}</span>
            <span style="display:flex;flex-direction:column;gap:2px;white-space:normal;">
              <span style="font-weight:600;font-size:13px;">${n.title}</span>
              <span style="font-size:12px;color:var(--text-secondary);">${n.message}</span>
              <span style="font-size:11px;color:var(--text-tertiary);">${Fmt.timeAgo(n.timestamp)}</span>
            </span>
          </a>
        `).join("") : window.SentinelTable.emptyStateHtml({ icon: "bell", title: "You're all caught up", desc: "No new notifications right now." })}
      </div>
    `;
    const markAll = document.getElementById("notif-mark-all");
    if (markAll) markAll.addEventListener("click", (e) => {
      e.preventDefault();
      N.markAllRead();
      renderNotifPanel();
      updateNotifDot();
    });
    panel.querySelectorAll("[data-notif-id]").forEach((el) => {
      el.addEventListener("click", () => N.markRead(el.dataset.notifId));
    });
  }

  function updateNotifDot() {
    const dot = document.getElementById("notif-dot");
    const count = window.SentinelNotifications.getUnreadCount();
    dot.style.display = count > 0 ? "block" : "none";
  }

  function renderProfilePanel(currentUser) {
    const Data = window.SentinelData;
    const roles = ["Risk Analyst", "Senior Reviewer", "Business Admin"];
    const panel = document.getElementById("profile-panel");
    panel.innerHTML = `
      <div class="dropdown-panel__header">
        <span class="dropdown-panel__title">${currentUser.name}</span>
      </div>
      <div class="dropdown-panel__body" style="padding: 12px 16px;">
        <div class="form-label" style="margin-bottom:8px;">View demo as</div>
        <div class="pill-toggle-group" style="margin-bottom: 4px;">
          ${roles.map((r) => `<button class="pill-toggle ${currentUser.role === r ? "is-active" : ""}" data-persona-role="${r}">${r}</button>`).join("")}
        </div>
        <p class="form-hint">Switches the signed-in persona for role-based UI (Analyst / Reviewer / Admin), per BRD §4.</p>
      </div>
      <div class="dropdown-panel__footer">
        <button class="btn btn--ghost btn--block" id="logout-btn">${Icons.icon("log-out", { size: 15 })} End demo session</button>
      </div>
    `;
    panel.querySelectorAll("[data-persona-role]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const role = btn.dataset.personaRole;
        const candidate = Data.getAnalysts().find((a) => a.role === role);
        if (candidate) {
          Data.setCurrentUser(candidate.id);
          window.SentinelToast.info("Persona switched", `Now viewing as ${candidate.name} (${role})`);
          setTimeout(() => window.location.reload(), 500);
        }
      });
    });
    document.getElementById("logout-btn").addEventListener("click", () => {
      window.SentinelToast.info("Demo session ended", "This is a simulated sign-out — no data was changed.");
    });
  }

  function wireSearch() {
    const Data = window.SentinelData;
    const input = document.getElementById("global-search");
    const results = document.getElementById("search-results");
    const dom = window.SentinelDom;

    const runSearch = dom.debounce((q) => {
      if (!q.trim()) { results.style.display = "none"; return; }
      const { rows } = Data.getCases({ search: q, page: 1, pageSize: 8 });
      results.style.display = "block";
      if (!rows.length) {
        results.innerHTML = `<div class="dropdown-panel__body">${window.SentinelTable.emptyStateHtml({ icon: "search", title: "No matches", desc: `Nothing found for "${Fmt.escapeHtml(q)}"` })}</div>`;
        return;
      }
      results.innerHTML = `
        <div class="dropdown-panel__header"><span class="dropdown-panel__title">Cases matching "${Fmt.escapeHtml(q)}"</span></div>
        <div class="dropdown-panel__body">
          ${rows.map((c) => {
            const ph = Data.getPolicyholder(c.policyholderId);
            return `<a href="case-detail.html?id=${c.id}" class="nav-item" style="color:var(--text-primary);border-radius:0;padding:12px 20px;margin:0;">
              ${window.SentinelBadge.riskPill(c.riskScore)}
              <span style="display:flex;flex-direction:column;gap:1px;">
                <span style="font-weight:600;font-size:13px;">${Fmt.maskName(ph.name)} · ${c.id}</span>
                <span style="font-size:11.5px;color:var(--text-tertiary);">${c.category} · ${c.status}</span>
              </span>
            </a>`;
          }).join("")}
        </div>
      `;
    }, 180);

    input.addEventListener("input", (e) => runSearch(e.target.value));
    input.addEventListener("focus", (e) => { if (e.target.value.trim()) results.style.display = "block"; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    });
  }

  function initInteractions(activeKey) {
    const Data = window.SentinelData;
    const shellEl = document.getElementById("app-shell");

    // Collapse
    const collapsed = Store.get("sidebar_collapsed", false);
    if (collapsed) shellEl.classList.add("is-collapsed");
    document.getElementById("collapse-btn").addEventListener("click", () => {
      const next = !shellEl.classList.contains("is-collapsed");
      shellEl.classList.toggle("is-collapsed", next);
      Store.set("sidebar_collapsed", next);
    });

    // Mobile toggle
    document.getElementById("mobile-toggle").addEventListener("click", () => {
      shellEl.classList.toggle("is-mobile-open");
    });

    // Profile
    const currentUser = Data.getCurrentUser();
    document.getElementById("profile-avatar").textContent = currentUser.initials || Fmt.initials(currentUser.name);
    document.getElementById("profile-name").textContent = currentUser.name;
    document.getElementById("profile-role").textContent = currentUser.role;
    renderProfilePanel(currentUser);

    document.getElementById("profile-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const panel = document.getElementById("profile-panel");
      const isOpen = panel.style.display === "block";
      closeAllPanels();
      panel.style.display = isOpen ? "none" : "block";
    });

    // Notifications
    renderNotifPanel();
    updateNotifDot();
    document.getElementById("notif-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const panel = document.getElementById("notif-panel");
      const isOpen = panel.style.display === "block";
      closeAllPanels();
      panel.style.display = isOpen ? "none" : "block";
      if (!isOpen) renderNotifPanel();
    });
    Store.bus.on("notifications:changed", updateNotifDot);

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown-panel") && !e.target.closest("#notif-btn") && !e.target.closest("#profile-btn")) {
        closeAllPanels();
      }
      if (!e.target.closest("#global-search-wrap")) {
        document.getElementById("search-results").style.display = "none";
      }
    });

    wireSearch();

    document.getElementById("sidebar-nav").innerHTML = renderNav(activeKey, currentUser.role === "Business Admin");
  }

  /** mountApp(activePageKey, renderPageFn) — single entry point used by every page. */
  function mountApp(activePageKey, renderPageFn) {
    window.SentinelData.ensureLoaded();
    const appRoot = document.getElementById("app");
    appRoot.innerHTML = shellSkeleton();
    initInteractions(activePageKey);
    const pageRoot = document.getElementById("page-root");
    renderPageFn(pageRoot);
  }

  window.SentinelShell = { mountApp };
})();
