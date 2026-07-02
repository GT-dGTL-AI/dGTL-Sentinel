/**
 * Runtime ID generation for entities created during the demo session
 * (notes, history entries, toasts) — distinct from the deterministic
 * seed IDs generated at dataset build time.
 */
(function () {
  let counter = 0;

  function nextId(prefix) {
    counter += 1;
    return `${prefix}-${Date.now().toString(36)}-${counter}`;
  }

  window.SentinelId = { nextId };
})();
