// Stub shared header used by the marketplace and the builder.
//
// Replace with the real LibraryHeader once the design lands.

export default function LibraryHeader({ title = "MakeReign Library", children }) {
  return (
    <header className="border-b border-(--mr-border) px-6 py-4 flex items-center justify-between">
      <span className="font-medium">{title}</span>
      {children}
    </header>
  );
}
