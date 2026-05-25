"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

function pillClass() {
  return "app-label-button";
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
            aria-pressed={current.category === c}
          >
            {toTitleCase(c)}
          </button>
        ))}
      </Row>
      <Row label="Track">
        {facets.tracks.map((t) => (
          <button
            key={t}
            onClick={() => setParam("track", t)}
            className={pillClass(current.track === t)}
            aria-pressed={current.track === t}
          >
            {toTitleCase(t)}
          </button>
        ))}
      </Row>
      <Row label="Lifecycle">
        {facets.lifecycles.map((l) => (
          <button
            key={l}
            onClick={() => setParam("lifecycle", l)}
            className={pillClass(current.lifecycle === l)}
            aria-pressed={current.lifecycle === l}
          >
            {l}
          </button>
        ))}
      </Row>
    </div>
  );
}

function toTitleCase(s) {
  if (!s) return s;
  return s
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="app-eyebrow mt-2 w-[92px] shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
