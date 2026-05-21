export default function IntroEyebrowStatement({
  eyebrow = "What we judge",
  statement = "Work that holds up at full size on a desktop and at thumb-distance on a phone. Work that took restraint, not just budget. Work that earns the second look.",
} = {}) {
  return (
    <section className="bg-(--chrome-surface-muted) text-(--chrome-fg)">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10 py-24 lg:py-28">
        <p
          data-sg-prop="eyebrow"
          className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)"
        >
          {eyebrow}
        </p>
        <p
          data-sg-prop="statement"
          className="mt-6 font-[family-name:var(--chrome-font-display)] text-[clamp(28px,3.6vw,48px)] leading-[1.15] tracking-[-0.01em] text-(--chrome-fg) max-w-[920px]"
        >
          {statement}
        </p>
      </div>
    </section>
  );
}
