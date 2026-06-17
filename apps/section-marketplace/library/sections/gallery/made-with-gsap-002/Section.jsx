"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_IMAGES = [
  { image: "/madewithgsap/002/1.jpg", alt: "Look 1" },
  { image: "/madewithgsap/002/2.jpg", alt: "Look 2" },
  { image: "/madewithgsap/002/3.jpg", alt: "Look 3" },
  { image: "/madewithgsap/002/4.jpg", alt: "Look 4" },
  { image: "/madewithgsap/002/5.jpg", alt: "Look 5" }
];

function pctToCardWidth(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${15 + (value / 100) * 18}vw`;
}

function pctToLag(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 0.25 + (value / 100) * 1.1;
}

function pctToSwitchDistance(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 120 + (value / 100) * 420;
}

export default function MadeWithGsap002({
  body = "We focus on high-quality, eco-conscious fabrics ensuring that each piece feels as good as it looks",
  shopLabel = "Shop all (12)",
  images = DEFAULT_IMAGES,
  sectionBackground = "dark",
  textColor = "light",
  cardWidthPct = 50,
  followLagPct = 50,
  imageSwitchDistancePct = 50,
  _editing = false,
  _onPropChange,
} = {}) {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const mediasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const state = useRef({ x: 0, y: 0, incr: 0, index: 0, timeout: null });
  const safeImages = Array.isArray(images) && images.length ? images : DEFAULT_IMAGES;

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    const medias = mediasRef.current;
    if (!root || !card || !medias) return undefined;

    const lag = pctToLag(followLagPct);
    const switchDistance = pctToSwitchDistance(imageSwitchDistancePct);
    const xTo = gsap.quickTo(card, "x", { duration: lag, ease: "power4" });
    const yTo = gsap.quickTo(card, "y", { duration: lag, ease: "power4" });
    const rotationTo = gsap.quickTo(card, "rotation", { duration: lag, ease: "power4" });
    const xToMedias = gsap.quickTo(medias, "xPercent", { duration: 0.6, ease: "power2" });
    const yToMedias = gsap.quickTo(medias, "yPercent", { duration: 0.7, ease: "power2" });

    const onMove = (event) => {
      const rect = root.getBoundingClientRect();
      const posX = event.clientX - rect.left;
      const posY = event.clientY - rect.top;
      const valueX = (posX - state.current.x) / 2;
      const valueY = (posY - state.current.y) / 2;
      const clampValueX = gsap.utils.clamp(-8, 8, valueX);
      const clampValueY = gsap.utils.clamp(-8, 8, valueY);

      rotationTo((posX - state.current.x) / 4);
      xTo(posX - rect.width / 2);
      yTo(posY - rect.height / 2);
      xToMedias(-clampValueX);
      yToMedias(-clampValueY);

      state.current.x = posX;
      state.current.y = posY;
      state.current.incr += Math.abs(valueX) + Math.abs(valueY);

      if (state.current.incr > switchDistance) {
        state.current.incr = 0;
        state.current.index += 1;
        setActiveIndex(state.current.index % safeImages.length);
      }

      window.clearTimeout(state.current.timeout);
      state.current.timeout = window.setTimeout(() => {
        rotationTo(0);
        xToMedias(0);
        yToMedias(0);
      }, 66);
    };

    root.addEventListener("pointermove", onMove);
    return () => {
      root.removeEventListener("pointermove", onMove);
      window.clearTimeout(state.current.timeout);
      gsap.killTweensOf([card, medias]);
    };
  }, [safeImages.length, followLagPct, imageSwitchDistancePct]);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      style={{
        "--mwg-bg": `var(--sg-color-${sectionBackground}, #121212)`,
        "--mwg-text": `var(--sg-color-${textColor}, #f1f1f1)`,
        "--mwg-card-width": pctToCardWidth(cardWidthPct),
      }}
    >
      <EditableText
        as="p"
        value={body}
        editing={_editing}
        onChange={(value) => persist("body", value)}
        className={styles.text}
        placeholder="Intro text"
      />
      <EditableText
        as="p"
        value={shopLabel}
        editing={_editing}
        onChange={(value) => persist("shopLabel", value)}
        className={styles.shop}
        placeholder="Shop label"
      />
      <div ref={cardRef} className={styles.card} aria-hidden="true">
        <div ref={mediasRef} className={styles.medias}>
          {safeImages.map((item, index) => (
            <img
              key={`${item.image}-${index}`}
              className={`${styles.media} ${index === activeIndex ? styles.on : ""}`}
              src={item.image}
              alt={item.alt ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
