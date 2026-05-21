import { buttonClass } from "../../../lib/styleguide-defaults.js";

export default function CtaBand({
  eyebrow = "Build your year",
  headline = "Ready when you are.",
  body = "Talk to our team about your launch, your rebrand, or the system underneath both.",
  primaryCta = { label: "Start a project", href: "#", variant: "secondary" },
  secondaryCta = { label: "See our work", href: "#", variant: "ghost" },
} = {}) {
  return (
    <section className="bg-(--chrome-surface-inverse) text-(--chrome-fg-inverse)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-32 text-center">
        {eyebrow ? (
          <p className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-inverse)/60">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-5 font-[family-name:var(--chrome-font-display)] text-[clamp(40px,7vw,96px)] leading-[0.98] tracking-[-0.02em]">
          {headline}
        </h2>
        {body ? (
          <p className="mt-5 mx-auto max-w-[560px] text-[15px] leading-relaxed text-(--chrome-fg-inverse)/70">
            {body}
          </p>
        ) : null}
        <div className="mt-9 flex justify-center gap-2.5">
          <a
            href={primaryCta.href}
            className={buttonClass(primaryCta.variant)}
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className={buttonClass(secondaryCta.variant)}
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
