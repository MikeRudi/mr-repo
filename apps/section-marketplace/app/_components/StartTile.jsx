import Link from "next/link";

export default function StartTile({
  href,
  title,
  body,
  comingSoon = false,
}) {
  const Cmp = href ? Link : "div";
  const props = href ? { href } : {};
  return (
    <Cmp
      {...props}
      className={`group relative flex flex-col h-full p-6 rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) transition-colors ${
        comingSoon ? "opacity-80" : "hover:border-(--chrome-border-strong)"
      }`}
    >
      <h3 className="font-[family-name:var(--chrome-font-display)] text-[20px] leading-tight text-(--chrome-fg)">
        {title}
      </h3>
      <p className="mt-2 text-[13px] text-(--chrome-fg-muted) leading-relaxed">
        {body}
      </p>
      <div className="mt-5 flex items-center justify-between">
        {comingSoon ? (
          <span className="inline-flex items-center h-6 px-2.5 rounded-(--chrome-radius-pill) border border-(--chrome-border) text-[10px] uppercase tracking-[0.12em] text-(--chrome-fg-muted)">
            Coming soon
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[12px] text-(--chrome-fg) group-hover:translate-x-0.5 transition-transform">
            Open <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </Cmp>
  );
}
