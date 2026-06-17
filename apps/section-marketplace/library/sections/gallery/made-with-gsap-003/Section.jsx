"use client";

import { useEffect, useRef } from "react";
import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";

const DEFAULT_ARTISTS = [
  { genre: "psychedelic pop", firstName: "Kevin", lastName: "Parker", prefix: "aka", name: "Tame Impala", albums: "Innerspeaker\nLonerism\nCurrents\nThe Slow Rush", background: "#FC4C3B", color: "#702626" },
  { genre: "indie pop", firstName: "Devonte", lastName: "Hynes", prefix: "aka", name: "Blood Orange", albums: "Coastal Grooves\nCupid Deluxe\nFreetown Sound\nNegro Swan", background: "#FF8308", color: "#FFDF40" },
  { genre: "rock", firstName: "Julian", lastName: "Casablancas", prefix: "of", name: "The Strokes", albums: "Is This it\nRoom on Fire\nFirst Impression of Earth\nAngles\nComedown Machine\nThe New Abnormal", background: "#DEDA8D", color: "#3D4331" },
  { genre: "soul R&B", firstName: "Stephen Lee", lastName: "Bruner", prefix: "aka", name: "Thunder Cat", albums: "The Golden Age of Apocalypse\nApocalypse\nDrunk\nDrank\nIs it What it is", background: "#71CFA3", color: "#184739" },
  { genre: "indie pop", firstName: "Emmanuelle", lastName: "Proulx", prefix: "of", name: "Men I Trust", albums: "Men I Trust\nHeadroom\nOncle Jazz\nForever Live Session\nUntourable Album", background: "#C4EF7A", color: "#184739" },
  { genre: "indie rock", firstName: "MCBriare", lastName: "Demarco", prefix: "aka", name: "Mac Demarco", albums: "2\nSalad Days\nThis Old Dog\nHere Comes The Cowboy\nFive East Hot Dogs", background: "#BCEFFF", color: "#0C3FD3" }
];

function pctToFanAngle(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return 1.5 + (value / 100) * 4;
}

function pctToCardWidth(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return `${20 + (value / 100) * 13}vw`;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 2);
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

function lines(value) {
  return String(value ?? "").split("\n").filter(Boolean);
}

export default function MadeWithGsap003({
  leftLabel = "Spotify datas",
  centerLabel = "Your most stream artist in 2024",
  rightLabel = "6 artists",
  scrollLabel = "Scroll",
  artists = DEFAULT_ARTISTS,
  sectionBackground = "dark",
  textColor = "light",
  cardWidthPct = 50,
  fanAnglePct = 50,
  _editing = false,
  _onPropChange,
} = {}) {
  const rootRef = useRef(null);
  const safeArtists = Array.isArray(artists) && artists.length ? artists : DEFAULT_ARTISTS;

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
      const scrollDistance = Math.max(root.offsetHeight - viewport.height, 1);
      const progress = clamp((viewport.top - rootRect.top) / scrollDistance);
      const scrollLabel = root.querySelector(`.${styles.scroll}`);
      if (scrollLabel) scrollLabel.style.opacity = progress > 0.01 ? "0" : "1";
      const circlesWrap = root.querySelector(`.${styles.circles}`);
      if (circlesWrap) circlesWrap.style.transform = `translate3d(0, ${5 + (-10 * progress)}%, 0)`;
      const circles = Array.from(root.querySelectorAll(`.${styles.circle}`));
      const angle = pctToFanAngle(fanAnglePct);
      const halfRange = ((circles.length - 1) * angle) / 2;

      circles.forEach((circle, index) => {
        const rotation = -halfRange + angle * index;
        const cardProgress = easeOut(clamp(progress * circles.length - index));
        circle.style.transform = `translate(-50%, 0) rotate(${rotation * cardProgress}deg)`;
        const card = circle.querySelector(`.${styles.card}`);
        if (card) {
          const y = 55 + (-105 * cardProgress);
          card.style.transform = `translate(-50%, ${y}vh) rotate(${rotation * cardProgress}deg)`;
        }
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
  }, [safeArtists.length, fanAnglePct]);

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
      <EditableText as="p" value={scrollLabel} editing={_editing} onChange={(value) => persist("scrollLabel", value)} className={styles.scroll} placeholder="Scroll label" />
      <div className={styles.frame}>
          <header className={styles.header}>
            <EditableText as="p" value={leftLabel} editing={_editing} onChange={(value) => persist("leftLabel", value)} placeholder="Left label" />
            <EditableText as="p" value={centerLabel} editing={_editing} onChange={(value) => persist("centerLabel", value)} placeholder="Center label" />
            <EditableText as="p" value={rightLabel} editing={_editing} onChange={(value) => persist("rightLabel", value)} placeholder="Right label" />
          </header>
          <div className={styles.circles}>
            {safeArtists.map((artist, index) => (
              <div key={`${artist.name}-${index}`} className={styles.circle}>
                <article className={styles.card} style={{ "--mwg-card-bg": artist.background || "#FC4C3B", "--mwg-card-color": artist.color || "#702626" }}>
                  <div className={styles.top}>
                    <p><span>Collection</span> <span>{artist.genre}</span></p>
                    <p><span>{artist.firstName}</span> <span>{artist.lastName}</span></p>
                  </div>
                  <div>
                    <span className={styles.aka}>{artist.prefix}</span>
                    <h2>{artist.name}</h2>
                  </div>
                  <div>
                    {lines(artist.albums).map((album) => <p key={album}>{album}</p>)}
                  </div>
                </article>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
}
