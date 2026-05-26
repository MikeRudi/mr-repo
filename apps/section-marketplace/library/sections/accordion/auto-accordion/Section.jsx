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
// Per app-rules-ai/making-a-section/section-panel.md, the section owns these mappings.

// Panel sliders use 2x sensitivity: 25/75 reach the old edge values.
function amplifyPct(pct) {
  return clamp(50 + (pct - 50) * 2, 0, 100);
}
// Time per item: 25% = 2000ms (snappy), 50% = 5000ms (designer baseline), 75% = 12000ms (slow).
function pctToAutoAdvanceMs(pct) {
  const p = amplifyPct(pct);
  return Math.round(2000 + (p / 100) * (12000 - 2000));
}
// Reveal speed slider: higher % = faster reveal.
// 25% = 1200ms (slow), 50% = 600ms (designer baseline), 75% = 200ms (snap).
function pctToRevealMs(pct) {
  const p = amplifyPct(pct);
  return Math.round(1200 - (p / 100) * (1200 - 200));
}
// Section padding: 25% = 32px, 50% = 112px, 75% = 220px.
function pctToPaddingPx(pct) {
  const p = amplifyPct(pct);
  if (p <= 50) return Math.round(32 + (p / 50) * (112 - 32));
  return Math.round(112 + ((p - 50) / 50) * (220 - 112));
}
// Split: 25% = left 32% / right 68%, 50% = even, 75% = left 68% / right 32%.
function pctToLeftSplit(pct) {
  const p = amplifyPct(pct);
  return `${Math.round(32 + (p / 100) * (68 - 32))}%`;
}
function pctToRightSplit(pct) {
  const p = amplifyPct(pct);
  return `${Math.round(68 - (p / 100) * (68 - 32))}%`;
}
// Image height: 25% = 360px, 50% = 620px, 75% = 820px.
function pctToImageHeightPx(pct) {
  const p = amplifyPct(pct);
  if (p <= 50) return Math.round(360 + (p / 50) * (620 - 360));
  return Math.round(620 + ((p - 50) / 50) * (820 - 620));
}
// Compact spacing: 25% = min, 50% = baseline, 75% = roomy.
function pctToRangePx(pct, min, mid, max) {
  const p = amplifyPct(pct);
  if (p <= 50) return Math.round(min + (p / 50) * (mid - min));
  return Math.round(mid + ((p - 50) / 50) * (max - mid));
}
// Button scale: 25% = 75%, 50% = default, 75% = 150%.
function pctToButtonScale(pct) {
  const p = amplifyPct(pct);
  if (p <= 50) return 0.75 + (p / 50) * 0.25;
  return 1 + ((p - 50) / 50) * 0.5;
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
  animationStyle = "slide",
  autoEnabled = true,
  linkButtonVariant,
  linkButtonScalePct = 50,
  sectionPaddingYPct,
  sectionPaddingTopPct,
  sectionPaddingBottomPct,
  headerTextGapPct = 50,
  headerToAccordionGapPct = 50,
  itemHeadGapPct = 50,
  itemBodyGapPct = 50,
  itemPaddingYPct,
  itemBottomPaddingPct,
  splitPct = 50,
  imageHeightPct = 50,
  reverseLayout = false,
  sectionEyebrowColor = "dark",
  sectionHeadingColor = "dark",
  itemEyebrowColor = "dark",
  itemHeadingColor = "dark",
  itemSubheadingColor = "dark",
  itemDescriptionColor = "dark",
  progressColor = "dark",
  sectionEyebrowTypography = "textSmall",
  sectionHeadingTypography = "h2",
  itemEyebrowTypography = "textSmall",
  itemHeadingTypography = "h5",
  itemSubheadingTypography = "textMain",
  itemDescriptionTypography = "textSmall",
  autoAdvancePct = 50,
  revealPct = 50,
  items = DEFAULT_ITEMS,
  // Builder-only props (see app-rules-ai/making-a-section/section-panel.md)
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
  const linkButtonScale = pctToButtonScale(linkButtonScalePct);
  const paddingYPct =
    typeof sectionPaddingYPct === "number"
      ? sectionPaddingYPct
      : typeof sectionPaddingTopPct === "number" && typeof sectionPaddingBottomPct === "number"
        ? Math.round((sectionPaddingTopPct + sectionPaddingBottomPct) / 2)
        : 50;
  const itemYPct =
    typeof itemPaddingYPct === "number"
      ? itemPaddingYPct
      : typeof itemBottomPaddingPct === "number"
        ? itemBottomPaddingPct
        : 50;
  const styleVars = {
    "--aa-section-py": `${pctToPaddingPx(paddingYPct)}px`,
    "--aa-header-text-gap": `${pctToRangePx(headerTextGapPct, 8, 16, 32)}px`,
    "--aa-header-gap": `${pctToRangePx(headerToAccordionGapPct, 32, 64, 112)}px`,
    "--aa-item-head-gap": `${pctToRangePx(itemHeadGapPct, 4, 6, 16)}px`,
    "--aa-item-body-gap": `${pctToRangePx(itemBodyGapPct, 8, 16, 32)}px`,
    "--aa-item-y": `${pctToRangePx(itemYPct, 16, 24, 48)}px`,
    "--aa-left-width": pctToLeftSplit(splitPct),
    "--aa-right-width": pctToRightSplit(splitPct),
    "--aa-image-height": `${pctToImageHeightPx(imageHeightPct)}px`,
    "--aa-eyebrow-color": colorToken(sectionEyebrowColor, "var(--chrome-fg-subtle, #a59f97)"),
    "--aa-heading-color": colorToken(sectionHeadingColor, "var(--chrome-fg, #000)"),
    "--aa-region-color": colorToken(itemEyebrowColor, "var(--chrome-fg-subtle, #a59f97)"),
    "--aa-title-color": colorToken(itemHeadingColor, "var(--chrome-fg, #000)"),
    "--aa-subheading-color": colorToken(itemSubheadingColor, "var(--chrome-fg, #000)"),
    "--aa-body-color": colorToken(itemDescriptionColor, "var(--chrome-fg-muted, #777169)"),
    "--aa-progress-fill-color": colorToken(progressColor, "var(--chrome-fg, #000)"),
    "--aa-progress-track-color": colorTokenMix(progressColor, 18, "var(--chrome-border, #e5e5e5)"),
  };

  // Rule 6: changing animationStyle restarts the section from item 0.
  useEffect(() => {
    setActiveIndex(0);
    setIsAuto(autoEnabled);
  }, [animationStyle, autoEnabled]);

  useEffect(() => {
    setIsAuto(autoEnabled);
  }, [autoEnabled]);

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

    if (!autoEnabled || !isAuto) return;

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
  }, [activeIndex, autoAdvanceMs, autoEnabled, isAuto, safeItems.length]);

  const handleItemClick = (i) => {
    if (i === activeIndex) {
      setIsAuto((v) => {
        const next = !v;
        persistTop("autoEnabled", next);
        return next;
      });
      return;
    }
    setIsAuto(false);
    persistTop("autoEnabled", false);
    setActiveIndex(i);
  };

  // Persist a top-level prop change.
  const persistTop = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  const rootClass = styles.root;

  return (
    <section className={rootClass} style={styleVars}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <EditableText
            as={typographyElement(sectionEyebrowTypography, "p")}
            value={eyebrow}
            editing={_editing}
            onChange={(v) => persistTop("eyebrow", v)}
            className={`${styles.eyebrow} ${typographyClass(sectionEyebrowTypography)}`.trim()}
            placeholder="Eyebrow"
          />
          <EditableText
            as={typographyElement(sectionHeadingTypography, "h2")}
            value={heading}
            editing={_editing}
            multiline
            onChange={(v) => persistTop("heading", v)}
            className={`${styles.heading} ${typographyClass(sectionHeadingTypography)}`.trim()}
            placeholder="Section heading"
          />
        </header>

        <div className={`${styles.grid} ${reverseLayout ? styles.reverse : ""}`.trim()}>
          <ol className={styles.list}>
            {safeItems.map((item, i) => {
              const isActive = i === activeIndex;
              const ItemEyebrowTag = typographyElement(itemEyebrowTypography, "span");
              const ItemHeadingTag = typographyElement(itemHeadingTypography, "span");
              const ItemSubheadingTag = typographyElement(itemSubheadingTypography, "p");
              const ItemDescriptionTag = typographyElement(itemDescriptionTypography, "p");
              return (
                <li
                  key={i}
                  className={`${styles.row} ${isActive ? styles.open : ""}`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleItemClick(i)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleItemClick(i);
                      }
                    }}
                    className={styles.head}
                    aria-expanded={isActive}
                  >
                    <ItemEyebrowTag className={`${styles.region} ${typographyClass(itemEyebrowTypography)}`.trim()}>
                      {item.eyebrow ?? item.region ?? ""}
                    </ItemEyebrowTag>
                    <ItemHeadingTag className={`${styles.title} ${typographyClass(itemHeadingTypography)}`.trim()}>
                      {item.heading ?? item.title ?? ""}
                    </ItemHeadingTag>
                  </div>

                  <div className={styles.body}>
                    <div className={styles.bodyInner}>
                      <div
                        ref={(el) => setBodyContentRef(el, i)}
                        className={styles.bodyContent}
                      >
                        <ItemSubheadingTag className={`${styles.location} ${typographyClass(itemSubheadingTypography)}`.trim()}>
                          {item.subheading ?? item.location ?? ""}
                        </ItemSubheadingTag>
                        <ItemDescriptionTag className={`${styles.description} ${typographyClass(itemDescriptionTypography)}`.trim()}>
                          {item.description ?? ""}
                        </ItemDescriptionTag>
                        {item.linkHref || _editing ? (
                          <a
                            href={item.linkHref || "#"}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: `${(linkButtonVariant ? 16 : 10) * linkButtonScale}px`,
                            }}
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

function colorToken(token, fallback) {
  if (!token) return fallback;
  if (token === "transparent") return "transparent";
  const parsed = parseColorToken(token);
  if (parsed.alpha == null) return `var(--sg-color-${parsed.key})`;
  return `color-mix(in srgb, var(--sg-color-${parsed.key}) ${parsed.alpha}%, transparent)`;
}

function colorTokenMix(token, opacity, fallback) {
  if (!token) return fallback;
  if (token === "transparent") return "transparent";
  const parsed = parseColorToken(token);
  const alpha = parsed.alpha == null ? opacity : Math.round((parsed.alpha / 100) * opacity);
  return `color-mix(in srgb, var(--sg-color-${parsed.key}) ${alpha}%, transparent)`;
}

function parseColorToken(token) {
  const [key, alpha] = String(token).split("/");
  const alphaNumber = Number(alpha);
  return {
    key,
    alpha: Number.isFinite(alphaNumber) ? alphaNumber : null,
  };
}

function typographyElement(token, fallback) {
  if (!token) return fallback;
  return token.startsWith("h") ? token : "p";
}

function typographyClass(token) {
  const map = {
    h1: "sg-h1",
    h2: "sg-h2",
    h3: "sg-h3",
    h4: "sg-h4",
    h5: "sg-h5",
    h6: "sg-h6",
    textLarge: "sg-text-large",
    textMain: "sg-text-main",
    textSmall: "sg-text-small",
  };
  return token ? map[token] ?? `sg-${token}` : "";
}
