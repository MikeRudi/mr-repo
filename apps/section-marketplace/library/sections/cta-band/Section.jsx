export default function CtaBand({
  eyebrow = "Build your year",
  headline = "Ready when you are.",
  body = "Talk to our team about your launch, your rebrand, or the system underneath both.",
  primaryCta = { label: "Start a project", href: "#" },
  secondaryCta = { label: "See our work", href: "#" },
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
            className="inline-flex items-center h-11 px-6 rounded-(--chrome-radius-pill) bg-(--chrome-fg-inverse) text-(--chrome-fg) text-[13px]"
          >
            {primaryCta.label}
          </a>
          <a
            href={secondaryCta.href}
            className="inline-flex items-center h-11 px-6 rounded-(--chrome-radius-pill) border border-(--chrome-fg-inverse)/40 text-(--chrome-fg-inverse) text-[13px] hover:bg-(--chrome-fg-inverse)/10 transition-colors"
          >
            {secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
