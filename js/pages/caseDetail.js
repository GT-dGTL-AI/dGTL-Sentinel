/**
 * dGTL Sentinel — Case Detail View + AI Insights + Analyst Workbench.
 * BRD §8.3, §8.4, §8.5.
 */
(function () {
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;
  const Badge = window.SentinelBadge;
  const Icons = window.SentinelIcons;
  const Risk = window.SentinelRisk;
  const AI = window.SentinelAI;
  const Tbl = window.SentinelTable;

  let caseId = null;
  let streamController = null;

  function getIdFromUrl() { return new URLSearchParams(window.location.search).get("id"); }

  function dayPartOf(iso) {
    const h = new Date(iso).getHours();
    if (h >= 5 && h < 12) return "Morning";
    if (h >= 12 && h < 17) return "Afternoon";
    if (h >= 17 && h < 22) return "Evening";
    return "Night";
  }

  // ---------------------------------------------------------------------
  // Section renderers
  // ---------------------------------------------------------------------
  function headerHtml(full) {
    const { case: c, policyholder } = full;
    return `
      <a href="case-queue.html" class="case-detail-back">${Icons.icon("arrow-left", { size: 15 })} Back to Case Queue</a>
      <div class="page-header">
        <div>
          <h1 class="page-header__title">${Fmt.maskName(policyholder.name)} <span class="text-tertiary mono" style="font-size:1rem;font-weight:500;">${c.id}</span></h1>
          <p class="page-header__subtitle">${policyholder.productType.name} · Flagged ${Fmt.formatDateTime(c.dateFlagged)} · Routing: ${c.routing}</p>
        </div>
        <div class="page-header__actions">
          ${Badge.riskBadge(c.riskScore)}
          ${Badge.statusBadge(c.status)}
          ${Badge.categoryBadge(c.category)}
        </div>
      </div>
    `;
  }

  function policyholderSummaryHtml(full) {
    const { policyholder: ph, account, accountTransactions } = full;
    const total = accountTransactions.length;
    const avgAmt = total ? Math.round(accountTransactions.reduce((s, t) => s + t.amount, 0) / total) : 0;
    const field = (label, value) => `<div><div class="profile-field__label">${label}</div><div class="profile-field__value">${value}</div></div>`;
    return `
      <div class="card__header">
        <div><div class="card__title">Policyholder Summary</div><div class="card__subtitle">Masked PII · tenure and product context</div></div>
      </div>
      <div class="card__body">
        <div class="profile-grid">
          ${field("Policyholder", Fmt.maskName(ph.name))}
          ${field("Policy Number", ph.policyNumber)}
          ${field("Product", `${ph.productType.name} <span class="text-tertiary">(${ph.productType.category})</span>`)}
          ${field("Tenure", `${ph.tenureYears} years`)}
          ${field("Age", `${ph.age} yrs · ${ph.gender === "F" ? "Female" : "Male"}`)}
          ${field("Risk Profile", `<span class="badge badge--outline">${ph.riskProfile}</span>`)}
          ${field("Home Location", `${ph.homeCity}, ${ph.homeState}`)}
          ${field("Sum Assured", `₹${ph.sumAssuredLakh}L`)}
          ${field("Nominee", ph.nominee)}
        </div>
        <hr class="divider" />
        <div class="profile-grid">
          ${field("Account Opened", Fmt.formatDate(account.openDate))}
          ${field("Total Recorded Transactions", total)}
          ${field("Avg. Transaction Value", Fmt.formatCurrency(avgAmt))}
          ${field("Usual Channel", account.baseline.usualChannel)}
          ${field("Typical Activity Window", account.baseline.usualDayPart)}
          ${field("Typical Frequency", `~${account.baseline.avgTransactionsPerYear}/year`)}
        </div>
      </div>
    `;
  }

  function timelineHtml(full) {
    const items = full.accountTransactions.slice(0, 5).slice().reverse();
    return `
      <div class="card__header">
        <div><div class="card__title">Activity Timeline</div><div class="card__subtitle">Triggering transaction in context of recent account activity</div></div>
      </div>
      <div class="card__body">
        <div class="timeline">
          ${items.map((t) => {
            const isFlagged = t.id === full.transaction.id;
            return `
              <div class="timeline-item ${isFlagged ? "is-flagged" : ""}">
                <span class="timeline-item__dot">${Icons.icon(isFlagged ? "alert-triangle" : "activity", { size: 11 })}</span>
                <div class="timeline-item__time">${Fmt.formatDateTime(t.timestamp)}</div>
                <div class="timeline-item__title">${t.type} — ${Fmt.formatCurrency(t.amount)} ${isFlagged ? "· Triggering Event" : ""}</div>
                <div class="timeline-item__desc">${t.channel} · ${t.device} · ${t.city}, ${t.state}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  function comparisonHtml(full) {
    const { account, transaction: t } = full;
    const b = account.baseline;
    const amountDiffPct = Math.round(((t.amount - b.avgWithdrawalAmount) / b.avgWithdrawalAmount) * 100);
    const amountIsDiff = Math.abs(amountDiffPct) >= 20;
    const channelDiff = t.channel !== b.usualChannel;
    const dayPart = dayPartOf(t.timestamp);
    const dayPartDiff = dayPart !== b.usualDayPart;
    const destDiff = t.destinationLast4 !== b.usualDestinationLast4;

    const row = (label, baseline, flagged, isDiff) => `
      <div class="compare-row">
        <span class="compare-row__label">${label}</span>
        <span class="compare-row__value">${baseline}</span>
        <span class="compare-row__value ${isDiff ? "is-diff" : ""}">${flagged}${isDiff ? " " + Icons.icon("alert-triangle", { size: 12 }) : ""}</span>
      </div>
    `;

    return `
      <div class="card__header">
        <div><div class="card__title">Baseline vs. Flagged Transaction</div><div class="card__subtitle">Side-by-side comparison against established behavioural pattern</div></div>
      </div>
      <div class="card__body">
        <div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:0 var(--space-3);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-tertiary);font-weight:600;padding-bottom:10px;border-bottom:1px solid var(--border-default);margin-bottom:6px;">
          <span></span><span>Historical Baseline</span><span>Flagged Transaction</span>
        </div>
        ${row("Amount", Fmt.formatCurrency(b.avgWithdrawalAmount) + " avg", Fmt.formatCurrency(t.amount) + ` (${amountDiffPct > 0 ? "+" : ""}${amountDiffPct}%)`, amountIsDiff)}
        ${row("Channel", b.usualChannel, t.channel, channelDiff)}
        ${row("Time of Day", b.usualDayPart, dayPart, dayPartDiff)}
        ${row("Destination (last 4)", b.usualDestinationLast4, t.destinationLast4, destDiff)}
        ${row("Frequency", `~${b.avgTransactionsPerYear}/year`, `${full.accountTransactions.length} on record`, false)}
      </div>
    `;
  }

  function deviceHistoryHtml(full) {
    const { account, transaction: t } = full;
    const match = account.knownDevices.find((d) => d.ip === t.ip);
    return `
      <div class="card__header">
        <div><div class="card__title">Device &amp; IP History</div><div class="card__subtitle">Known access points vs. the flagged access event</div></div>
      </div>
      <div class="card__body--tight">
        <div class="device-row" style="font-size:11px;text-transform:uppercase;color:var(--text-tertiary);font-weight:600;">
          <span>Device</span><span>Location</span><span>Last Seen</span><span>Status</span>
        </div>
        ${account.knownDevices.map((d) => `
          <div class="device-row ${d.ip === t.ip ? "is-flagged" : ""}">
            <span class="flex items-center gap-2"><span class="device-row__icon">${Icons.icon("smartphone", { size: 15 })}</span>${d.device}</span>
            <span>${d.city}, ${d.state}</span>
            <span class="text-tertiary">${Fmt.timeAgo(d.lastSeen)}</span>
            <span>${d.ip === t.ip ? `<span class="badge badge--risk-5">Used in Alert</span>` : `<span class="badge badge--outline">Known</span>`}</span>
          </div>
        `).join("")}
        ${!match ? `
          <div class="device-row is-flagged">
            <span class="flex items-center gap-2"><span class="device-row__icon">${Icons.icon("globe", { size: 15 })}</span>${t.device}</span>
            <span>${t.city}, ${t.state}</span>
            <span class="text-tertiary">${Fmt.formatDateTime(t.timestamp)}</span>
            <span><span class="badge badge--risk-5">New / Unrecognised</span></span>
          </div>
        ` : ""}
      </div>
    `;
  }

  function riskBreakdownHtml(full) {
    const { case: c } = full;
    return `
      <div class="card__header"><div class="card__title">Composite Risk Score</div></div>
      <div class="card__body">
        <div class="flex items-center gap-4" style="margin-bottom:20px;">
          <span class="risk-pill risk-pill--${c.riskScore}" style="width:56px;height:56px;font-size:1.5rem;border-radius:var(--radius-lg);">${c.riskScore}</span>
          <div>
            <div style="font-weight:700;font-size:var(--text-md);">${Risk.band(c.riskScore).label}</div>
            <div class="text-secondary" style="font-size:12.5px;">${Risk.band(c.riskScore).description}</div>
          </div>
        </div>
        ${c.contributingFactors.map((f) => `
          <div class="factor-row">
            <div class="factor-row__top">
              <span class="factor-row__label">${f.scenario}</span>
              <span class="factor-row__pct">${f.weightPct}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${f.weightPct}%; background:${Risk.colorVar(c.riskScore)};"></div></div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function aiInsightsHtml() {
    return `
      <div class="card__header">
        <div class="flex items-center gap-3">
          <span class="ai-panel__badge">${Icons.icon("sparkles", { size: 13 })} AI Insights</span>
        </div>
        <button class="btn btn--secondary btn--sm" id="ai-regenerate">${Icons.icon("refresh-cw", { size: 14 })} Regenerate</button>
      </div>
      <div class="card__body">
        <div class="ai-summary-text" id="ai-summary-text"></div>
        <div class="ai-recommendation" id="ai-recommendation" style="display:none;">
          ${Icons.icon("zap", { size: 17 })}
          <div><div style="font-weight:600;font-size:13px;margin-bottom:2px;">Suggested Next-Best-Action</div><div id="ai-recommendation-text" style="font-size:13px;color:var(--text-secondary);"></div></div>
        </div>
        <div class="ai-confidence-row" id="ai-confidence-row" style="display:none;">
          <span class="text-secondary" style="font-size:12.5px;white-space:nowrap;">Confidence</span>
          <span class="ai-confidence-track progress-track"><span class="progress-fill" id="ai-confidence-fill" style="width:0%;background:var(--brand);"></span></span>
          <span id="ai-confidence-value" style="font-size:12.5px;font-weight:700;white-space:nowrap;"></span>
        </div>
        <div class="ai-meta-row">
          <span class="text-tertiary" style="font-size:11px;">Generated from curated scenario templates — no external model is called.</span>
          <span class="text-tertiary" style="font-size:11px;" id="ai-generated-at"></span>
        </div>
      </div>
    `;
  }

  function workbenchHtml(full) {
    const { case: c } = full;
    const analyst = full.analyst;
    const seniors = Data.getAnalysts().filter((a) => a.role === "Senior Reviewer");
    const isClosed = c.status === "Closed";
    const currentUser = Data.getCurrentUser();
    const dispositions = [
      { key: "Accommodate", icon: "check-circle", cls: "accommodate" },
      { key: "Escalate", icon: "trending-up", cls: "escalate" },
      { key: "Hold for Additional Information", icon: "pause-circle", cls: "hold" },
      { key: "Decline/Block", icon: "x-circle", cls: "decline" },
    ];
    return `
      <div class="card__header"><div class="card__title">Analyst Workbench</div></div>
      <div class="card__body">
        <div class="flex items-center justify-between" style="margin-bottom:16px;">
          <div>
            <div class="profile-field__label">Assigned To</div>
            <div class="profile-field__value">${analyst ? `${analyst.name} <span class="text-tertiary" style="font-weight:400;">(${analyst.role})</span>` : "Unassigned"}</div>
          </div>
          ${!analyst || analyst.id !== currentUser.id ? `<button class="btn btn--secondary btn--sm" id="assign-to-me">Assign to me</button>` : ""}
        </div>

        <div class="section-title">${Icons.icon("flag", { size: 16 })} Disposition</div>
        <div class="disposition-grid">
          ${dispositions.map((d) => `
            <button class="disposition-btn disposition-btn--${d.cls}" data-disposition="${d.key}" ${isClosed ? "disabled" : ""}>
              ${Icons.icon(d.icon, { size: 20 })}
              ${d.key}
            </button>
          `).join("")}
        </div>
        ${c.disposition ? `<div style="margin-bottom:16px;">${Badge.dispositionBadge(c.disposition)}</div>` : ""}

        <div class="section-title">${Icons.icon("user-check", { size: 16 })} Reassign to Senior Reviewer</div>
        <div class="flex gap-2" style="margin-bottom:20px;">
          <select class="form-select" id="reassign-select" style="flex:1;">
            ${seniors.map((s) => `<option value="${s.id}" ${analyst && analyst.id === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
          </select>
          <button class="btn btn--secondary" id="reassign-btn">Reassign</button>
        </div>

        <div class="section-title">${Icons.icon("message-square", { size: 16 })} Notes</div>
        <div id="notes-list" style="margin-bottom:12px;max-height:220px;overflow-y:auto;">
          ${c.notes.length ? c.notes.slice().reverse().map((n) => `
            <div class="note-item">
              <div class="note-item__meta"><span class="note-item__author">${n.author}</span><span>${Fmt.timeAgo(n.timestamp)}</span></div>
              <div class="note-item__text">${Fmt.escapeHtml(n.text)}</div>
            </div>
          `).join("") : `<p class="text-tertiary" style="font-size:12.5px;">No notes yet.</p>`}
        </div>
        <textarea class="form-textarea" id="note-input" placeholder="Add analyst commentary…" style="margin-bottom:8px;min-height:70px;"></textarea>
        <button class="btn btn--primary btn--block" id="add-note-btn">${Icons.icon("plus", { size: 14 })} Add Note</button>
      </div>
    `;
  }

  function historyLogHtml(full) {
    const items = full.case.history.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return `
      <div class="card__header"><div class="card__title">Case History Log</div></div>
      <div class="card__body">
        ${items.map((h) => `
          <div class="history-item">
            <span class="history-item__icon">${Icons.icon("history", { size: 13 })}</span>
            <div class="history-item__body">
              <div class="history-item__action">${h.action}</div>
              ${h.note ? `<div class="history-item__note">${Fmt.escapeHtml(h.note)}</div>` : ""}
              <div class="history-item__meta">${h.actor} · ${Fmt.formatDateTime(h.timestamp)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ---------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------
  function runAiInsight(full) {
    if (streamController) streamController.cancel();
    const textEl = document.getElementById("ai-summary-text");
    const regenBtn = document.getElementById("ai-regenerate");
    regenBtn.disabled = true;
    textEl.innerHTML = `<span class="pulse-soft text-tertiary">Analysing transaction pattern and historical behaviour…</span>`;
    document.getElementById("ai-recommendation").style.display = "none";
    document.getElementById("ai-confidence-row").style.display = "none";

    setTimeout(() => {
      const insight = AI.generate(full);
      textEl.textContent = "";
      streamController = AI.streamText(textEl, insight.summary, {
        onDone: () => { regenBtn.disabled = false; },
      });
      document.getElementById("ai-recommendation-text").textContent = insight.recommendation;
      document.getElementById("ai-recommendation").style.display = "flex";
      document.getElementById("ai-confidence-value").textContent = insight.confidence + "%";
      document.getElementById("ai-confidence-fill").style.width = insight.confidence + "%";
      document.getElementById("ai-confidence-row").style.display = "flex";
      document.getElementById("ai-generated-at").textContent = "Generated " + Fmt.timeAgo(insight.generatedAt);
    }, 650);
  }

  function confirmAndApplyDisposition(full, disposition) {
    const noteVal = (document.getElementById("note-input") || {}).value || "";
    const labelMap = {
      "Accommodate": "Accommodate — clear and approve this case?",
      "Escalate": "Escalate this case to a Senior Reviewer for secondary review?",
      "Hold for Additional Information": "Place this case on hold pending additional information?",
      "Decline/Block": "Decline/Block this transaction? This will close the case.",
    };
    window.SentinelModal.open({
      title: "Confirm Disposition",
      bodyHtml: `
        <p style="font-size:14px;margin-bottom:16px;">${labelMap[disposition]}</p>
        <div class="form-group">
          <label class="form-label">Rationale (optional)</label>
          <textarea class="form-textarea" id="disposition-note">${Fmt.escapeHtml(noteVal)}</textarea>
        </div>
      `,
      footerButtons: [
        { label: "Cancel", variant: "ghost" },
        {
          label: "Confirm", variant: "primary", close: true,
          onClick: (overlay) => {
            const note = overlay.querySelector("#disposition-note").value.trim();
            Data.applyDisposition(full.case.id, disposition, note, Data.getCurrentUser().name);
            window.SentinelToast.success("Disposition recorded", `${full.case.id} — ${disposition}`);
            refresh();
          },
        },
      ],
    });
  }

  function wireWorkbench(full) {
    document.querySelectorAll("[data-disposition]").forEach((btn) => {
      btn.addEventListener("click", () => confirmAndApplyDisposition(full, btn.dataset.disposition));
    });

    document.getElementById("reassign-btn").addEventListener("click", () => {
      const id = document.getElementById("reassign-select").value;
      if (!id) return;
      Data.reassignToSenior(full.case.id, id, Data.getCurrentUser().name);
      window.SentinelToast.success("Case reassigned", `Routed to ${Data.getAnalyst(id).name}`);
      refresh();
    });

    document.getElementById("add-note-btn").addEventListener("click", () => {
      const input = document.getElementById("note-input");
      const text = input.value.trim();
      if (!text) return;
      Data.addNote(full.case.id, text, Data.getCurrentUser().name);
      window.SentinelToast.success("Note added");
      refresh();
    });

    const assignToMeBtn = document.getElementById("assign-to-me");
    if (assignToMeBtn) {
      assignToMeBtn.addEventListener("click", () => {
        const me = Data.getCurrentUser();
        Data.assignAnalyst(full.case.id, me.id, me.name);
        window.SentinelToast.success("Case assigned to you");
        refresh();
      });
    }
  }

  function wireAIInsights(full) {
    document.getElementById("ai-regenerate").addEventListener("click", () => runAiInsight(full));
    runAiInsight(full);
  }

  // ---------------------------------------------------------------------
  // Top-level render
  // ---------------------------------------------------------------------
  function notFoundHtml() {
    return `
      <div class="card" style="margin-top:40px;">
        <div class="card__body">
          ${Tbl.emptyStateHtml({ icon: "alert-triangle", title: "Case not found", desc: "The case you're looking for doesn't exist, or the ID in the URL is incorrect." })}
          <div style="text-align:center;margin-top:8px;"><a href="case-queue.html" class="btn btn--primary" style="display:inline-flex;">Back to Case Queue</a></div>
        </div>
      </div>
    `;
  }

  function renderAll(full) {
    const root = document.getElementById("page-root");
    root.innerHTML = `
      ${headerHtml(full)}
      <div class="case-detail-layout">
        <div class="case-detail-main">
          <div class="card animate-fade-up">${policyholderSummaryHtml(full)}</div>
          <div class="card animate-fade-up stagger-1">${timelineHtml(full)}</div>
          <div class="card animate-fade-up stagger-2">${comparisonHtml(full)}</div>
          <div class="card animate-fade-up stagger-3">${deviceHistoryHtml(full)}</div>
          <div class="card ai-panel animate-fade-up stagger-4">${aiInsightsHtml()}</div>
        </div>
        <div class="case-detail-side">
          <div class="card animate-fade-up">${riskBreakdownHtml(full)}</div>
          <div class="card animate-fade-up stagger-1">${workbenchHtml(full)}</div>
          <div class="card animate-fade-up stagger-2">${historyLogHtml(full)}</div>
        </div>
      </div>
    `;
    wireAIInsights(full);
    wireWorkbench(full);
  }

  function refresh() {
    const full = Data.getCaseFull(caseId);
    if (!full) { document.getElementById("page-root").innerHTML = notFoundHtml(); return; }
    renderAll(full);
  }

  function render(root) {
    caseId = getIdFromUrl();
    const full = caseId ? Data.getCaseFull(caseId) : null;
    if (!full) { root.innerHTML = notFoundHtml(); return; }
    renderAll(full);
  }

  window.SentinelPages = window.SentinelPages || {};
  window.SentinelPages.caseDetail = { render };
})();
