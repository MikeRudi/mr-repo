"use client";

import { useEffect, useRef } from "react";

// Three vertical columns, each containing tiles that scroll with offset speeds.
// Effect family: madewithgsap.com parallax columns / Locomotive-style stagger.
// Implementation: GSAP ScrollTrigger; gracefully degrades when GSAP fails to
// load (e.g. SSR, prefers-reduced-motion).

const TILES = [
  // [aspect, hue]
  ["3/4", "#0f1216"],
  ["1/1", "#1a1d22"],
  ["4/5", "#22272d"],
  ["3/4", "#2c8a5a"],
  ["1/1", "#b07a1f"],
  ["4/5", "#0f1216"],
  ["3/4", "#1a1d22"],
  ["1/1", "#22272d"],
  ["4/5", "#0f1216"],
];

const COLS = [
  { offset: 0, items: TILES.slice(0, 3) },
  { offset: -80, items: TILES.slice(3, 6) },
  { offset: -40, items: TILES.slice(6, 9) },
];

export default function GalleryParallaxColumns({
  eyebrow = "Selected work",
  heading = "A year of projects, one column at a time.",
} = {}) {
  const sectionRef = useRef(null);
  const colRefs = useRef([]);

  useEffect(() => {
    let mounted = true;
    let cleanups = [];

    (async () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduce.matches) return;

      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        if (!mounted) return;

        const gsap = gsapMod.gsap ?? gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
        gsap.registerPlugin(ScrollTrigger);

        colRefs.current.forEach((el, i) => {
          if (!el) return;
          const offset = i === 1 ? 160 : i === 2 ? 80 : 40;
          const tween = gsap.fromTo(
            el,
            { y: 0 },
            {
              y: -offset,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });
      } catch {
        // GSAP unavailable; static layout still renders.
      }
    })();

    return () => {
      mounted = false;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-(--chrome-surface-inverse) text-(--chrome-fg-inverse) overflow-hidden"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-24 lg:pt-28 pb-16 lg:pb-24">
        <p
          data-sg-prop="eyebrow"
          className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-inverse)/60"
        >
          {eyebrow}
        </p>
        <h2
          data-sg-prop="heading"
          className="mt-3 font-[family-name:var(--chrome-font-display)] text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.01em] max-w-[720px]"
        >
          {heading}
        </h2>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pb-24 lg:pb-32 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {COLS.map((col, i) => (
          <div
            key={i}
            ref={(el) => (colRefs.current[i] = el)}
            className="flex flex-col gap-5 will-change-transform"
            style={{ marginTop: i === 1 ? "8%" : i === 2 ? "4%" : 0 }}
          >
            {col.items.map(([aspect, hue], j) => (
              <div
                key={j}
                className="rounded-(--chrome-radius-card) border border-white/5 grid place-items-center text-white/30 font-[family-name:var(--chrome-font-mono)] text-[11px]"
                style={{
                  background: hue,
                  aspectRatio: aspect,
                }}
              >
                tile · {i + 1}.{j + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
