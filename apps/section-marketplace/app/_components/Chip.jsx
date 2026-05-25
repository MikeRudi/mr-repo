export default function Chip({ children, tone = "neutral", className = "" }) {
  const toneClass =
    tone === "neutral"
      ? "border-(--chrome-border) text-(--chrome-fg-muted)"
      : tone === "filled"
        ? "border-(--chrome-fg) bg-(--chrome-fg) text-(--chrome-fg-inverse)"
        : "border-(--chrome-border) text-(--chrome-fg-muted)";
  return (
    <span
      className={`inline-flex min-h-10 items-center gap-1 rounded-[0.25rem] border px-3 text-[16px] font-normal ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
