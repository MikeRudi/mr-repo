import Link from "next/link";
import AppShell from "../_components/AppShell.jsx";

export const metadata = {
  title: "Builder — MakeReign",
};

export default function BuilderHome() {
  return (
    <AppShell active="/builder">
      <section className="mx-auto max-w-[1200px] px-8 pt-12 pb-6">
        <p className="app-eyebrow">
          Compose
        </p>
        <h1 className="app-title mt-2">
          Builder
        </h1>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-8 py-10 md:grid-cols-3">
        {[
          {
            href: "/builder/new",
            title: "New blank site",
          },
          {
            href: "/templates",
            title: "From template",
          },
          {
            href: "/styleguide",
            title: "Edit style guide",
          },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="app-panel p-6 transition-colors hover:border-(--chrome-border-strong)"
          >
            <h3 className="app-subtitle">
              {c.title}
            </h3>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
