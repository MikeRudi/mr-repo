"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

function pctToParagraphWidth(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${42 + (value / 100) * 38}%`;
}

function pctToFontSize(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${2.6 + (value / 100) * 2.4}vw`;
}

function pctToStagger(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 0.04 + (value / 100) * 0.24;
}

export default function MadeWithGsap004({
  heading = "About David Hockney",
  meta = "\"A bigger splash\"\n1967\nacrylic\nTate Modern, London",
  image = "/madewithgsap/004/painting.jpg",
  paragraph = "David Hockney (1937) is a British artist renowned for his vibrant use of color and innovative exploration of perspective. He is best known for his paintings of California swimming pools which capture light and atmosphere with striking simplicity.",
  scrollLabel = "Scroll",
  sectionBackground = "dark",
  textColor = "light",
  paragraphWidthPct = 50,
  paragraphSizePct = 50,
  wordStaggerPct = 50,
  _editing = false,
  _onPropChange,
} = {}) {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const containerRef = useRef(null);
  const words = useMemo(() => String(paragraph ?? "").split(" "), [paragraph]);

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    const pinHeight = pinRef.current;
    const container = containerRef.current;
    if (!root || !pinHeight || !container) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(root.querySelector(`.${styles.scroll}`), {
        autoAlpha: 0,
        duration: 0.2,
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "top top-=1",
          toggleActions: "play none reverse none"
        }
      });

      ScrollTrigger.create({
        trigger: pinHeight,
        start: "top top",
        end: "bottom bottom",
        pin: container
      });

      gsap.to(`.${styles.word}`, {
        x: 0,
        stagger: pctToStagger(wordStaggerPct),
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: pinHeight,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    }, root);

    return () => ctx.revert();
  }, [paragraph, wordStaggerPct]);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={{
        "--mwg-bg": `var(--sg-color-${sectionBackground}, #121212)`,
        "--mwg-text": `var(--sg-color-${textColor}, #f1f1f1)`,
        "--mwg-paragraph-width": pctToParagraphWidth(paragraphWidthPct),
        "--mwg-paragraph-size": pctToFontSize(paragraphSizePct),
      }}
    >
      <EditableText as="p" value={scrollLabel} editing={_editing} onChange={(value) => persist("scrollLabel", value)} className={styles.scroll} placeholder="Scroll label" />
      <div ref={pinRef} className={styles.pinHeight}>
        <div ref={containerRef} className={styles.container}>
          <header className={styles.header}>
            <EditableText as="p" value={heading} editing={_editing} onChange={(value) => persist("heading", value)} className={styles.left} placeholder="Heading" />
            <div className={styles.right}>
              <EditableText as="p" value={meta} editing={_editing} onChange={(value) => persist("meta", value)} placeholder="Artwork details" />
              <img src={image} alt="" />
            </div>
          </header>
          {_editing ? (
            <EditableText
              as="p"
              value={paragraph}
              editing={_editing}
              onChange={(value) => persist("paragraph", value)}
              className={styles.paragraph}
              placeholder="Paragraph"
            />
          ) : (
            <p className={styles.paragraph}>
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className={styles.word}>
                  {word}
                  {index < words.length - 1 ? "\u00a0" : ""}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
