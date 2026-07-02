/**
 * dGTL Sentinel — generic modal helper.
 */
(function () {
  const Icons = window.SentinelIcons;
  let activeOverlay = null;

  function close() {
    if (!activeOverlay) return;
    activeOverlay.remove();
    activeOverlay = null;
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  /**
   * open({ title, bodyHtml, size, footerButtons: [{label, variant, onClick, close}] })
   * Returns the modal root element so callers can query/bind inside it.
   */
  function open(opts) {
    close();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal ${opts.size === "lg" ? "modal--lg" : ""}" role="dialog" aria-modal="true" aria-label="${opts.title}">
        <div class="modal__header">
          <h3 class="modal__title">${opts.title}</h3>
          <button class="icon-btn modal__close" aria-label="Close">${Icons.icon("x", { size: 18 })}</button>
        </div>
        <div class="modal__body">${opts.bodyHtml}</div>
        <div class="modal__footer"></div>
      </div>
    `;
    const footer = overlay.querySelector(".modal__footer");
    (opts.footerButtons || []).forEach((btn) => {
      const b = document.createElement("button");
      b.className = `btn btn--${btn.variant || "secondary"}`;
      b.textContent = btn.label;
      b.addEventListener("click", () => {
        if (btn.onClick) btn.onClick(overlay);
        if (btn.close !== false) close();
      });
      footer.appendChild(b);
    });
    if (!opts.footerButtons) footer.remove();

    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".modal__close").addEventListener("click", close);
    document.addEventListener("keydown", onKeydown);

    document.body.appendChild(overlay);
    activeOverlay = overlay;
    return overlay;
  }

  window.SentinelModal = { open, close };
})();
