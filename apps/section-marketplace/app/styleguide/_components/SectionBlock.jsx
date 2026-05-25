"use client";

// A section of the style guide doc. Renders heading + description on top,
// then editor on the left, contextual preview on the right.

export default function SectionBlock({ id, eyebrow, title, description, editor, preview }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-[var(--chrome-border)] py-12"
    >
      <header className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
        <h2 className="app-subtitle">
          <span className="mr-2 font-[family-name:var(--chrome-font-mono)] font-normal text-[var(--chrome-fg-subtle)]">
            {eyebrow}
          </span>
          {title}
        </h2>
        {description ? (
          <p className="app-text lg:max-w-[440px] lg:justify-self-end">
            {description}
          </p>
        ) : null}
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="app-panel p-6">
          {editor}
        </div>
        <div className="app-panel overflow-hidden bg-[var(--chrome-surface-muted)] p-6">
          {preview}
        </div>
      </div>
    </section>
  );
}

export function GroupHeading({ children }) {
  return (
    <h3 className="app-subtitle mb-3">
      {children}
    </h3>
  );
}
