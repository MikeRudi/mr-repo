export default function HeroSplitBold({
  eyebrow = "Priority Pass · 2026",
  headline = "The work that defined the year.",
  lede = "Forty-two campaigns from twenty-eight studios. One award show that takes craft seriously, and the people who make it.",
  primaryCta = { label: "View finalists", href: "#" },
  secondaryCta = { label: "Read the brief", href: "#" },
} = {}) {
  return (
    <section className="bg-(--chrome-ground) text-(--chrome-fg)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
        <div>
          {eyebrow ? (
            <p className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-5 font-[family-name:var(--chrome-font-display)] text-[clamp(48px,9vw,128px)] leading-[0.95] tracking-[-0.02em] text-(--chrome-fg)">
            {headline}
          </h1>
        </div>
        <div className="lg:pb-4">
          <p className="text-[15px] leading-relaxed text-(--chrome-fg-muted) max-w-[440px]">
            {lede}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              href={primaryCta.href}
              className="inline-flex items-center h-11 px-5 rounded-(--chrome-radius-pill) bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[13px]"
            >
              {primaryCta.label}
            </a>
            <a
              href={secondaryCta.href}
              className="inline-flex items-center h-11 px-5 rounded-(--chrome-radius-pill) border border-(--chrome-border-strong) text-(--chrome-fg) text-[13px] hover:bg-(--chrome-fg) hover:text-(--chrome-fg-inverse) transition-colors"
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
