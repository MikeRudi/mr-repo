"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_CARDS = [
  { image: "/madewithgsap/001/1.jpg", collection: "indie pop", title: "Neon Waves", accent: "#BCEFFF" },
  { image: "/madewithgsap/001/2.jpg", collection: "indie pop", title: "Velvet Drift", accent: "#C9FE6E" },
  { image: "/madewithgsap/001/3.jpg", collection: "indie pop", title: "Echo Flame", accent: "#FAFF9E" },
  { image: "/madewithgsap/001/4.jpg", collection: "indie pop", title: "Phantom Beat", accent: "#FC4C3B" },
  { image: "/madewithgsap/001/5.jpg", collection: "indie pop", title: "Crystal Tide", accent: "#F1F1F1" },
  { image: "/madewithgsap/001/6.jpg", collection: "indie pop", title: "Riot in Silence", accent: "#8CEDFF" },
  { image: "/madewithgsap/001/7.jpg", collection: "indie pop", title: "Jet Flame", accent: "#FAFF9E" }
];

function pctToGap(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${0.5 + (value / 100) * 1.8}vw`;
}

function pctToWidth(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${20 + (value / 100) * 14}vw`;
}

function pctToScatter(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 0.4 + (value / 100) * 1.2;
}

export default function MadeWithGsap001({
  leftLabel = "Spotify datas",
  centerLabel = "New solo artists you liked during 2024",
  rightLabel = "7 artists",
  scrollLabel = "Scroll",
  cards = DEFAULT_CARDS,
  sectionBackground = "dark",
  textColor = "light",
  cardGapPct = 50,
  cardWidthPct = 50,
  scatterPct = 50,
  _editing = false,
  _onPropChange,
} = {}) {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef(null);
  const safeCards = Array.isArray(cards) && cards.length ? cards : DEFAULT_CARDS;

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    const container = containerRef.current;
    const cardsEl = cardsRef.current;
    if (!root || !container || !cardsEl) return undefined;

    const ctx = gsap.context(() => {
      const distance = Math.max(1, cardsEl.scrollWidth - window.innerWidth);
      gsap.to(root.querySelector(`.${styles.scroll}`), {
        autoAlpha: 0,
        duration: 0.2,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "top top-=1",
          toggleActions: "play none reverse none"
        }
      });

      const scrollTween = gsap.to(cardsEl, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: true,
          start: "top top",
          end: `+=${distance}`
        }
      });

      const scatter = pctToScatter(scatterPct);
      gsap.utils.toArray(`.${styles.card}`).forEach((card, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const x = (30 + (index % 3) * 7) * direction * scatter;
        const y = (10 + (index % 4) * 2) * -direction * scatter;
        const rotation = (10 + (index % 4) * 3) * direction * scatter;
        gsap.fromTo(card, {
          rotation,
          xPercent: x,
          yPercent: y
        }, {
          rotation: -rotation,
          xPercent: -x,
          yPercent: -y,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: "left 120%",
            end: "right -20%",
            scrub: true
          }
        });
      });
    }, root);

    return () => ctx.revert();
  }, [safeCards.length, scatterPct]);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={{
        "--mwg-bg": `var(--sg-color-${sectionBackground}, #121212)`,
        "--mwg-text": `var(--sg-color-${textColor}, #f1f1f1)`,
        "--mwg-card-gap": pctToGap(cardGapPct),
        "--mwg-card-width": pctToWidth(cardWidthPct),
      }}
    >
      <EditableText
        as="p"
        value={scrollLabel}
        editing={_editing}
        onChange={(value) => persist("scrollLabel", value)}
        className={styles.scroll}
        placeholder="Scroll label"
      />
      <div ref={containerRef} className={styles.container}>
        <header className={styles.header}>
          <EditableText as="p" value={leftLabel} editing={_editing} onChange={(value) => persist("leftLabel", value)} placeholder="Left label" />
          <EditableText as="p" value={centerLabel} editing={_editing} onChange={(value) => persist("centerLabel", value)} placeholder="Center label" />
          <EditableText as="p" value={rightLabel} editing={_editing} onChange={(value) => persist("rightLabel", value)} placeholder="Right label" />
        </header>
        <div ref={cardsRef} className={styles.cards}>
          {safeCards.map((card, index) => (
            <article key={`${card.title}-${index}`} className={styles.card} style={{ "--mwg-accent": card.accent || "#f1f1f1" }}>
              <img src={card.image} alt={card.title ?? ""} />
              <div className={styles.cardContent}>
                <p><span>Collection</span> <span>{card.collection}</span></p>
                <div>
                  <span className={styles.from}>From</span>
                  <h2>{card.title}</h2>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
