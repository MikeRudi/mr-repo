"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Section.module.css";

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
    image: "/webflow/images/000.-Hero_Advantage-VIP-Lounge-1.webp",
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

export default function AutoAccordion({
  eyebrow = "Highly Commended Lounges 2026",
  heading = "Recognising exceptional service and experiences for Priority Pass Members.",
  animationStyle = "slide",
  autoAdvanceMs = 5000,
  revealMs = 600,
  items = DEFAULT_ITEMS,
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

  return (
    <section className="bg-[var(--chrome-ground,#fdfcfc)] text-[var(--chrome-fg,#000)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-28">
        {(eyebrow || heading) && (
          <header className="mb-12 lg:mb-16 max-w-[760px]">
            {eyebrow ? (
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--chrome-fg-subtle,#a59f97)]">
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className="mt-4 text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[-0.01em] font-medium">
                {heading}
              </h2>
            ) : null}
          </header>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <ol className="flex flex-col">
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
                    {item.region ? (
                      <span className={styles.region}>{item.region}</span>
                    ) : null}
                    <span className={styles.title}>{item.title}</span>
                  </button>

                  <div className={styles.body}>
                    <div className={styles.bodyInner}>
                      <div
                        ref={(el) => setBodyContentRef(el, i)}
                        className={styles.bodyContent}
                      >
                        {item.location ? (
                          <p className={styles.location}>{item.location}</p>
                        ) : null}
                        {item.description ? (
                          <p className={styles.description}>{item.description}</p>
                        ) : null}
                        {item.linkLabel && item.linkHref ? (
                          <a
                            href={item.linkHref}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.link}
                          >
                            {item.linkLabel}
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
