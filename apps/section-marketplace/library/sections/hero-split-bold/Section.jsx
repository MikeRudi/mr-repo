import { buttonClass } from "../../../lib/styleguide-defaults.js";

export default function HeroSplitBold({
  eyebrow = "Priority Pass · 2026",
  headline = "The work that defined the year.",
  lede = "Forty-two campaigns from twenty-eight studios. One award show that takes craft seriously, and the people who make it.",
  primaryCta = { label: "View finalists", href: "#", variant: "primary" },
  secondaryCta = { label: "Read the brief", href: "#", variant: "secondary" },
} = {}) {
  return (
    <section className="bg-(--chrome-ground) text-(--chrome-fg)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
        <div>
          {eyebrow ? (
            <p
              data-sg-prop="eyebrow"
              className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)"
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            data-sg-prop="headline"
            className="mt-5 font-[family-name:var(--chrome-font-display)] text-[clamp(48px,9vw,128px)] leading-[0.95] tracking-[-0.02em] text-(--chrome-fg)"
          >
            {headline}
          </h1>
        </div>
        <div className="lg:pb-4">
          <p
            data-sg-prop="lede"
            className="text-[15px] leading-relaxed text-(--chrome-fg-muted) max-w-[440px]"
          >
            {lede}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              data-sg-prop="primaryCta"
              href={primaryCta.href}
              className={buttonClass(primaryCta.variant)}
            >
              {primaryCta.label}
            </a>
            <a
              data-sg-prop="secondaryCta"
              href={secondaryCta.href}
              className={buttonClass(secondaryCta.variant)}
            >
              {secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
