// Stub shared card for previewing a section in the library UI.

export default function SectionCard({ name, summary, category, href, children }) {
  const Wrap = href ? "a" : "div";
  const wrapProps = href ? { href } : {};
  return (
    <Wrap
      {...wrapProps}
      className="block rounded-lg border border-(--mr-border) p-5 hover:border-(--mr-accent) transition-colors"
    >
      {category ? (
        <p className="text-xs uppercase tracking-wider text-(--mr-fg-muted)">{category}</p>
      ) : null}
      <p className="text-lg font-medium mt-1">{name}</p>
      {summary ? (
        <p className="text-sm text-(--mr-fg-muted) mt-2">{summary}</p>
      ) : null}
      {children}
    </Wrap>
  );
}
