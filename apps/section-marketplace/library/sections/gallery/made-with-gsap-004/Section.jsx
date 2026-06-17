"use client";

import { useEffect, useMemo, useRef } from "react";
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

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function getScrollParent(element) {
  let parent = element?.parentElement;
  while (parent) {
    const styles = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(styles.overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function getViewportRect(scroller) {
  if (scroller === window) {
    return { top: 0, height: window.innerHeight };
  }
  const rect = scroller.getBoundingClientRect();
  return { top: rect.top, height: rect.height };
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
  const words = useMemo(() => String(paragraph ?? "").split(" "), [paragraph]);

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;
    const scroller = getScrollParent(root);
    const update = () => {
      const viewport = getViewportRect(scroller);
      const rootRect = root.getBoundingClientRect();
      const progress = clamp((viewport.top - rootRect.top) / Math.max(root.offsetHeight - viewport.height, 1));
      const scrollLabel = root.querySelector(`.${styles.scroll}`);
      if (scrollLabel) scrollLabel.style.opacity = progress > 0.01 ? "0" : "1";
      const stagger = pctToStagger(wordStaggerPct);
      const wordEls = Array.from(root.querySelectorAll(`.${styles.word}`));
      wordEls.forEach((word, index) => {
        const localProgress = clamp((progress - index * stagger / wordEls.length) * 1.35);
        const x = (1 - localProgress) * root.clientWidth;
        word.style.transform = `translate3d(${x}px, 0, 0)`;
      });
    };
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    requestUpdate();
    scroller.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    const observer = new ResizeObserver(requestUpdate);
    observer.observe(root);

    return () => {
      window.cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      observer.disconnect();
    };
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
      <div className={styles.frame}>
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
    </section>
  );
}
