"use client";

import { useState } from "react";

export default function CssExport({ css }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="border-t border-[var(--chrome-border)] mt-12 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="app-subtitle">
          Generated CSS
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="btn-chrome btn-chrome--ghost btn-chrome--sm"
          >
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      <pre
        className={`overflow-x-auto whitespace-pre rounded-[0.25rem] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-4 font-[family-name:var(--chrome-font-mono)] text-[16px] leading-relaxed text-[var(--chrome-fg)] transition-all ${
          open ? "max-h-[640px] overflow-y-auto" : "max-h-[160px] overflow-hidden"
        }`}
      >
        {css}
      </pre>
    </div>
  );
}
