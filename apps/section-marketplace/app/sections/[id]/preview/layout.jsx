// Minimal layout for the iframe preview surface — no AppShell, no chrome.
// Inherits global tokens from the root layout's globals.css import.
export default function PreviewLayout({ children }) {
  return (
    <div className="bg-(--chrome-ground) min-h-dvh">
      {children}
    </div>
  );
}

export const metadata = { robots: { index: false, follow: false } };
