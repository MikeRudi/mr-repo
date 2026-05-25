import Link from "next/link";
import AppShell from "./_components/AppShell.jsx";
import StartTile from "./_components/StartTile.jsx";

const START = [
  {
    href: "/builder/start",
    title: "Blank Site",
  },
  {
    title: "From Template",
    comingSoon: true,
  },
  {
    title: "From Screenshot",
    comingSoon: true,
  },
  {
    title: "From Figma",
    comingSoon: true,
  },
  {
    title: "From URL",
    comingSoon: true,
  },
];

const BROWSE = [
  { href: "/library", label: "View Library" },
  { href: "/templates", label: "View Templates" },
  { label: "Learn The App", comingSoon: true },
];

export default function Lander() {
  return (
    <AppShell active="/">
      <section className="mx-auto max-w-[1200px] px-8 pb-10 pt-16">
        <p className="app-eyebrow">MakeReign Internal</p>
        <h1 className="app-title mt-3">Start Building</h1>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {START.map((item) => (
            <li key={item.title}>
              <StartTile {...item} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1200px] px-8 pb-20 pt-8">
        <h2 className="app-subtitle">Browse More</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {BROWSE.map((item) =>
            item.comingSoon ? (
              <span
                key={item.label}
                className="btn-chrome btn-chrome--ghost opacity-45"
                aria-disabled="true"
              >
                {item.label}
              </span>
            ) : (
              <Link key={item.href} href={item.href} className="btn-chrome">
                {item.label}
              </Link>
            )
          )}
        </div>
      </section>
    </AppShell>
  );
}
