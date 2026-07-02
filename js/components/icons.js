/**
 * dGTL Sentinel — inline SVG icon set (stroke-based, Lucide-style).
 * Hand-rolled with primitive shapes so the app has zero external
 * icon-font/CDN dependency and works fully offline.
 */
(function () {
  const BODIES = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    inbox: '<path d="M3 12h4l2 3h6l2-3h4"/><path d="M5.5 5h13L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6L5.5 5Z"/>',
    "bar-chart": '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="10" width="3.2" height="8" rx="0.8"/><rect x="10.4" y="6" width="3.2" height="12" rx="0.8"/><rect x="14.8" y="13" width="3.2" height="5" rx="0.8"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    "chevron-down": '<polyline points="6 9 12 15 18 9"/>',
    "chevron-left": '<polyline points="15 18 9 12 15 6"/>',
    "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
    "chevrons-left": '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',
    menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-5.8 6-5.8s6 2.3 6 5.8"/><circle cx="17.5" cy="8.5" r="2.6"/><path d="M15.6 14.4c2.9.3 4.9 2.4 4.9 5.6"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><polyline points="8.5 12.5 11 15 15.5 9"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',
    "alert-triangle": '<path d="M12 3 2 20h20L12 3Z"/><line x1="12" y1="10" x2="12" y2="14.5"/><circle cx="12" cy="17.3" r="0.4"/>',
    shield: '<path d="M12 3 4.5 6v6c0 5 3.2 7.7 7.5 9 4.3-1.3 7.5-4 7.5-9V6L12 3Z"/>',
    "shield-check": '<path d="M12 3 4.5 6v6c0 5 3.2 7.7 7.5 9 4.3-1.3 7.5-4 7.5-9V6L12 3Z"/><polyline points="9 12 11.3 14.3 15.5 10"/>',
    "trending-up": '<polyline points="3 17 9.5 10.5 14 15 21 7"/><polyline points="15 7 21 7 21 13"/>',
    "trending-down": '<polyline points="3 7 9.5 13.5 14 9 21 17"/><polyline points="15 17 21 17 21 11"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
    filter: '<polygon points="4 4 20 4 14 12.5 14 19 10 21 10 12.5 4 4"/>',
    download: '<path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
    upload: '<path d="M12 21V9"/><polyline points="7 13 12 8 17 13"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
    "more-horizontal": '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    "arrow-right": '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
    "arrow-left": '<line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 6 4 12 10 18"/>',
    "arrow-up-right": '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/>',
    "sort-asc": '<line x1="4" y1="18" x2="10" y2="18"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="6" x2="18" y2="6"/><polyline points="17 15 20 18 23 15" transform="translate(-3 0)"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/><circle cx="12" cy="12" r="2.4"/>',
    "refresh-cw": '<polyline points="17 2.5 17 7 12.5 7"/><path d="M4 12a8 8 0 0 1 14-5.2l-1 1.7"/><polyline points="7 21.5 7 17 11.5 17"/><path d="M20 12a8 8 0 0 1-14 5.2l1-1.7"/>',
    "message-square": '<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.3-4.6A8 8 0 1 1 21 12Z"/>',
    history: '<path d="M3 3v6h6"/><path d="M3.5 13a8.5 8.5 0 1 0 2.4-6.3L3 9.3"/><polyline points="12 8 12 13 16 15"/>',
    smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.2"/><line x1="10.5" y1="18.3" x2="13.5" y2="18.3"/>',
    globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
    "map-pin": '<path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/>',
    calendar: '<rect x="3.5" y="4.5" width="17" height="16" rx="2"/><line x1="3.5" y1="9.5" x2="20.5" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/>',
    briefcase: '<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"/>',
    "credit-card": '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><line x1="2.5" y1="10" x2="21.5" y2="10"/>',
    activity: '<polyline points="3 12 8 12 10.5 5 14 19 16.5 12 21 12"/>',
    layers: '<polygon points="12 3 21 8.5 12 14 3 8.5 12 3"/><polyline points="3 14 12 19.5 21 14"/>',
    zap: '<polygon points="12 2 4 14 11 14 10 22 20 9 13 9 12 2"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h13l-3 4.5L18 13H5"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.3"/><line x1="8" y1="7.5" x2="8" y2="7.6"/><line x1="12" y1="7.5" x2="12" y2="7.6"/><line x1="16" y1="7.5" x2="16" y2="7.6"/><line x1="8" y1="11.5" x2="8" y2="11.6"/><line x1="12" y1="11.5" x2="12" y2="11.6"/><line x1="16" y1="11.5" x2="16" y2="11.6"/><line x1="9" y1="21" x2="9" y2="16.5"/><line x1="15" y1="21" x2="15" y2="16.5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="1.8"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M3 3l18 18"/><path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a13.3 13.3 0 0 1-3.2 4.1M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8"/><path d="M9.5 9.7a3 3 0 0 0 4.2 4.2"/>',
    "file-text": '<path d="M6 2.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V4A1.5 1.5 0 0 1 6 2.5Z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="8" y1="8" x2="11" y2="8"/>',
    printer: '<path d="M6 9V3.5h12V9"/><rect x="3.5" y="9" width="17" height="8" rx="1.5"/><path d="M6 17v3.5h12V17"/>',
    "circle-dot": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
    "pause-circle": '<circle cx="12" cy="12" r="9"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/>',
    "user-check": '<circle cx="9" cy="8" r="4"/><path d="M2.5 21c0-4.4 2.9-7 6.5-7s6.5 2.6 6.5 7"/><polyline points="17 11 19 13 22.5 8.5"/>',
    "arrow-up-down": '<polyline points="8 3 8 21"/><polyline points="5 6 8 3 11 6"/><polyline points="16 21 16 3"/><polyline points="19 18 16 21 13 18"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="8" r="0.4"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/>',
  };

  function iconMarkup(name, size, strokeWidth) {
    const body = BODIES[name] || BODIES["circle-dot"];
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function icon(name, opts) {
    const o = opts || {};
    return iconMarkup(name, o.size || 20, o.strokeWidth || 2);
  }

  window.SentinelIcons = { icon, list: Object.keys(BODIES) };
})();
