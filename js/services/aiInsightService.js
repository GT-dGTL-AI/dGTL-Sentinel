/**
 * dGTL Sentinel — simulated AI Insights layer (BRD Section 8.4 / 11).
 * Produces an LLM-style narrative, next-best-action, and confidence
 * score from curated, parameterised templates. No API is ever called;
 * output varies on each "regenerate" via local randomisation only.
 */
(function () {
  const Fmt = window.SentinelFormat;

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) {
    const copy = arr.slice();
    const out = [];
    while (out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    return out;
  }

  const OPENERS = [
    "This case was surfaced by the detection engine after {factorCount} correlated signal(s) exceeded the configured risk threshold for {product} accounts.",
    "The composite risk model assigned this case a score of {score}/5 following analysis of recent account activity against the policyholder's behavioural baseline.",
    "Automated screening flagged this transaction for analyst review based on a combination of behavioural and access-pattern indicators.",
    "This alert was generated after the system detected activity inconsistent with {name}'s established transaction history on their {product} policy.",
  ];

  const FACTOR_SENTENCES = {
    BEHAVIOURAL_DEVIATION: [
      "The flagged transaction amount deviates by a wide margin from the policyholder's typical transaction size, contributing {pct}% to the overall score.",
      "Transaction behaviour on this account diverges materially from {name}'s {tenure}-year historical pattern, accounting for {pct}% of the composite score.",
    ],
    IP_DEVICE_CHANGE: [
      "The request originated from a device and IP address not previously associated with this account ({city}, {state}), contributing {pct}% to the score.",
      "Access was recorded from a new, geographically inconsistent location ({city}, {state}) relative to the account's known access history — weighted at {pct}%.",
    ],
    UNUSUAL_ACCESS_WITHDRAWAL: [
      "The withdrawal was initiated outside the policyholder's normal access channel and time window, contributing {pct}% to the composite score.",
      "Account access and withdrawal timing fall outside {name}'s established usage pattern, weighted at {pct}% in the overall assessment.",
    ],
    STRUCTURED_WITHDRAWALS: [
      "Withdrawal amounts appear structured in smaller increments consistent with an attempt to remain below standard review thresholds ({pct}% weight).",
      "A pattern of multiple small-value withdrawals was detected, a structuring signature reserved for {pct}% of the composite score.",
    ],
    WITHDRAWAL_PATTERN_DEVIATION: [
      "The frequency and destination of recent withdrawals differ from {name}'s prior pattern, contributing {pct}% to the risk assessment.",
      "A shift in withdrawal cadence and destination account was identified relative to established history, weighted at {pct}%.",
    ],
  };

  const CONTEXT_SENTENCES = [
    "{name} has held this {product} policy for {tenure} years with a {riskProfile.lower} historical risk profile, which the model weighs against the current deviation.",
    "No prior disputes or flagged activity exist on this account, though the current signal combination is significant enough to warrant review.",
    "Historical transaction cadence on this account has been stable, which increases the relative significance of the current deviation.",
  ];

  const RECOMMENDATIONS_HIGH = [
    "Recommend contacting the policyholder directly via registered mobile to verify identity and intent before any disbursal is processed.",
    "Recommend placing a temporary hold on the transaction pending outbound verification call and device confirmation.",
    "Recommend escalating to a Senior Reviewer given the correlated signal strength before final disposition.",
  ];
  const RECOMMENDATIONS_MED = [
    "Recommend a standard verification call to confirm the transaction was policyholder-initiated before closing the case.",
    "Recommend reviewing the last three account statements alongside this transaction before making a disposition decision.",
  ];
  const RECOMMENDATIONS_LOW = [
    "Recommend logging the observation; no immediate analyst action required unless further signals emerge.",
    "Recommend monitoring the account for a repeat of this pattern over the next cycle before any action is taken.",
  ];

  function confidenceFor(score) {
    const base = 62 + score * 6;
    const jitter = Math.round((Math.random() - 0.3) * 12);
    return Fmt.clamp(base + jitter, 58, 98);
  }

  function recommendationFor(score) {
    if (score >= 4) return pick(RECOMMENDATIONS_HIGH);
    if (score === 3) return pick(RECOMMENDATIONS_MED);
    return pick(RECOMMENDATIONS_LOW);
  }

  function generate(caseFull) {
    const c = caseFull.case;
    const ph = caseFull.policyholder;
    const txn = caseFull.transaction;
    const vars = {
      name: Fmt.maskName(ph.name),
      product: ph.productType.name,
      tenure: ph.tenureYears,
      score: c.riskScore,
      city: txn.city,
      state: txn.state,
      factorCount: c.contributingFactors.length,
      "riskProfile.lower": ph.riskProfile.toLowerCase(),
    };

    function fill(str) {
      return str.replace(/\{([\w.]+)\}/g, (_, key) => vars[key] ?? "");
    }

    const opener = fill(pick(OPENERS));
    const factorSentences = c.contributingFactors.map((f) => {
      const pool = FACTOR_SENTENCES[f.scenarioId] || FACTOR_SENTENCES.BEHAVIOURAL_DEVIATION;
      return fill(pick(pool)).replace("{pct}", f.weightPct);
    });
    const context = fill(pick(CONTEXT_SENTENCES));
    const recommendation = fill(recommendationFor(c.riskScore));

    const summary = [opener, ...factorSentences, context].join(" ");
    const confidence = confidenceFor(c.riskScore);

    return { summary, recommendation, confidence, generatedAt: new Date().toISOString() };
  }

  /**
   * Reveals `text` into `el` word-by-word to simulate LLM token streaming.
   * Returns a controller so callers can cancel on regenerate/navigation.
   */
  function streamText(el, text, opts) {
    const o = opts || {};
    const speed = o.speed || 18; // ms per word
    const words = text.split(" ");
    let i = 0;
    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    el.appendChild(cursor);

    let cancelled = false;
    let timer = null;

    function step() {
      if (cancelled) return;
      if (i >= words.length) {
        cursor.remove();
        if (o.onDone) o.onDone();
        return;
      }
      const chunk = words.slice(i, i + 2).join(" ") + " ";
      i += 2;
      cursor.insertAdjacentText("beforebegin", chunk);
      if (o.onTick) o.onTick(i / words.length);
      timer = setTimeout(step, speed + Math.random() * 22);
    }
    step();

    return {
      cancel() { cancelled = true; if (timer) clearTimeout(timer); cursor.remove(); },
    };
  }

  window.SentinelAI = { generate, streamText };
})();
