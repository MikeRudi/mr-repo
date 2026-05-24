"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { buttonClass } from "../../../../lib/styleguide-defaults.js";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

// ----- Default content -----------------------------------------------------

export const DEFAULT_ITEMS = [
  {
    region: "North America",
    title: "Escape Lounges",
    location: "Concourse A, Kansas City MO International, United States",
    description:
      "An elevated, modern lounge bringing a premium experience to a growing airport. It offers travellers all-day dining, a full-service bar, and flexible spaces designed to support both relaxation and productivity throughout the journey.",
    image:
      "/webflow/images/000.-Hero_SELECT-Escape-Lounge-Bar--Nicole-Bissey-Photography-1.webp",
    linkLabel: "View lounge",
    linkHref:
      "https://www.prioritypass.com/en-GB/lounges/united-states-of-america/kansas-city-international/mci-escape-lounges",
  },
  {
    region: "Latin America & the Caribbean",
    title: "Advantage VIP Lounge",
    location: "Terminal 1 Domestic, Campinas Viracopos International, Brazil",
    description:
      "A welcoming, design-led lounge that elevates the regional airport experience with thoughtful service, calming spaces, and a generous spread of food and drink throughout the day.",
    image: "/webflow/images/000.-Hero_Sala-VIP_Advantage-6-1.webp",
    linkLabel: "View lounge",
    linkHref: "#",
  },
  {
    region: "EMEA",
    title: "No.1 Lounge Jersey",
    location: "Jersey Airport, Jersey",
    description:
      "A boutique-feel lounge that balances quiet relaxation with a sense of place. Local sourcing, attentive hosts, and a measured pace make it a standout in the regional EMEA network.",
    image: "/webflow/images/000.-Hero_Canon-0149-2-1.webp",
    linkLabel: "View lounge",
    linkHref: "#",
  },
  {
    region: "Asia Pacific",
    title: "Kyra Lounge",
    location: "Terminal 1, Hong Kong Chek Lap Kok International, Hong Kong",
    description:
      "A contemporary lounge in one of the world's busiest hubs. Considered design, layered lighting, and a generous F&B programme give travellers a calm anchor between flights.",
    image: "/webflow/images/000.-Hero_Kyra-Lounge-3-1.webp",
    linkLabel: "View lounge",
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
  eyebrow = "Highly Commended Lounges 2026",
  heading = "Recognising exceptional service and experiences for Priority Pass Members.",
  // Panel-controlled
  styleVariant = "default",
  animationStyle = "slide",
  linkButtonVariant = "primary",
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

  // Persist an item field change.
  const persistItem = (index, field, value) => {
    if (!_onPropChange) return;
    const next = safeItems.slice();
    next[index] = { ...next[index], [field]: value };
    _onPropChange("items", next);
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
                    <EditableText
                      as="span"
                      value={item.region ?? ""}
                      editing={_editing}
                      onChange={(v) => persistItem(i, "region", v)}
                      className={styles.region}
                      placeholder="Region"
                    />
                    <EditableText
                      as="span"
                      value={item.title ?? ""}
                      editing={_editing}
                      onChange={(v) => persistItem(i, "title", v)}
                      className={styles.title}
                      placeholder="Title"
                    />
                  </button>

                  <div className={styles.body}>
                    <div className={styles.bodyInner}>
                      <div
                        ref={(el) => setBodyContentRef(el, i)}
                        className={styles.bodyContent}
                      >
                        <EditableText
                          as="p"
                          value={item.location ?? ""}
                          editing={_editing}
                          multiline
                          onChange={(v) => persistItem(i, "location", v)}
                          className={styles.location}
                          placeholder="Location"
                        />
                        <EditableText
                          as="p"
                          value={item.description ?? ""}
                          editing={_editing}
                          multiline
                          onChange={(v) => persistItem(i, "description", v)}
                          className={styles.description}
                          placeholder="Description"
                        />
                        {item.linkHref || _editing ? (
                          <a
                            href={item.linkHref || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`${styles.link} ${buttonClass(linkButtonVariant)}`}
                            onClick={(e) => {
                              if (_editing) e.preventDefault();
                            }}
                          >
                            <EditableText
                              as="span"
                              value={item.linkLabel ?? ""}
                              editing={_editing}
                              onChange={(v) => persistItem(i, "linkLabel", v)}
                              placeholder="Link label"
                            />
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
              <img
                key={i}
                ref={(el) => setImageRef(el, i)}
                src={item.image}
                alt=""
                loading="lazy"
                className={styles.image}
              />
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
