"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_ITEMS = Array.from({ length: 12 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    image: `/madewithgsap/000/${number}.png`,
    alt: `Saved object ${number}`,
  };
});

function pctToGap(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${0.4 + (value / 100) * 1.8}vw`;
}

function pctToSize(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${8 + (value / 100) * 8}vw`;
}

function pctToStrength(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 10 + (value / 100) * 34;
}

export default function MadeWithGsap000({
  label = "3d & stuff",
  status = "12 items saved in your collection",
  ctaText = "Add more",
  items = DEFAULT_ITEMS,
  sectionBackground = "dark",
  textColor = "light",
  gridGapPct = 50,
  mediaSizePct = 50,
  hoverStrengthPct = 50,
  _editing = false,
  _onPropChange,
} = {}) {
  const pointer = useRef({ x: 0, y: 0, dx: 0, dy: 0 });
  const safeItems = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;
  const firstImage = safeItems[0]?.image ?? DEFAULT_ITEMS[0].image;

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  const updatePointer = (event) => {
    pointer.current.dx = event.clientX - pointer.current.x;
    pointer.current.dy = event.clientY - pointer.current.y;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
  };

  const animateImage = (event) => {
    const image = event.currentTarget.querySelector("img");
    if (!image) return;
    const strength = pctToStrength(hoverStrengthPct);
    const dx = Math.max(-strength, Math.min(strength, pointer.current.dx * 2.2));
    const dy = Math.max(-strength, Math.min(strength, pointer.current.dy * 2.2));

    gsap.killTweensOf(image);
    gsap.fromTo(
      image,
      { x: dx, y: dy, rotate: (Math.random() - 0.5) * 26 },
      { x: 0, y: 0, rotate: 0, duration: 0.85, ease: "elastic.out(1, 0.45)" }
    );
  };

  return (
    <section
      className={styles.root}
      onPointerMove={updatePointer}
      style={{
        "--mwg-bg": `var(--sg-color-${sectionBackground}, #121212)`,
        "--mwg-text": `var(--sg-color-${textColor}, #f1f1f1)`,
        "--mwg-gap": pctToGap(gridGapPct),
        "--mwg-media-size": pctToSize(mediaSizePct),
      }}
    >
      <header className={styles.header}>
        <div>
          <p className={`${styles.button} ${styles.filledButton}`}>
            <img src={firstImage} alt="" />
            <EditableText
              as="span"
              value={label}
              editing={_editing}
              onChange={(value) => persist("label", value)}
              placeholder="Label"
            />
          </p>
        </div>
        <EditableText
          as="div"
          value={status}
          editing={_editing}
          onChange={(value) => persist("status", value)}
          className={styles.status}
          placeholder="Status"
        />
        <div className={styles.action}>
          <EditableText
            as="p"
            value={ctaText}
            editing={_editing}
            onChange={(value) => persist("ctaText", value)}
            className={`${styles.button} ${styles.outlineButton}`}
            placeholder="CTA"
          />
        </div>
      </header>

      <div className={styles.medias}>
        {safeItems.map((item, index) => (
          <div key={`${item.image}-${index}`} className={styles.media} onPointerEnter={animateImage}>
            <img src={item.image} alt={item.alt ?? ""} />
          </div>
        ))}
      </div>
    </section>
  );
}
