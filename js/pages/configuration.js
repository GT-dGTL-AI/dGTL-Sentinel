/**
 * dGTL Sentinel — Configuration (Admin). BRD §8.7.
 */
(function () {
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;
  const Icons = window.SentinelIcons;
  const Dom = window.SentinelDom;

  let isAdmin = false;

  function formatThreshold(rule, value) {
    if (rule.unit.startsWith("₹")) return Fmt.formatCurrency(value) + " ceiling";
    return `${value}${rule.unit.replace("%", "%").replace("x normal frequency", "x")}`;
  }

  function ruleCardHtml(rule) {
    return `
      <div class="rule-card ${rule.enabled ? "" : "is-disabled"}" data-rule-id="${rule.id}">
        <div class="rule-card__top">
          <div>
            <div class="rule-card__title">${rule.label} <span class="badge badge--outline" style="margin-left:6px;">${rule.category}</span></div>
            <div class="rule-card__desc">${rule.description}</div>
          </div>
          <label class="switch">
            <input type="checkbox" data-rule-toggle="${rule.id}" ${rule.enabled ? "checked" : ""} ${isAdmin ? "" : "disabled"} />
            <span class="switch__track"></span>
          </label>
        </div>
        <div class="rule-card__threshold">
          <span class="text-tertiary" style="font-size:12px;white-space:nowrap;">Threshold</span>
          <input type="range" min="${rule.min}" max="${rule.max}" step="${rule.step}" value="${rule.threshold}"
            data-rule-slider="${rule.id}" ${isAdmin && rule.enabled ? "" : "disabled"} />
          <span class="rule-card__threshold-value" data-rule-value="${rule.id}">${formatThreshold(rule, rule.threshold)}</span>
        </div>
      </div>
    `;
  }

  function renderRulesTab() {
    const rules = Data.getRuleConfig();
    return `
      <div class="card__body">
        ${rules.map(ruleCardHtml).join("")}
      </div>
    `;
  }

  function roleOptionsHtml(selected) {
    return ["Risk Analyst", "Senior Reviewer", "Business Admin"].map((r) => `<option value="${r}" ${r === selected ? "selected" : ""}>${r}</option>`).join("");
  }

  function rosterRowHtml(a) {
    return `
      <div class="roster-row">
        <span class="flex items-center gap-2">
          <span class="avatar avatar--sm">${a.initials || Fmt.initials(a.name)}</span>
          <span class="cell-stack"><span class="cell-primary">${a.name}</span><span class="cell-secondary">${a.email}</span></span>
        </span>
        <select class="form-select" data-role-select="${a.id}" ${isAdmin ? "" : "disabled"}>${roleOptionsHtml(a.role)}</select>
        <span>
          <select class="form-select" data-status-select="${a.id}" ${isAdmin ? "" : "disabled"}>
            <option value="Active" ${a.status === "Active" ? "selected" : ""}>Active</option>
            <option value="On Leave" ${a.status === "On Leave" ? "selected" : ""}>On Leave</option>
          </select>
        </span>
        <span class="text-tertiary">${Fmt.formatDate(a.joinedDate)}</span>
        <span></span>
      </div>
    `;
  }

  function renderRosterTab() {
    const analysts = Data.getAnalysts();
    return `
      <div class="card__header">
        <div><div class="card__title">Analyst Roster</div><div class="card__subtitle">${analysts.length} team members</div></div>
        <button class="btn btn--primary btn--sm" id="add-analyst-btn" ${isAdmin ? "" : "disabled"}>${Icons.icon("plus", { size: 14 })} Add Analyst</button>
      </div>
      <div id="roster-list">
        <div class="roster-row roster-row--head"><span>Name</span><span>Role</span><span>Status</span><span>Joined</span><span></span></div>
        ${analysts.map(rosterRowHtml).join("")}
      </div>
    `;
  }

  function openAddAnalystModal() {
    const modal = window.SentinelModal.open({
      title: "Add Analyst",
      bodyHtml: `
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="new-analyst-name" placeholder="e.g. Priya Nair" /></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-select" id="new-analyst-role">${roleOptionsHtml("Risk Analyst")}</select>
        </div>
        <div class="form-group"><label class="form-label">Email (optional)</label><input class="form-input" id="new-analyst-email" placeholder="auto-generated if left blank" /></div>
      `,
      footerButtons: [
        { label: "Cancel", variant: "ghost" },
        {
          label: "Add Analyst", variant: "primary", close: true,
          onClick: () => {
            const name = document.getElementById("new-analyst-name").value.trim();
            const role = document.getElementById("new-analyst-role").value;
            const email = document.getElementById("new-analyst-email").value.trim();
            if (!name) { window.SentinelToast.error("Name is required"); return; }
            Data.addAnalyst({ name, role, email });
            window.SentinelToast.success("Analyst added", `${name} · ${role}`);
            renderRoster();
          },
        },
      ],
    });
    modal.querySelector("#new-analyst-name").focus();
  }

  function bindRules() {
    document.querySelectorAll("[data-rule-toggle]").forEach((el) => {
      el.addEventListener("change", () => {
        Data.toggleRule(el.dataset.ruleToggle, el.checked);
        window.SentinelToast.info(el.checked ? "Rule enabled" : "Rule disabled", el.closest(".rule-card").querySelector(".rule-card__title").textContent);
        renderRules();
      });
    });
    document.querySelectorAll("[data-rule-slider]").forEach((el) => {
      const valueEl = document.querySelector(`[data-rule-value="${el.dataset.ruleSlider}"]`);
      const rules = Data.getRuleConfig();
      const rule = rules.find((r) => r.id === el.dataset.ruleSlider);
      el.addEventListener("input", () => { valueEl.textContent = formatThreshold(rule, Number(el.value)); });
      el.addEventListener("change", Dom.debounce(() => {
        Data.updateRuleThreshold(el.dataset.ruleSlider, Number(el.value));
        window.SentinelToast.success("Threshold updated", formatThreshold(rule, Number(el.value)));
      }, 150));
    });
  }

  function bindRoster() {
    document.querySelectorAll("[data-role-select]").forEach((el) => {
      el.addEventListener("change", () => {
        Data.updateAnalystRole(el.dataset.roleSelect, el.value);
        window.SentinelToast.success("Role updated");
      });
    });
    document.querySelectorAll("[data-status-select]").forEach((el) => {
      el.addEventListener("change", () => {
        Data.setAnalystStatus(el.dataset.statusSelect, el.value);
        window.SentinelToast.success("Status updated");
      });
    });
    const addBtn = document.getElementById("add-analyst-btn");
    if (addBtn) addBtn.addEventListener("click", openAddAnalystModal);
  }

  function renderRules() {
    document.getElementById("tab-panel-rules").innerHTML = renderRulesTab();
    bindRules();
  }
  function renderRoster() {
    document.getElementById("tab-panel-roster").innerHTML = renderRosterTab();
    bindRoster();
  }

  function bindTabs() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("is-active"));
        document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
        btn.classList.add("is-active");
        document.getElementById(btn.dataset.tabTarget).classList.add("is-active");
      });
    });
  }

  function render(root) {
    const currentUser = Data.getCurrentUser();
    isAdmin = currentUser.role === "Business Admin";

    root.innerHTML = `
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-header__title">Configuration</h1>
          <p class="page-header__subtitle">Detection rule thresholds and analyst roster management</p>
        </div>
      </div>
      ${!isAdmin ? `
        <div class="card animate-fade-up" style="margin-bottom:var(--space-5); border-color:var(--warning); background:var(--warning-bg);">
          <div class="card__body" style="display:flex; align-items:center; gap:10px; padding:14px 20px;">
            ${Icons.icon("lock", { size: 16 })}
            <span style="font-size:13px; color:var(--slate-800);">Viewing as <strong>${currentUser.role}</strong> — configuration is read-only. Switch persona to <strong>Business Admin</strong> from your profile menu to edit.</span>
          </div>
        </div>
      ` : ""}
      <div class="card animate-fade-up">
        <div class="tabs" style="padding: 0 var(--space-6);">
          <button class="tab-btn is-active" data-tab-target="tab-panel-rules">Detection Rules</button>
          <button class="tab-btn" data-tab-target="tab-panel-roster">Analyst Roster</button>
        </div>
        <div class="tab-panel is-active" id="tab-panel-rules"></div>
        <div class="tab-panel" id="tab-panel-roster"></div>
      </div>
    `;

    bindTabs();
    renderRules();
    renderRoster();
  }

  window.SentinelPages = window.SentinelPages || {};
  window.SentinelPages.configuration = { render };
})();
