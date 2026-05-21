export default function BuilderHome() {
  return (
    <main className="min-h-screen px-8 py-12">
      <header className="max-w-6xl mx-auto mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-(--mr-fg-muted)">MakeReign</p>
        <h1 className="text-4xl font-semibold mt-2">Web Builder</h1>
        <p className="mt-3 max-w-2xl text-(--mr-fg-muted)">
          The visual environment for composing pages from the MakeReign
          Section Library. This is a scaffold — the editor UI lives here.
        </p>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Library",
            body: "Browse sections from @mr/section-marketplace.",
          },
          {
            title: "Canvas",
            body: "Compose a page by adding sections and editing tokens.",
          },
          {
            title: "Inspector",
            body: "Per-section props, design tokens, and motion controls.",
          },
        ].map((panel) => (
          <div
            key={panel.title}
            className="rounded-lg border border-(--mr-border) p-5"
          >
            <p className="text-lg font-medium">{panel.title}</p>
            <p className="text-sm text-(--mr-fg-muted) mt-2">{panel.body}</p>
            <p className="text-xs text-(--mr-fg-muted) mt-4">Not yet wired.</p>
          </div>
        ))}
      </section>
    </main>
  );
}
