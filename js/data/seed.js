/**
 * dGTL Sentinel — Seeded demo dataset generator.
 * Deterministic (fixed PRNG seed) so the dataset is stable across reloads
 * within a session, while case workflow state is layered on top in
 * localStorage by dataService.js.
 */

(function () {
  const ND = window.SentinelNameData;

  // ---------------------------------------------------------------------
  // Deterministic PRNG (mulberry32)
  // ---------------------------------------------------------------------
  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rng = mulberry32(842019);

  const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const randFloat = (min, max, dp = 2) => +(rng() * (max - min) + min).toFixed(dp);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const chance = (p) => rng() < p;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickWeighted(items) {
    // items: [{ value, weight }]
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = rng() * total;
    for (const it of items) {
      r -= it.weight;
      if (r <= 0) return it.value;
    }
    return items[items.length - 1].value;
  }

  function pad(num, len) { return String(num).padStart(len, "0"); }

  const NOW = new Date("2026-07-03T14:30:00");

  function daysAgo(n, hourJitter = true) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - n);
    if (hourJitter) {
      d.setHours(randInt(6, 22), randInt(0, 59), randInt(0, 59));
    }
    return d;
  }

  function addHours(date, h) {
    const d = new Date(date);
    d.setHours(d.getHours() + h);
    return d;
  }

  function fullName(gender) {
    const first = gender === "F" ? pick(ND.firstNamesFemale) : pick(ND.firstNamesMale);
    const last = pick(ND.lastNames);
    return `${first} ${last}`;
  }

  function randomIp() {
    return `${randInt(1, 223)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
  }

  function maskPhone(n) { return `+91 9XXXXX${String(n).slice(-4).padStart(4, "0")}`; }
  function maskEmail(name, n) {
    const handle = name.split(" ")[0].toLowerCase();
    return `${handle.slice(0, 2)}${"*".repeat(Math.max(handle.length - 2, 2))}${n}@maskeddomain.com`;
  }
  function maskAccountNumber(n) { return `XXXX-XXXX-${pad(n % 10000, 4)}`; }

  // ---------------------------------------------------------------------
  // Analysts (20)
  // ---------------------------------------------------------------------
  function buildAnalysts() {
    const analysts = [];
    const roleCounts = { "Risk Analyst": 14, "Senior Reviewer": 4, "Business Admin": 2 };
    let idx = 1;
    Object.entries(roleCounts).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        const gender = chance(0.48) ? "F" : "M";
        const name = fullName(gender);
        const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase();
        analysts.push({
          id: `AN-${pad(idx, 3)}`,
          name,
          role,
          initials,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@dgtlsentinel-demo.com`,
          status: chance(0.9) ? "Active" : "On Leave",
          joinedDate: daysAgo(randInt(60, 1400), false).toISOString(),
        });
        idx++;
      }
    });
    return analysts;
  }

  // ---------------------------------------------------------------------
  // Policyholders + Accounts (200)
  // ---------------------------------------------------------------------
  function buildPolicyholdersAndAccounts() {
    const policyholders = [];
    const accounts = [];

    for (let i = 1; i <= 200; i++) {
      const gender = chance(0.46) ? "F" : "M";
      const name = fullName(gender);
      const product = pick(ND.productTypes);
      const homeLoc = pick(ND.cities);
      const age = randInt(42, 78);
      const tenureYears = randInt(1, Math.min(age - 35, 24));
      const riskProfile = pickWeighted([
        { value: "Low", weight: 55 },
        { value: "Medium", weight: 33 },
        { value: "High", weight: 12 },
      ]);

      const phId = `PH-${pad(100000 + i, 6)}`;
      const policyholder = {
        id: phId,
        name,
        gender,
        age,
        productType: product,
        policyNumber: `POL${pad(500000 + i, 7)}`,
        tenureYears,
        homeCity: homeLoc.city,
        homeState: homeLoc.state,
        riskProfile,
        phone: maskPhone(100000 + i),
        email: maskEmail(name, i),
        nominee: fullName(chance(0.5) ? "F" : "M"),
        sumAssuredLakh: randInt(5, 150),
        joinedDate: daysAgo(tenureYears * 365 + randInt(0, 300), false).toISOString(),
      };
      policyholders.push(policyholder);

      // Known devices for this account (2-4)
      const deviceCount = randInt(2, 4);
      const knownDevices = [];
      const usedDevices = shuffle(ND.devices).slice(0, deviceCount);
      usedDevices.forEach((device, di) => {
        const firstSeenDays = randInt(120, 900);
        knownDevices.push({
          device,
          ip: randomIp(),
          city: homeLoc.city,
          state: homeLoc.state,
          firstSeen: daysAgo(firstSeenDays, false).toISOString(),
          lastSeen: daysAgo(randInt(1, 90), false).toISOString(),
          timesUsed: randInt(6, 140),
          isPrimary: di === 0,
        });
      });

      const avgWithdrawal = randInt(8, 60) * 1000;
      const accId = `ACC-${pad(200000 + i, 6)}`;
      accounts.push({
        id: accId,
        policyholderId: phId,
        accountNumber: maskAccountNumber(300000 + i),
        productCode: product.code,
        openDate: policyholder.joinedDate,
        status: "Active",
        homeCity: homeLoc.city,
        homeState: homeLoc.state,
        knownDevices,
        baseline: {
          avgWithdrawalAmount: avgWithdrawal,
          avgTransactionsPerYear: randInt(2, 10),
          usualChannel: pickWeighted([
            { value: "Online Portal", weight: 35 },
            { value: "Mobile App", weight: 35 },
            { value: "Branch Visit", weight: 15 },
            { value: "Call Centre", weight: 10 },
            { value: "Agent-Assisted", weight: 5 },
          ]),
          usualDayPart: pick(["Morning", "Afternoon", "Evening"]),
          usualDestinationLast4: pad(randInt(0, 9999), 4),
        },
      });
    }

    return { policyholders, accounts };
  }

  // ---------------------------------------------------------------------
  // Transactions (1000 total = 700 baseline + 300 flagged)
  // ---------------------------------------------------------------------
  function buildTransactions(accounts) {
    const transactions = [];
    let txnSeq = 1;

    function newTxnId() { return `TXN-${pad(500000 + txnSeq++, 7)}`; }

    function randomKnownDeviceEvent(account) {
      const kd = pick(account.knownDevices);
      return { device: kd.device, ip: kd.ip, city: kd.city, state: kd.state };
    }

    function novelDeviceEvent(account) {
      const usesForeign = chance(0.35);
      const loc = usesForeign ? pick(ND.foreignLocations) : pick(ND.cities);
      return {
        device: pick(ND.devices),
        ip: randomIp(),
        city: loc.city,
        state: loc.state,
      };
    }

    // 700 baseline (unflagged) transactions distributed across accounts
    accounts.forEach((account) => {
      const count = randInt(2, 5);
      for (let i = 0; i < count; i++) {
        const type = pickWeighted([
          { value: "Premium Payment", weight: 40 },
          { value: "Fund Switch", weight: 15 },
          { value: "Withdrawal", weight: 15 },
          { value: "Partial Surrender", weight: 8 },
          { value: "Loan Against Policy", weight: 7 },
          { value: "Address Change", weight: 5 },
          { value: "Nominee Change", weight: 5 },
          { value: "Bank Detail Update", weight: 5 },
        ]);
        const ev = randomKnownDeviceEvent(account);
        const amount = type === "Premium Payment"
          ? randInt(5, 25) * 1000
          : Math.round(account.baseline.avgWithdrawalAmount * randFloat(0.6, 1.3, 2) / 100) * 100;

        transactions.push({
          id: newTxnId(),
          accountId: account.id,
          policyholderId: account.policyholderId,
          type,
          amount,
          channel: chance(0.8) ? account.baseline.usualChannel : pick(ND.channels),
          timestamp: daysAgo(randInt(15, 150)).toISOString(),
          device: ev.device,
          ip: ev.ip,
          city: ev.city,
          state: ev.state,
          destinationLast4: account.baseline.usualDestinationLast4,
          isFlagged: false,
        });
      }
    });

    // Trim/pad to exactly 700 baseline
    while (transactions.length > 700) transactions.pop();
    while (transactions.length < 700) {
      const account = pick(accounts);
      const ev = randomKnownDeviceEvent(account);
      transactions.push({
        id: newTxnId(),
        accountId: account.id,
        policyholderId: account.policyholderId,
        type: "Premium Payment",
        amount: randInt(5, 25) * 1000,
        channel: account.baseline.usualChannel,
        timestamp: daysAgo(randInt(15, 150)).toISOString(),
        device: ev.device,
        ip: ev.ip,
        city: ev.city,
        state: ev.state,
        destinationLast4: account.baseline.usualDestinationLast4,
        isFlagged: false,
      });
    }

    return { transactions, newTxnId, randomKnownDeviceEvent, novelDeviceEvent };
  }

  // ---------------------------------------------------------------------
  // Alerts (300) + flagged transactions, Cases (150 = score >= 3)
  // ---------------------------------------------------------------------
  function buildAlertsAndCases(accounts, policyholderById, txnCtx, analysts) {
    const { transactions, newTxnId, randomKnownDeviceEvent, novelDeviceEvent } = txnCtx;
    const alerts = [];
    const cases = [];

    const scoreCounts = { 1: 60, 2: 90, 3: 80, 4: 50, 5: 20 };
    const scorePool = shuffle(
      Object.entries(scoreCounts).flatMap(([score, count]) => Array(count).fill(Number(score)))
    );

    const scenarios = ND.scenarioDefs;
    const byId = Object.fromEntries(scenarios.map((s) => [s.id, s]));

    function scenariosForScore(score) {
      if (score <= 2) return [pick(scenarios).id];
      if (score === 3) return chance(0.5) ? [pick(scenarios).id] : shuffle(scenarios.map((s) => s.id)).slice(0, 2);
      if (score === 4) return shuffle(scenarios.map((s) => s.id)).slice(0, randInt(2, 3));
      // score 5 — must include a deviation scenario
      const deviation = pick(["BEHAVIOURAL_DEVIATION", "WITHDRAWAL_PATTERN_DEVIATION"]);
      const others = shuffle(scenarios.map((s) => s.id).filter((id) => id !== deviation)).slice(0, 2);
      return [deviation, ...others];
    }

    function contributingFactors(scenarioIds) {
      const raw = scenarioIds.map(() => randInt(15, 50));
      const total = raw.reduce((a, b) => a + b, 0);
      let pcts = raw.map((r) => Math.round((r / total) * 100));
      const diff = 100 - pcts.reduce((a, b) => a + b, 0);
      pcts[0] += diff;
      return scenarioIds.map((id, i) => ({
        scenario: byId[id].label,
        scenarioId: id,
        weightPct: pcts[i],
      }));
    }

    function primaryCategory(factors) {
      const top = factors.slice().sort((a, b) => b.weightPct - a.weightPct)[0];
      return byId[top.scenarioId].category;
    }

    // Analyst pools by role
    const riskAnalysts = analysts.filter((a) => a.role === "Risk Analyst" && a.status === "Active");
    const seniorReviewers = analysts.filter((a) => a.role === "Senior Reviewer");

    let caseSeq = 1;

    for (let i = 0; i < 300; i++) {
      const score = scorePool[i];
      const account = pick(accounts);
      const policyholder = policyholderById[account.policyholderId];
      const scenarioIds = scenariosForScore(score);
      const involvesAccessAnomaly = scenarioIds.some((id) => id === "IP_DEVICE_CHANGE" || id === "UNUSUAL_ACCESS_WITHDRAWAL");
      const involvesStructuring = scenarioIds.includes("STRUCTURED_WITHDRAWALS");

      const daysBack = chance(0.85) ? randInt(0, 29) : randInt(30, 45);
      const ev = involvesAccessAnomaly ? novelDeviceEvent(account) : randomKnownDeviceEvent(account);

      let amount;
      if (involvesStructuring) {
        amount = randInt(3, 9) * 1000; // small-value, structured below typical thresholds
      } else if (scenarioIds.includes("WITHDRAWAL_PATTERN_DEVIATION") || scenarioIds.includes("BEHAVIOURAL_DEVIATION")) {
        amount = Math.round(account.baseline.avgWithdrawalAmount * randFloat(2.2, 4.5, 2) / 100) * 100;
      } else {
        amount = Math.round(account.baseline.avgWithdrawalAmount * randFloat(1.1, 2, 2) / 100) * 100;
      }

      const txn = {
        id: newTxnId(),
        accountId: account.id,
        policyholderId: account.policyholderId,
        type: involvesStructuring ? "Withdrawal" : pickWeighted([
          { value: "Withdrawal", weight: 70 },
          { value: "Partial Surrender", weight: 20 },
          { value: "Full Surrender", weight: 10 },
        ]),
        amount,
        channel: involvesAccessAnomaly ? pick(ND.channels.filter((c) => c !== account.baseline.usualChannel)) : account.baseline.usualChannel,
        timestamp: daysAgo(daysBack).toISOString(),
        device: ev.device,
        ip: ev.ip,
        city: ev.city,
        state: ev.state,
        destinationLast4: involvesStructuring || score >= 4 ? pad(randInt(0, 9999), 4) : account.baseline.usualDestinationLast4,
        isFlagged: true,
      };
      transactions.push(txn);

      const factors = contributingFactors(scenarioIds);
      const category = primaryCategory(factors);
      const routing = score <= 1 ? "Logged Only" : score <= 3 ? "Standard Queue" : "Priority Queue";

      const alertId = `ALT-${pad(900000 + i + 1, 6)}`;
      const alert = {
        id: alertId,
        transactionId: txn.id,
        accountId: account.id,
        policyholderId: account.policyholderId,
        scenarioIds,
        scenarioLabels: scenarioIds.map((id) => byId[id].label),
        category,
        riskScore: score,
        contributingFactors: factors,
        dateFlagged: txn.timestamp,
        routing,
      };
      alerts.push(alert);

      if (score >= 3) {
        const caseId = `CASE-${pad(caseSeq, 4)}`;
        caseSeq++;

        const statusRoll = pickWeighted([
          { value: "New", weight: 20 },
          { value: "In Review", weight: 28 },
          { value: "Escalated", weight: 12 },
          { value: "Closed", weight: 40 },
        ]);

        const autoFlagSenior = score === 5 && chance(0.4);
        const assignedAnalyst = autoFlagSenior ? pick(seniorReviewers) : pick(riskAnalysts);
        let finalAnalystId = assignedAnalyst.id;

        const createdAt = new Date(txn.timestamp);
        const history = [
          {
            id: `HIST-${caseId}-1`,
            timestamp: createdAt.toISOString(),
            actor: "Detection Engine",
            action: "Case auto-created from alert",
            note: `Composite risk score ${score}/5 — ${factors.map((f) => `${f.weightPct}% ${f.scenario}`).join(", ")}.`,
          },
        ];

        let disposition = null;
        let resolvedAt = null;
        let notes = [];

        if (statusRoll !== "New") {
          const assignHours = randInt(1, 6);
          history.push({
            id: `HIST-${caseId}-2`,
            timestamp: addHours(createdAt, assignHours).toISOString(),
            actor: "Queue Manager",
            action: `Case assigned to ${assignedAnalyst.name}`,
            note: null,
          });
        }

        if (statusRoll === "In Review") {
          const reviewHours = randInt(6, 30);
          history.push({
            id: `HIST-${caseId}-3`,
            timestamp: addHours(createdAt, reviewHours).toISOString(),
            actor: assignedAnalyst.name,
            action: "Status changed to In Review",
            note: null,
          });
          if (chance(0.6)) {
            notes.push(buildNote(assignedAnalyst, addHours(createdAt, reviewHours + 2), "hold"));
            history.push({
              id: `HIST-${caseId}-4`,
              timestamp: addHours(createdAt, reviewHours + 2).toISOString(),
              actor: assignedAnalyst.name,
              action: "Disposition recorded: Hold for Additional Information",
              note: null,
            });
          }
        } else if (statusRoll === "Escalated") {
          const escHours = randInt(6, 24);
          const reviewer = assignedAnalyst.role === "Senior Reviewer" ? assignedAnalyst : pick(seniorReviewers);
          finalAnalystId = reviewer.id;
          disposition = "Escalate";
          notes.push(buildNote(assignedAnalyst, addHours(createdAt, escHours - 1), "escalate"));
          history.push({
            id: `HIST-${caseId}-3`,
            timestamp: addHours(createdAt, escHours).toISOString(),
            actor: assignedAnalyst.name,
            action: `Case escalated to Senior Reviewer — ${reviewer.name}`,
            note: null,
          });
        } else if (statusRoll === "Closed") {
          const resolveHours = randInt(4, 96);
          disposition = pickWeighted([
            { value: "Accommodate", weight: 65 },
            { value: "Decline/Block", weight: 35 },
          ]);
          resolvedAt = addHours(createdAt, resolveHours);
          notes.push(buildNote(assignedAnalyst, addHours(createdAt, resolveHours - 1), disposition === "Accommodate" ? "accommodate" : "decline"));
          history.push({
            id: `HIST-${caseId}-3`,
            timestamp: resolvedAt.toISOString(),
            actor: assignedAnalyst.name,
            action: `Case closed — Disposition: ${disposition}`,
            note: null,
          });
        }

        cases.push({
          id: caseId,
          alertId,
          policyholderId: account.policyholderId,
          accountId: account.id,
          scenarioIds,
          scenarioLabels: alert.scenarioLabels,
          category,
          riskScore: score,
          contributingFactors: factors,
          routing,
          dateFlagged: txn.timestamp,
          status: statusRoll,
          assignedAnalystId: statusRoll === "New" ? null : finalAnalystId,
          disposition,
          notes,
          history,
          createdAt: createdAt.toISOString(),
          resolvedAt: resolvedAt ? resolvedAt.toISOString() : null,
        });
      }
    }

    // Force a handful of resolutions to land "today" for the Resolved Today KPI
    const closedCases = cases.filter((c) => c.status === "Closed");
    shuffle(closedCases).slice(0, 7).forEach((c) => {
      const hoursAgo = randInt(1, 10);
      const resolved = new Date(NOW);
      resolved.setHours(resolved.getHours() - hoursAgo);
      c.resolvedAt = resolved.toISOString();
      c.history[c.history.length - 1].timestamp = resolved.toISOString();
    });

    return { alerts, cases };
  }

  function buildNote(analyst, timestamp, kind) {
    const templates = {
      hold: [
        "Attempted to reach policyholder on registered mobile for verification; no response. Placing case on hold pending call-back.",
        "Requested supporting documentation from policyholder before proceeding. Awaiting response.",
        "Cross-checking device fingerprint against branch visit logs — additional information required before disposition.",
      ],
      escalate: [
        "Signal correlation exceeds standard authority threshold. Escalating to Senior Reviewer for secondary validation before any disbursal.",
        "Withdrawal pattern combined with access anomaly warrants senior sign-off given policy tenure and sum assured.",
        "Escalating per protocol — multiple correlated signals present with no successful policyholder verification yet.",
      ],
      accommodate: [
        "Contacted policyholder via registered mobile; confirmed the transaction was self-initiated. Reason validated. Clearing case.",
        "Policyholder confirmed recent device/travel change during verification call. Activity deemed legitimate.",
        "Reviewed historical pattern — deviation explained by a one-off planned withdrawal for a documented life event. Approving.",
      ],
      decline: [
        "Unable to verify policyholder identity after two contact attempts. Recommending hold on disbursal and block pending further review.",
        "Device and IP inconsistent with any known access point; policyholder denies initiating the transaction. Blocking as suspected fraud.",
        "Structuring pattern confirmed against threshold rules with no legitimate business rationale provided. Declining transaction.",
      ],
    };
    const text = pick(templates[kind]);
    return {
      id: `NOTE-${analyst.id}-${timestamp.getTime()}`,
      author: analyst.name,
      authorId: analyst.id,
      timestamp: timestamp.toISOString(),
      text,
    };
  }

  // ---------------------------------------------------------------------
  // Master build
  // ---------------------------------------------------------------------
  function generate() {
    const analysts = buildAnalysts();
    const { policyholders, accounts } = buildPolicyholdersAndAccounts();
    const policyholderById = Object.fromEntries(policyholders.map((p) => [p.id, p]));
    const txnCtx = buildTransactions(accounts);
    const { alerts, cases } = buildAlertsAndCases(accounts, policyholderById, txnCtx, analysts);

    return {
      generatedAt: NOW.toISOString(),
      analysts,
      policyholders,
      accounts,
      transactions: txnCtx.transactions,
      alerts,
      cases,
      scenarioDefs: ND.scenarioDefs,
    };
  }

  window.SentinelSeed = { generate };
})();
