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
        <h2 className="font-[family-name:var(--chrome-font-display)] text-[20px] text-[var(--chrome-fg)]">
          Generated CSS
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center h-8 px-3 rounded-full border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center h-8 px-3 rounded-full border border-[var(--chrome-border)] text-[12px] text-[var(--chrome-fg)] hover:border-[var(--chrome-border-strong)]"
          >
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      <pre
        className={`text-[11px] font-[family-name:var(--chrome-font-mono)] text-[var(--chrome-fg)] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] rounded-[10px] p-4 overflow-x-auto leading-relaxed whitespace-pre transition-all ${
          open ? "max-h-[640px] overflow-y-auto" : "max-h-[160px] overflow-hidden"
        }`}
      >
        {css}
      </pre>
    </div>
  );
}
