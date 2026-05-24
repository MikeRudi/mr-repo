import Link from "next/link";

// Style guides are now per-site, so the standalone editor is hidden from
// the global nav. The route still exists as a sandbox if you visit it
// directly, but it's not surfaced in the UI.
const NAV = [
  { href: "/library", label: "Library" },
  { href: "/templates", label: "Templates" },
  { href: "/builder", label: "Builder" },
];

export default function AppShell({ children, active }) {
  return (
    <div className="min-h-screen flex flex-col bg-(--chrome-surface-muted) text-(--chrome-fg)">
      <header className="sticky top-0 z-40 border-b border-(--chrome-border) bg-(--chrome-ground)/85 backdrop-blur">
        <div className="mx-auto max-w-[1200px] px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span
              aria-hidden
              className="inline-grid place-items-center size-7 rounded-(--chrome-radius-2) bg-(--chrome-fg) text-(--chrome-fg-inverse)"
            >
              M
            </span>
            <span className="font-[family-name:var(--chrome-font-display)] text-[15px]">
              MakeReign
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 h-9 inline-flex items-center rounded-(--chrome-radius-pill) text-[13px] transition-colors ${
                    isActive
                      ? "bg-(--chrome-fg) text-(--chrome-fg-inverse)"
                      : "text-(--chrome-fg-muted) hover:text-(--chrome-fg) hover:bg-(--chrome-surface)"
                  }`}
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
