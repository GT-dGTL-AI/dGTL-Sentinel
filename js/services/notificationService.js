/**
 * dGTL Sentinel — mock in-app notification centre.
 * Notifications are derived from the seeded case/alert dataset
 * (no external push service); read state persists per session.
 */
(function () {
  const Store = window.SentinelStore;
  const Data = window.SentinelData;
  const Fmt = window.SentinelFormat;

  let cache = null;

  function build() {
    Data.ensureLoaded();
    const cases = Data.getAllCases();
    const notifs = [];

    cases
      .filter((c) => c.riskScore === 5)
      .sort((a, b) => new Date(b.dateFlagged) - new Date(a.dateFlagged))
      .slice(0, 6)
      .forEach((c) => {
        const ph = Data.getPolicyholder(c.policyholderId);
        notifs.push({
          id: `NOTIF-CRIT-${c.id}`,
          type: "critical",
          title: "Critical risk case flagged",
          message: `${c.id} — ${Fmt.maskName(ph.name)} — composite score 5/5 (${c.category})`,
          timestamp: c.dateFlagged,
          caseId: c.id,
        });
      });

    cases
      .filter((c) => c.status === "Escalated")
      .sort((a, b) => new Date(b.dateFlagged) - new Date(a.dateFlagged))
      .slice(0, 5)
      .forEach((c) => {
        const ph = Data.getPolicyholder(c.policyholderId);
        notifs.push({
          id: `NOTIF-ESC-${c.id}`,
          type: "escalation",
          title: "Case escalated to Senior Reviewer",
          message: `${c.id} — ${Fmt.maskName(ph.name)} requires secondary sign-off`,
          timestamp: c.history[c.history.length - 1].timestamp,
          caseId: c.id,
        });
      });

    cases
      .filter((c) => c.status === "New" && c.riskScore >= 4)
      .sort((a, b) => new Date(b.dateFlagged) - new Date(a.dateFlagged))
      .slice(0, 5)
      .forEach((c) => {
        const ph = Data.getPolicyholder(c.policyholderId);
        notifs.push({
          id: `NOTIF-NEW-${c.id}`,
          type: "queue",
          title: "New priority case awaiting assignment",
          message: `${c.id} — ${Fmt.maskName(ph.name)} routed to Priority Queue`,
          timestamp: c.dateFlagged,
          caseId: c.id,
        });
      });

    cases
      .filter((c) => c.status === "Closed" && c.resolvedAt)
      .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))
      .slice(0, 4)
      .forEach((c) => {
        const ph = Data.getPolicyholder(c.policyholderId);
        notifs.push({
          id: `NOTIF-CLOSE-${c.id}`,
          type: "resolved",
          title: "Case resolved",
          message: `${c.id} — ${Fmt.maskName(ph.name)} closed as ${c.disposition}`,
          timestamp: c.resolvedAt,
          caseId: c.id,
        });
      });

    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
  }

  function getAll() {
    if (!cache) cache = build();
    const read = Store.get("notif_read", []);
    return cache.map((n) => Object.assign({}, n, { read: read.includes(n.id) }));
  }

  function getUnreadCount() {
    return getAll().filter((n) => !n.read).length;
  }

  function markRead(id) {
    Store.update("notif_read", (all) => (all.includes(id) ? all : all.concat(id)), []);
    Store.bus.emit("notifications:changed");
  }

  function markAllRead() {
    const ids = getAll().map((n) => n.id);
    Store.set("notif_read", ids);
    Store.bus.emit("notifications:changed");
  }

  const ICONS = { critical: "alert-triangle", escalation: "trending-up", queue: "inbox", resolved: "check-circle" };
  const COLORS = { critical: "risk-5", escalation: "risk-4", queue: "info", resolved: "success" };

  window.SentinelNotifications = { getAll, getUnreadCount, markRead, markAllRead, ICONS, COLORS };
})();
