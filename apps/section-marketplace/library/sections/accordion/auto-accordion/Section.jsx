"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { buttonClass } from "../../../../lib/styleguide-defaults.js";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

// ----- Default content -----------------------------------------------------

export const DEFAULT_ITEMS = [
  {
    eyebrow: "Template item",
    heading: "First accordion item",
    subheading: "Short supporting line",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed lorem facilisis aliquet.",
    image: "",
    linkLabel: "Learn more",
    linkHref: "#",
  },
  {
    eyebrow: "Template item",
    heading: "Second accordion item",
    subheading: "Another supporting line",
    description:
      "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui.",
    image: "",
    linkLabel: "Learn more",
    linkHref: "#",
  },
];

// ----- Percent → concrete mappers -----------------------------------------
// Per PANEL_RULES.md (rule 4) the section owns these mappings.

// Time per item: 0% = 2000ms (snappy), 50% = 5000ms (designer baseline), 100% = 12000ms (slow).
function pctToAutoAdvanceMs(pct) {
  const p = clamp(pct, 0, 100);
  return Math.round(2000 + (p / 100) * (12000 - 2000));
}
// Reveal speed slider: higher % = faster reveal.
// 0% = 1200ms (slow), 50% = 600ms (designer baseline), 100% = 200ms (snap).
function pctToRevealMs(pct) {
  const p = clamp(pct, 0, 100);
  return Math.round(1200 - (p / 100) * (1200 - 200));
}
function clamp(n, lo, hi) {
  if (typeof n !== "number" || Number.isNaN(n)) return (lo + hi) / 2;
  return Math.min(hi, Math.max(lo, n));
}

// ----- Component -----------------------------------------------------------

export default function AutoAccordion({
  // Visible text content. Edited inline on the canvas (no panel field).
  eyebrow = "Featured",
  heading = "Explore the highlights.",
  // Panel-controlled
  styleVariant = "default",
  animationStyle = "slide",
  linkButtonVariant,
  autoAdvancePct = 50,
  revealPct = 50,
  items = DEFAULT_ITEMS,
  // Builder-only props (see PANEL_RULES.md rule 10)
  _editing = false,
  _onPropChange,
} = {}) {
  const safeItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  const bodyContentRefs = useRef([]);
  const imageRefs = useRef([]);
  const progressRefs = useRef([]);
  const progressTweenRef = useRef(null);
  const advanceTimerRef = useRef(null);
  const revealTweensRef = useRef([]);

  const setBodyContentRef = useCallback((el, i) => {
    if (el) bodyContentRefs.current[i] = el;
  }, []);
  const setImageRef = useCallback((el, i) => {
    if (el) imageRefs.current[i] = el;
  }, []);
  const setProgressRef = useCallback((el, i) => {
    if (el) progressRefs.current[i] = el;
  }, []);

  const autoAdvanceMs = pctToAutoAdvanceMs(autoAdvancePct);
  const revealMs = pctToRevealMs(revealPct);

  // Rule 6: changing animationStyle restarts the section from item 0.
  useEffect(() => {
    setActiveIndex(0);
    setIsAuto(true);
  }, [animationStyle]);

  // Reveal animation for the active item's body content (opacity / transform only).
  // Height is handled by CSS grid-template-rows transition on the wrapper.
  useEffect(() => {
    revealTweensRef.current.forEach((t) => t.kill());
    revealTweensRef.current = [];

    bodyContentRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIndex;
      const dur = Math.max(0.1, revealMs / 1000);

      if (isActive) {
        gsap.set(el, getRevealFromVars(animationStyle));
        const tween = gsap.to(el, {
          ...getRevealToVars(animationStyle),
          duration: dur,
          ease: "power2.out",
        });
        revealTweensRef.current.push(tween);
      } else {
        gsap.set(el, { opacity: 0, y: 0, scale: 1 });
      }
    });

    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIndex;
      gsap.to(el, {
        opacity: isActive ? 1 : 0,
        duration: Math.max(0.15, revealMs / 1000),
        ease: "power2.out",
      });
    });

    return () => {
      revealTweensRef.current.forEach((t) => t.kill());
      revealTweensRef.current = [];
    };
  }, [activeIndex, animationStyle, revealMs, safeItems.length]);

  // Auto-advance + progress bar
  useEffect(() => {
    if (progressTweenRef.current) progressTweenRef.current.kill();
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    progressRefs.current.forEach((el) => {
      if (el) gsap.set(el, { width: "0%" });
    });

    if (!isAuto) return;

    const current = progressRefs.current[activeIndex];
    if (current) {
      progressTweenRef.current = gsap.fromTo(
        current,
        { width: "0%" },
        {
          width: "100%",
          duration: Math.max(0.2, autoAdvanceMs / 1000),
          ease: "linear",
        }
      );
    }

    advanceTimerRef.current = setTimeout(() => {
      setActiveIndex((i) => (i + 1) % safeItems.length);
    }, autoAdvanceMs);

    return () => {
      if (progressTweenRef.current) progressTweenRef.current.kill();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [activeIndex, autoAdvanceMs, isAuto, safeItems.length]);

  const handleItemClick = (i) => {
    if (i === activeIndex) {
      setIsAuto((v) => !v);
      return;
    }
    setIsAuto(false);
    setActiveIndex(i);
  };

  // Persist a top-level prop change.
  const persistTop = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  const rootClass = `${styles.root} ${styles[styleVariant] ?? ""}`.trim();

  return (
    <section className={rootClass}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <EditableText
            as="p"
            value={eyebrow}
            editing={_editing}
            onChange={(v) => persistTop("eyebrow", v)}
            className={styles.eyebrow}
            placeholder="Eyebrow"
          />
          <EditableText
            as="h2"
            value={heading}
            editing={_editing}
            multiline
            onChange={(v) => persistTop("heading", v)}
            className={styles.heading}
            placeholder="Section heading"
          />
        </header>

        <div className={styles.grid}>
          <ol className={styles.list}>
            {safeItems.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <li
                  key={i}
                  className={`${styles.row} ${isActive ? styles.open : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick(i)}
                    className={styles.head}
                    aria-expanded={isActive}
                  >
                    <span className={styles.region}>
                      {item.eyebrow ?? item.region ?? ""}
                    </span>
                    <span className={styles.title}>
                      {item.heading ?? item.title ?? ""}
                    </span>
                  </button>

                  <div className={styles.body}>
                    <div className={styles.bodyInner}>
                      <div
                        ref={(el) => setBodyContentRef(el, i)}
                        className={styles.bodyContent}
                      >
                        <p className={styles.location}>
                          {item.subheading ?? item.location ?? ""}
                        </p>
                        <p className={styles.description}>
                          {item.description ?? ""}
                        </p>
                        {item.linkHref || _editing ? (
                          <a
                            href={item.linkHref || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={
                              linkButtonVariant
                                ? `${styles.link} ${buttonClass(linkButtonVariant)}`
                                : styles.link
                            }
                            onClick={(e) => {
                              if (_editing) e.preventDefault();
                            }}
                          >
                            <span>{item.linkLabel ?? ""}</span>
                            <span aria-hidden>→</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className={styles.progressTrack}>
                    <div
                      ref={(el) => setProgressRef(el, i)}
                      className={styles.progressFill}
                    />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className={styles.imageHolder}>
            {safeItems.map((item, i) => (
              <div
                key={i}
                ref={(el) => setImageRef(el, i)}
                className={styles.image}
              >
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" />
                ) : (
                  <span>Upload image</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function getRevealFromVars(style) {
  switch (style) {
    case "fade":
      return { opacity: 0, y: 0, scale: 1 };
    case "scale":
      return { opacity: 0, y: 0, scale: 0.96 };
    case "slide":
    default:
      return { opacity: 0, y: 12, scale: 1 };
  }
}

function getRevealToVars(style) {
  switch (style) {
    case "fade":
      return { opacity: 1 };
    case "scale":
      return { opacity: 1, scale: 1 };
    case "slide":
    default:
      return { opacity: 1, y: 0 };
  }
}
