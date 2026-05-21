const DEFAULT_GROUPS = [
  {
    label: "Work",
    links: [
      { label: "Case studies", href: "#" },
      { label: "Sectors", href: "#" },
      { label: "Process", href: "#" },
    ],
  },
  {
    label: "Studio",
    links: [
      { label: "About", href: "#" },
      { label: "Team", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    label: "Contact",
    links: [
      { label: "hello@makereign.com", href: "mailto:hello@makereign.com" },
      { label: "Press", href: "#" },
      { label: "Brief", href: "#" },
    ],
  },
];

export default function FooterMinimal({
  brand = "MakeReign",
  statement = "An independent studio building digital systems for brands that take craft seriously.",
  groups = DEFAULT_GROUPS,
  legal = "© 2026 MakeReign Ltd · Cape Town & London",
} = {}) {
  return (
    <footer className="bg-(--chrome-ground) text-(--chrome-fg) border-t border-(--chrome-border)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">
          <div>
            <p
              data-sg-prop="brand"
              className="font-[family-name:var(--chrome-font-display)] text-[24px] tracking-[-0.01em] text-(--chrome-fg)"
            >
              {brand}
            </p>
            <p
              data-sg-prop="statement"
              className="mt-3 text-[13px] text-(--chrome-fg-muted) max-w-[320px] leading-relaxed"
            >
              {statement}
            </p>
          </div>
          {groups.map((g, gi) => (
            <nav key={g.label} aria-label={g.label}>
              <p
                data-sg-prop="groups"
                data-sg-index={gi}
                data-sg-sub="label"
                className="text-[11px] uppercase tracking-[0.12em] text-(--chrome-fg-subtle)"
              >
                {g.label}
              </p>
              <ul className="mt-3 space-y-2">
                {g.links.map((l, li) => (
                  <li key={l.label}>
                    <a
                      data-sg-prop="groups"
                      data-sg-index={gi}
                      data-sg-sub="links"
                      data-sg-link-index={li}
                      href={l.href}
                      className="text-[13px] text-(--chrome-fg) hover:text-(--chrome-fg-muted) transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-(--chrome-border) flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p data-sg-prop="legal" className="text-[12px] text-(--chrome-fg-subtle)">{legal}</p>
          <p className="text-[12px] text-(--chrome-fg-subtle) font-[family-name:var(--chrome-font-mono)]">
            v0.1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
