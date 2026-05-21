export default function Chip({ children, tone = "neutral", className = "" }) {
  const toneClass =
    tone === "neutral"
      ? "border-(--chrome-border) text-(--chrome-fg-muted)"
      : tone === "filled"
        ? "border-(--chrome-fg) bg-(--chrome-fg) text-(--chrome-fg-inverse)"
        : "border-(--chrome-border) text-(--chrome-fg-muted)";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 h-6 rounded-(--chrome-radius-pill) border text-[11px] font-medium uppercase tracking-[0.04em] ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
