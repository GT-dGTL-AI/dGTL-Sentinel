/**
 * dGTL Sentinel — toast notification system.
 */
(function () {
  const Icons = window.SentinelIcons;
  let stack = null;

  function ensureStack() {
    if (stack && stack.isConnected) return stack;
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
    return stack;
  }

  const ICON_BY_TYPE = { success: "check-circle", error: "x-circle", info: "info" };

  function show(opts) {
    const o = typeof opts === "string" ? { title: opts } : opts;
    const type = o.type || "info";
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast__icon">${Icons.icon(ICON_BY_TYPE[type], { size: 20 })}</span>
      <div>
        <div class="toast__title">${o.title}</div>
        ${o.description ? `<div class="toast__desc">${o.description}</div>` : ""}
      </div>
      <button class="toast__close" aria-label="Dismiss">${Icons.icon("x", { size: 15 })}</button>
    `;
    ensureStack().appendChild(el);

    const remove = () => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 220);
    };
    el.querySelector(".toast__close").addEventListener("click", remove);
    setTimeout(remove, o.duration || 4200);
  }

  window.SentinelToast = {
    show,
    success: (title, description) => show({ type: "success", title, description }),
    error: (title, description) => show({ type: "error", title, description }),
    info: (title, description) => show({ type: "info", title, description }),
  };
})();
