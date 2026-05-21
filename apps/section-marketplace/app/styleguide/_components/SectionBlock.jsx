"use client";

// A section of the style guide doc. Renders heading + description on top,
// then editor on the left, contextual preview on the right.

export default function SectionBlock({ id, eyebrow, title, description, editor, preview }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[var(--chrome-border)] pt-12 pb-16"
    >
      <header className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
        <h2 className="text-[14px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)]">
          <span className="text-[var(--chrome-fg-subtle)] mr-2 font-[family-name:var(--chrome-font-mono)] font-normal">
            {eyebrow}
          </span>
          {title}
        </h2>
        {description ? (
          <p className="text-[12px] text-[var(--chrome-fg-muted)] leading-relaxed lg:max-w-[440px] lg:justify-self-end">
            {description}
          </p>
        ) : null}
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="rounded-[14px] border border-[var(--chrome-border)] bg-[var(--chrome-surface)] p-6">
          {editor}
        </div>
        <div className="rounded-[14px] border border-[var(--chrome-border)] bg-[var(--chrome-surface-muted)] p-6 overflow-hidden">
          {preview}
        </div>
      </div>
    </section>
  );
}

export function GroupHeading({ children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--chrome-fg)] mb-3">
      {children}
    </h3>
  );
}
