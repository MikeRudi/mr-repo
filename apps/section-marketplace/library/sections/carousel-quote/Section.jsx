"use client";

import { useEffect, useState } from "react";

const DEFAULT_QUOTES = [
  {
    quote:
      "The judgement on small things — the spacing, the type, the moments of motion — is what sets their work apart.",
    author: "Tomás Reyes",
    role: "Creative Director, Field Notes",
  },
  {
    quote:
      "We hand them ambition and they hand back a launch we can be proud of for the next four years.",
    author: "Maya Chen",
    role: "VP Marketing, Lattice",
  },
  {
    quote:
      "It feels like the studio that takes the brief seriously, but never solemn. Rare combination.",
    author: "Anya Petrov",
    role: "Head of Brand, North & Co.",
  },
  {
    quote:
      "Twelve country sites, one design system, no rebuild after eighteen months. That's the proof.",
    author: "Lukas Berg",
    role: "Director of Engineering, Pact",
  },
];

export default function CarouselQuote({
  eyebrow = "Praise",
  items = DEFAULT_QUOTES,
  intervalMs = 5500,
} = {}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [paused, items.length, intervalMs]);

  return (
    <section
      className="bg-(--chrome-surface-muted) text-(--chrome-fg)"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-32">
        <p
          data-sg-prop="eyebrow"
          className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)"
        >
          {eyebrow}
        </p>
        <div className="relative mt-6 min-h-[260px] sm:min-h-[220px]">
          {items.map((item, i) => {
            const active = i === index;
            return (
              <figure
                key={i}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  active ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <blockquote
                  data-sg-prop="items"
                  data-sg-index={i}
                  data-sg-sub="quote"
                  className="font-[family-name:var(--chrome-font-display)] text-[clamp(28px,4vw,52px)] leading-[1.1] tracking-[-0.01em] text-(--chrome-fg) max-w-[920px]"
                >
                  <span aria-hidden className="text-(--chrome-fg-subtle)">“</span>
                  {item.quote}
                  <span aria-hidden className="text-(--chrome-fg-subtle)">”</span>
                </blockquote>
                <figcaption className="mt-6 text-[13px] text-(--chrome-fg-muted)">
                  <span
                    data-sg-prop="items"
                    data-sg-index={i}
                    data-sg-sub="author"
                    className="text-(--chrome-fg) font-medium"
                  >
                    {item.author}
                  </span>
                  <span aria-hidden> · </span>
                  <span data-sg-prop="items" data-sg-index={i} data-sg-sub="role">
                    {item.role}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Quote carousel">
            {items.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show quote ${i + 1} of ${items.length}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    active
                      ? "w-8 bg-(--chrome-fg)"
                      : "w-2 bg-(--chrome-fg)/30 hover:bg-(--chrome-fg)/60"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-[11px] font-[family-name:var(--chrome-font-mono)] text-(--chrome-fg-subtle) tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
