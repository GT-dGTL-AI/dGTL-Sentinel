/**
 * dGTL Sentinel — export helpers (FR-6.3).
 * CSV export is a real client-side file download. PDF export renders a
 * print-formatted document via the browser's native print-to-PDF path —
 * both work fully offline with no server round-trip.
 */
(function () {
  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function toCsvValue(v) {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function exportCsv(filename, headers, rows) {
    const lines = [headers.join(",")];
    rows.forEach((row) => lines.push(row.map(toCsvValue).join(",")));
    downloadBlob(lines.join("\n"), filename, "text/csv;charset=utf-8;");
  }

  function exportPdfReport(title, sectionsHtml) {
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: Inter, -apple-system, Segoe UI, Arial, sans-serif; color:#1C1826; padding: 40px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { color:#726C84; font-size: 12px; margin-bottom: 24px; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color:#6428A8; margin: 28px 0 10px; }
        table { width:100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px; }
        th, td { text-align:left; padding: 6px 10px; border-bottom: 1px solid #E4E2EA; }
        th { color:#726C84; text-transform: uppercase; font-size: 10px; }
        .brand { display:flex; align-items:center; gap:8px; margin-bottom: 18px; }
        .brand-mark { width: 26px; height: 26px; border-radius:7px; background: linear-gradient(135deg,#9A6BD6,#6428A8); }
        .brand-name { font-weight:700; font-size: 15px; }
      </style></head><body>
        <div class="brand"><div class="brand-mark"></div><div class="brand-name">dGTL Sentinel</div></div>
        <h1>${title}</h1>
        <div class="meta">Generated ${new Date().toLocaleString("en-IN")} · Confidential — Demo Dataset</div>
        ${sectionsHtml}
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  window.SentinelExport = { exportCsv, exportPdfReport, downloadBlob };
})();
