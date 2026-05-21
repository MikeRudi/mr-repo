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
    <div
      className={`sticky top-0 z-40 w-full transition-all duration-300 ease-out ${
        elevated ? "translate-y-0" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`mx-auto max-w-[1080px] px-4 flex items-center justify-between h-16 ${
          elevated
            ? "bg-(--chrome-ground)/85 border-b border-(--chrome-border) backdrop-blur"
            : "bg-(--chrome-ground)/40 border-b border-transparent"
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
  );
}
