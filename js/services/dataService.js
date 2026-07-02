/**
 * dGTL Sentinel — data access layer.
 * Combines the deterministic seeded dataset with session-persisted
 * workflow overrides (case status/notes/assignment, rule config,
 * analyst roster edits) stored via SentinelStore (localStorage).
 * No network calls — this is the entire "backend" for the demo build.
 */
(function () {
  const Store = window.SentinelStore;
  const Fmt = window.SentinelFormat;

  let dataset = null;
  let indexes = null;

  function ensureLoaded() {
    if (dataset) return;
    dataset = window.SentinelSeed.generate();
    indexes = {
      policyholderById: Object.fromEntries(dataset.policyholders.map((p) => [p.id, p])),
      accountById: Object.fromEntries(dataset.accounts.map((a) => [a.id, a])),
      accountByPolicyholder: Object.fromEntries(dataset.accounts.map((a) => [a.policyholderId, a])),
      transactionById: Object.fromEntries(dataset.transactions.map((t) => [t.id, t])),
      transactionsByAccount: groupBy(dataset.transactions, "accountId"),
      alertById: Object.fromEntries(dataset.alerts.map((a) => [a.id, a])),
      alertsByPolicyholder: groupBy(dataset.alerts, "policyholderId"),
      analystById: Object.fromEntries(dataset.analysts.map((a) => [a.id, a])),
      caseByAlertId: {},
    };
    dataset.cases.forEach((c) => (indexes.caseByAlertId[c.alertId] = c.id));
  }

  function groupBy(arr, key) {
    const out = {};
    arr.forEach((item) => {
      (out[item[key]] = out[item[key]] || []).push(item);
    });
    return out;
  }

  // ---------------------------------------------------------------------
  // Overrides (the only mutable state — everything else is deterministic)
  // ---------------------------------------------------------------------
  function getCaseOverrides() { return Store.get("case_overrides", {}); }
  function setCaseOverride(caseId, patch) {
    Store.update("case_overrides", (all) => {
      all[caseId] = Object.assign({}, all[caseId], patch);
      return all;
    }, {});
  }

  const DEFAULT_RULES = [
    { id: "BEHAVIOURAL_DEVIATION", label: "Behavioural Pattern Deviation", category: "Behavioural Anomaly", description: "Flags when a transaction pattern diverges materially from the policyholder's established baseline.", enabled: true, threshold: 35, unit: "% deviation", min: 10, max: 80, step: 5 },
    { id: "IP_DEVICE_CHANGE", label: "IP Address / Device Change on Pension Account", category: "Access Anomaly", description: "Flags logins or transactions from a new or geographically inconsistent IP/device on a pension or annuity account.", enabled: true, threshold: 60, unit: "% sensitivity", min: 20, max: 100, step: 5 },
    { id: "UNUSUAL_ACCESS_WITHDRAWAL", label: "Unusual Account Access for Withdrawal", category: "Access Anomaly", description: "Flags withdrawals initiated outside the policyholder's normal access channel, time window, or frequency.", enabled: true, threshold: 2, unit: "x normal frequency", min: 1, max: 5, step: 0.5 },
    { id: "STRUCTURED_WITHDRAWALS", label: "Structured / Small-Value Withdrawals", category: "Structuring Pattern", description: "Flags multiple smaller withdrawals potentially structured to stay below standard review thresholds.", enabled: true, threshold: 10000, unit: "₹ ceiling", min: 2000, max: 50000, step: 1000 },
    { id: "WITHDRAWAL_PATTERN_DEVIATION", label: "Withdrawal Pattern Deviation", category: "Behavioural Anomaly", description: "Flags changes in withdrawal frequency, amount trend, or destination account inconsistent with prior history.", enabled: true, threshold: 40, unit: "% deviation", min: 10, max: 80, step: 5 },
  ];

  function getRuleConfig() {
    const overrides = Store.get("rule_config", {});
    return DEFAULT_RULES.map((r) => Object.assign({}, r, overrides[r.id]));
  }
  function toggleRule(ruleId, enabled) {
    Store.update("rule_config", (all) => {
      all[ruleId] = Object.assign({}, all[ruleId], { enabled });
      return all;
    }, {});
    Store.bus.emit("rules:changed");
  }
  function updateRuleThreshold(ruleId, threshold) {
    Store.update("rule_config", (all) => {
      all[ruleId] = Object.assign({}, all[ruleId], { threshold });
      return all;
    }, {});
    Store.bus.emit("rules:changed");
  }

  function getAnalystOverrides() { return Store.get("analyst_overrides", { added: [], roleChanges: {}, statusChanges: {} }); }

  function getAnalysts() {
    ensureLoaded();
    const ov = getAnalystOverrides();
    const base = dataset.analysts.map((a) => Object.assign({}, a,
      ov.roleChanges[a.id] ? { role: ov.roleChanges[a.id] } : null,
      ov.statusChanges[a.id] ? { status: ov.statusChanges[a.id] } : null
    ));
    return base.concat(ov.added || []);
  }
  function getAnalyst(id) { return getAnalysts().find((a) => a.id === id) || null; }

  function addAnalyst({ name, role, email }) {
    const id = `AN-${window.SentinelId.nextId("X")}`;
    const analyst = {
      id, name, role, email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@dgtlsentinel-demo.com`,
      initials: Fmt.initials(name), status: "Active", joinedDate: new Date().toISOString(),
    };
    Store.update("analyst_overrides", (all) => {
      all.added = all.added || [];
      all.added.push(analyst);
      return all;
    }, { added: [], roleChanges: {}, statusChanges: {} });
    Store.bus.emit("analysts:changed");
    return analyst;
  }
  function updateAnalystRole(analystId, role) {
    Store.update("analyst_overrides", (all) => {
      all.roleChanges = all.roleChanges || {};
      all.roleChanges[analystId] = role;
      return all;
    }, { added: [], roleChanges: {}, statusChanges: {} });
    Store.bus.emit("analysts:changed");
  }
  function setAnalystStatus(analystId, status) {
    Store.update("analyst_overrides", (all) => {
      all.statusChanges = all.statusChanges || {};
      all.statusChanges[analystId] = status;
      return all;
    }, { added: [], roleChanges: {}, statusChanges: {} });
    Store.bus.emit("analysts:changed");
  }

  // ---------------------------------------------------------------------
  // Read accessors
  // ---------------------------------------------------------------------
  function getPolicyholders() { ensureLoaded(); return dataset.policyholders; }
  function getPolicyholder(id) { ensureLoaded(); return indexes.policyholderById[id] || null; }
  function getAccount(id) { ensureLoaded(); return indexes.accountById[id] || null; }
  function getAccountByPolicyholder(phId) { ensureLoaded(); return indexes.accountByPolicyholder[phId] || null; }
  function getTransaction(id) { ensureLoaded(); return indexes.transactionById[id] || null; }
  function getTransactionsByAccount(accId) {
    ensureLoaded();
    return (indexes.transactionsByAccount[accId] || []).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  function getAlert(id) { ensureLoaded(); return indexes.alertById[id] || null; }
  function getAlerts() { ensureLoaded(); return dataset.alerts; }
  function getScenarioDefs() { ensureLoaded(); return dataset.scenarioDefs; }

  function mergeCaseOverride(rawCase) {
    const ov = getCaseOverrides()[rawCase.id];
    if (!ov) return Object.assign({}, rawCase);
    return Object.assign({}, rawCase, {
      status: ov.status || rawCase.status,
      assignedAnalystId: ov.assignedAnalystId !== undefined ? ov.assignedAnalystId : rawCase.assignedAnalystId,
      disposition: ov.disposition !== undefined ? ov.disposition : rawCase.disposition,
      resolvedAt: ov.resolvedAt !== undefined ? ov.resolvedAt : rawCase.resolvedAt,
      notes: rawCase.notes.concat(ov.extraNotes || []),
      history: rawCase.history.concat(ov.extraHistory || []),
    });
  }

  function getAllCases() {
    ensureLoaded();
    return dataset.cases.map(mergeCaseOverride);
  }

  function getCase(id) {
    ensureLoaded();
    const raw = dataset.cases.find((c) => c.id === id);
    return raw ? mergeCaseOverride(raw) : null;
  }

  function getCaseFull(id) {
    const c = getCase(id);
    if (!c) return null;
    const policyholder = getPolicyholder(c.policyholderId);
    const account = getAccount(c.accountId);
    const alert = getAlert(c.alertId);
    const transaction = getTransaction(alert.transactionId);
    const analyst = c.assignedAnalystId ? getAnalyst(c.assignedAnalystId) : null;
    const accountTransactions = getTransactionsByAccount(c.accountId);
    const baselineTransactions = accountTransactions.filter((t) => t.id !== transaction.id);
    return { case: c, policyholder, account, alert, transaction, analyst, accountTransactions, baselineTransactions };
  }

  function getCases(filters) {
    ensureLoaded();
    const f = filters || {};
    let rows = getAllCases();

    if (f.search) {
      const q = f.search.toLowerCase();
      rows = rows.filter((c) => {
        const ph = getPolicyholder(c.policyholderId);
        return c.id.toLowerCase().includes(q) ||
          (ph && ph.name.toLowerCase().includes(q)) ||
          (ph && ph.policyNumber.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q);
      });
    }
    if (f.status && f.status !== "all") rows = rows.filter((c) => c.status === f.status);
    if (f.category && f.category !== "all") rows = rows.filter((c) => c.category === f.category);
    if (f.riskScore && f.riskScore !== "all") rows = rows.filter((c) => String(c.riskScore) === String(f.riskScore));
    if (f.analystId && f.analystId !== "all") {
      rows = f.analystId === "unassigned"
        ? rows.filter((c) => !c.assignedAnalystId)
        : rows.filter((c) => c.assignedAnalystId === f.analystId);
    }
    if (f.scenarioId && f.scenarioId !== "all") rows = rows.filter((c) => c.scenarioIds.includes(f.scenarioId));

    const sortKey = f.sortKey || "dateFlagged";
    const sortDir = f.sortDir || "desc";
    rows = rows.slice().sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "policyholder") {
        av = getPolicyholder(a.policyholderId).name; bv = getPolicyholder(b.policyholderId).name;
      }
      if (sortKey === "analyst") {
        av = a.assignedAnalystId ? getAnalyst(a.assignedAnalystId).name : ""; bv = b.assignedAnalystId ? getAnalyst(b.assignedAnalystId).name : "";
      }
      if (sortKey === "dateFlagged") { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    const total = rows.length;
    const page = f.page || 1;
    const pageSize = f.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);
    return { rows: paged, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  // ---------------------------------------------------------------------
  // Mutators — case workflow
  // ---------------------------------------------------------------------
  function appendHistory(caseId, entry) {
    Store.update("case_overrides", (all) => {
      all[caseId] = all[caseId] || {};
      all[caseId].extraHistory = all[caseId].extraHistory || [];
      all[caseId].extraHistory.push(Object.assign({ id: window.SentinelId.nextId("HIST"), timestamp: new Date().toISOString() }, entry));
      return all;
    }, {});
  }

  function addNote(caseId, text, actor) {
    Store.update("case_overrides", (all) => {
      all[caseId] = all[caseId] || {};
      all[caseId].extraNotes = all[caseId].extraNotes || [];
      all[caseId].extraNotes.push({
        id: window.SentinelId.nextId("NOTE"), author: actor, timestamp: new Date().toISOString(), text,
      });
      return all;
    }, {});
    appendHistory(caseId, { actor, action: "Note added", note: text });
    Store.bus.emit("case:changed", { caseId });
  }

  function assignAnalyst(caseId, analystId, actor) {
    const analyst = getAnalyst(analystId);
    setCaseOverride(caseId, { assignedAnalystId: analystId });
    const current = getCase(caseId);
    if (current.status === "New") setCaseOverride(caseId, { status: "In Review" });
    appendHistory(caseId, { actor: actor || "Queue Manager", action: `Case assigned to ${analyst.name}`, note: null });
    Store.bus.emit("case:changed", { caseId });
  }

  function bulkAssignCases(caseIds, analystId, actor) {
    caseIds.forEach((id) => assignAnalyst(id, analystId, actor));
  }

  function updateCaseStatus(caseId, status, actor) {
    setCaseOverride(caseId, { status });
    appendHistory(caseId, { actor, action: `Status changed to ${status}`, note: null });
    Store.bus.emit("case:changed", { caseId });
  }

  const DISPOSITION_STATUS_MAP = {
    "Accommodate": "Closed",
    "Decline/Block": "Closed",
    "Escalate": "Escalated",
    "Hold for Additional Information": "In Review",
  };

  function applyDisposition(caseId, disposition, note, actor) {
    const status = DISPOSITION_STATUS_MAP[disposition] || "In Review";
    const patch = { disposition, status };
    if (status === "Closed") patch.resolvedAt = new Date().toISOString();
    setCaseOverride(caseId, patch);
    if (note) addNote(caseId, note, actor);
    appendHistory(caseId, { actor, action: `Disposition recorded: ${disposition}`, note: null });
    Store.bus.emit("case:changed", { caseId });
  }

  function reassignToSenior(caseId, seniorAnalystId, actor) {
    const senior = getAnalyst(seniorAnalystId);
    setCaseOverride(caseId, { assignedAnalystId: seniorAnalystId, status: "Escalated" });
    appendHistory(caseId, { actor, action: `Case reassigned to Senior Reviewer — ${senior.name}`, note: null });
    Store.bus.emit("case:changed", { caseId });
  }

  // ---------------------------------------------------------------------
  // Dashboard / analytics aggregates
  // ---------------------------------------------------------------------
  function getDashboardKpis() {
    const cases = getAllCases();
    const open = cases.filter((c) => c.status !== "Closed");
    const highRisk = cases.filter((c) => c.riskScore >= 4 && c.status !== "Closed");
    const closed = cases.filter((c) => c.status === "Closed" && c.resolvedAt);
    const avgResolutionHours = closed.length
      ? closed.reduce((sum, c) => sum + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000, 0) / closed.length
      : 0;
    const today = new Date().toDateString();
    const resolvedToday = closed.filter((c) => new Date(c.resolvedAt).toDateString() === today).length;
    return {
      openCases: open.length,
      highRiskCases: highRisk.length,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      resolvedToday,
    };
  }

  function getCategoryBreakdown() {
    const alerts = getAlerts();
    const groups = groupBy(alerts, "category");
    return Object.entries(groups).map(([category, items]) => ({ category, count: items.length }));
  }

  function getAlertTrend(days) {
    days = days || 30;
    const alerts = getAlerts();
    const buckets = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.push({ date: d, key: d.toDateString(), count: 0 });
    }
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
    alerts.forEach((a) => {
      const key = new Date(a.dateFlagged).toDateString();
      if (byKey[key]) byKey[key].count += 1;
    });
    return buckets;
  }

  function getTopRiskCases(n) {
    return getAllCases()
      .filter((c) => c.status !== "Closed")
      .sort((a, b) => b.riskScore - a.riskScore || new Date(b.dateFlagged) - new Date(a.dateFlagged))
      .slice(0, n || 5);
  }

  function getDispositionSummary() {
    const cases = getAllCases().filter((c) => c.disposition);
    const groups = groupBy(cases, "disposition");
    return Object.entries(groups).map(([disposition, items]) => ({ disposition, count: items.length }));
  }

  function getDispositionTrend() {
    const cases = getAllCases().filter((c) => c.resolvedAt);
    const weeks = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7 - 6);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      weeks.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, start, end, Accommodate: 0, "Decline/Block": 0 });
    }
    cases.forEach((c) => {
      const t = new Date(c.resolvedAt);
      const wk = weeks.find((w) => t >= w.start && t <= w.end);
      if (wk && (c.disposition === "Accommodate" || c.disposition === "Decline/Block")) wk[c.disposition] += 1;
    });
    return weeks;
  }

  function getAnalystWorkload() {
    const analysts = getAnalysts().filter((a) => a.role !== "Business Admin");
    const cases = getAllCases();
    return analysts.map((a) => {
      const assigned = cases.filter((c) => c.assignedAnalystId === a.id);
      const open = assigned.filter((c) => c.status !== "Closed");
      const closed = assigned.filter((c) => c.status === "Closed" && c.resolvedAt);
      const avgHours = closed.length
        ? closed.reduce((s, c) => s + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000, 0) / closed.length
        : 0;
      return {
        analyst: a,
        openCount: open.length,
        closedCount: closed.length,
        totalAssigned: assigned.length,
        avgResolutionHours: Math.round(avgHours * 10) / 10,
      };
    }).sort((a, b) => b.totalAssigned - a.totalAssigned);
  }

  function getResolutionTimeBuckets() {
    const closed = getAllCases().filter((c) => c.status === "Closed" && c.resolvedAt);
    const buckets = [
      { label: "< 8h", min: 0, max: 8, count: 0 },
      { label: "8–24h", min: 8, max: 24, count: 0 },
      { label: "1–2 days", min: 24, max: 48, count: 0 },
      { label: "2–4 days", min: 48, max: 96, count: 0 },
      { label: "> 4 days", min: 96, max: Infinity, count: 0 },
    ];
    closed.forEach((c) => {
      const hours = (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000;
      const bucket = buckets.find((b) => hours >= b.min && hours < b.max);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }

  // ---------------------------------------------------------------------
  // Current user persona (for topbar / attribution)
  // ---------------------------------------------------------------------
  function getCurrentUser() {
    ensureLoaded();
    const savedId = Store.get("current_user_id", null);
    const analysts = getAnalysts();
    const found = savedId && analysts.find((a) => a.id === savedId);
    return found || analysts.find((a) => a.role === "Business Admin") || analysts[0];
  }
  function setCurrentUser(analystId) {
    Store.set("current_user_id", analystId);
  }

  window.SentinelData = {
    ensureLoaded,
    getPolicyholders, getPolicyholder, getAccount, getAccountByPolicyholder,
    getTransaction, getTransactionsByAccount,
    getAlert, getAlerts, getScenarioDefs,
    getAllCases, getCase, getCaseFull, getCases,
    addNote, assignAnalyst, bulkAssignCases, updateCaseStatus, applyDisposition, reassignToSenior,
    getRuleConfig, toggleRule, updateRuleThreshold,
    getAnalysts, getAnalyst, addAnalyst, updateAnalystRole, setAnalystStatus,
    getDashboardKpis, getCategoryBreakdown, getAlertTrend, getTopRiskCases,
    getDispositionSummary, getDispositionTrend, getAnalystWorkload, getResolutionTimeBuckets,
    getCurrentUser, setCurrentUser,
  };
})();
