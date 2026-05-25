import Link from "next/link";

// Style guides are now per-site, so the standalone editor is hidden from
// the global nav. The route still exists as a sandbox if you visit it
// directly, but it's not surfaced in the UI.
const NAV = [
  { href: "/library", label: "Library" },
  { href: "/templates", label: "Templates" },
  { href: "/builder", label: "Builder" },
  { href: "/styleguide", label: "Style Guide" },
];

export default function AppShell({ children, active }) {
  return (
    <div className="min-h-screen flex flex-col bg-(--chrome-surface-muted) text-(--chrome-fg)">
      <header className="sticky top-0 z-40 border-b border-(--chrome-border) bg-(--chrome-ground)/90 backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-[1200px] items-center justify-between gap-6 px-8 py-4">
          <Link href="/" className="flex items-center gap-3 font-medium">
            <span
              aria-hidden
              className="inline-grid size-10 place-items-center rounded-[0.25rem] border border-(--chrome-fg) bg-(--chrome-fg) text-(--chrome-fg-inverse)"
            >
              M
            </span>
            <span className="font-[family-name:var(--chrome-font-display)] text-[16px] font-semibold">
              MakeReign
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            {NAV.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="app-nav-link"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
