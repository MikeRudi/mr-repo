const DEFAULT_ITEMS = [
  "Editorial typography",
  "Motion-led storytelling",
  "Design systems that scale",
  "Performance budgets in mind",
  "Accessibility from day one",
  "Multi-language ready",
  "CMS that editors enjoy",
  "Built with React",
];

export default function FeaturesMarquee({
  items = DEFAULT_ITEMS,
  speed = 40,
  separator = "·",
} = {}) {
  const loop = [...items, ...items];
  return (
    <section
      className="bg-(--chrome-fg) text-(--chrome-fg-inverse) overflow-hidden border-y border-(--chrome-fg)"
      aria-label="Capabilities marquee"
    >
      <div
        className="flex w-max items-center gap-10 py-7"
        style={{
          animation: `mr-marquee ${speed}s linear infinite`,
        }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-[family-name:var(--chrome-font-display)] text-[clamp(28px,4vw,48px)] leading-none whitespace-nowrap"
          >
            <span>{item}</span>
            <span aria-hidden className="text-(--chrome-fg-inverse)/40">
              {separator}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes mr-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Capabilities marquee"] > div { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
