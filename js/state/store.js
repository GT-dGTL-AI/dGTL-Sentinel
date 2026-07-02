/**
 * dGTL Sentinel — minimal persistence + pub/sub layer.
 * Wraps localStorage (session-scoped "backend") and provides an
 * in-memory event bus for same-page reactivity across components.
 */
(function () {
  const PREFIX = "sentinel_v1_";

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) { /* storage unavailable — demo continues in-memory only */ }
    return value;
  }

  function update(key, updater, fallback) {
    const current = get(key, fallback);
    const next = updater(current);
    set(key, next);
    return next;
  }

  function remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch (e) { /* noop */ }
  }

  function reset() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }

  const listeners = {};
  const bus = {
    on(event, cb) {
      (listeners[event] = listeners[event] || []).push(cb);
      return () => bus.off(event, cb);
    },
    off(event, cb) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((fn) => fn !== cb);
    },
    emit(event, payload) {
      (listeners[event] || []).forEach((fn) => fn(payload));
    },
  };

  window.SentinelStore = { get, set, update, remove, reset, bus };
})();
