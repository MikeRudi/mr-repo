// Full-screen builder shell — overrides the default AppShell-wrapped layout
// for everything else under /app. The canvas takes the entire viewport.

export const metadata = {
  title: "Builder — MakeReign",
};

export default function BuilderLayout({ children }) {
  return <div className="h-dvh w-screen overflow-hidden bg-[var(--chrome-ground)]">{children}</div>;
}
