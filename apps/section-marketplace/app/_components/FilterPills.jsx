"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

function pillClass(active) {
  return `inline-flex items-center h-8 px-3 rounded-(--chrome-radius-pill) border text-[12px] transition-colors ${
    active
      ? "bg-(--chrome-fg) border-(--chrome-fg) text-(--chrome-fg-inverse)"
      : "bg-(--chrome-surface) border-(--chrome-border) text-(--chrome-fg-muted) hover:border-(--chrome-border-strong) hover:text-(--chrome-fg)"
  }`;
}

export default function FilterPills({ facets }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const current = useMemo(
    () => ({
      category: params.get("category") ?? "",
      track: params.get("track") ?? "",
      lifecycle: params.get("lifecycle") ?? "",
      q: params.get("q") ?? "",
    }),
    [params]
  );

  const setParam = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (!value || current[key] === value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `/library?${qs}` : "/library"));
  };

  return (
    <div className="flex flex-col gap-3">
      <Row label="Category">
        {facets.categories.map((c) => (
          <button
            key={c}
            onClick={() => setParam("category", c)}
            className={pillClass(current.category === c)}
          >
            {c}
          </button>
        ))}
      </Row>
      <Row label="Track">
        {facets.tracks.map((t) => (
          <button
            key={t}
            onClick={() => setParam("track", t)}
            className={pillClass(current.track === t)}
          >
            {t}
          </button>
        ))}
      </Row>
      <Row label="Lifecycle">
        {facets.lifecycles.map((l) => (
          <button
            key={l}
            onClick={() => setParam("lifecycle", l)}
            className={pillClass(current.lifecycle === l)}
          >
            {l}
          </button>
        ))}
      </Row>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 mt-1.5 text-[11px] uppercase tracking-[0.08em] text-(--chrome-fg-subtle) w-[72px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
