"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "../../../lib/styleguide-defaults.js";

const DEFAULT_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Process", href: "#process" },
  { label: "Journal", href: "#journal" },
];

export default function NavigationFloatingBar({
  brand = "MakeReign",
  links = DEFAULT_LINKS,
  cta = { label: "Start a project", href: "#", variant: "primary" },
} = {}) {
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="bg-(--chrome-surface-muted) text-(--chrome-fg) min-h-[640px] relative">
      <div
        className={`sticky top-4 z-40 mx-auto max-w-[1080px] px-3 transition-all duration-300 ease-out ${
          elevated ? "translate-y-0" : "translate-y-2"
        }`}
      >
        <nav
          aria-label="Primary"
          className={`flex items-center justify-between h-14 px-4 rounded-(--chrome-radius-pill) backdrop-blur transition-all ${
            elevated
              ? "bg-(--chrome-ground)/85 border border-(--chrome-border) shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
              : "bg-(--chrome-ground)/40 border border-transparent"
          }`}
        >
          <a href="#" className="flex items-center gap-2 font-[family-name:var(--chrome-font-display)] text-[15px] text-(--chrome-fg)">
            <span
              aria-hidden
              className="inline-grid place-items-center size-7 rounded-(--chrome-radius-2) bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[13px]"
            >
              {brand.slice(0, 1)}
            </span>
            {brand}
          </a>
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="inline-flex items-center h-9 px-3 rounded-(--chrome-radius-pill) text-[13px] text-(--chrome-fg-muted) hover:text-(--chrome-fg) hover:bg-(--chrome-surface)/80 transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={cta.href}
            className={buttonClass(cta.variant)}
          >
            {cta.label}
          </a>
        </nav>
      </div>

      <div className="mx-auto max-w-[1080px] px-6 lg:px-10 pt-32 pb-32">
        <p className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)">
          Scroll demo
        </p>
        <p className="mt-4 font-[family-name:var(--chrome-font-display)] text-[clamp(28px,3.6vw,48px)] leading-[1.1] tracking-[-0.01em] text-(--chrome-fg) max-w-[820px]">
          Scroll the preview to see the bar lift off the page — the background
          fades in, the border appears, the soft shadow drops.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Editorial type", "Considered motion", "Design systems"].map((t) => (
            <div
              key={t}
              className="h-44 rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) p-5 flex items-end"
            >
              <span className="text-[13px] text-(--chrome-fg-muted)">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
