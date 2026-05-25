import Link from "next/link";

export default function StartTile({
  href,
  title,
  body,
  comingSoon = false,
}) {
  const Cmp = href && !comingSoon ? Link : "div";
  const props = href && !comingSoon ? { href } : {};
  return (
    <Cmp
      {...props}
      className={`group relative flex h-full flex-col rounded-[0.25rem] border border-(--chrome-border) bg-(--chrome-surface) p-6 transition-colors ${
        comingSoon ? "opacity-45" : "hover:border-(--chrome-border-strong)"
      }`}
      aria-disabled={comingSoon ? "true" : undefined}
    >
      <h3 className="app-subtitle">
        {title}
      </h3>
      {body ? <p className="app-text mt-3">{body}</p> : null}
      <div className="mt-5 flex items-center justify-between">
        {comingSoon ? (
          <span className="inline-flex min-h-10 items-center rounded-[0.25rem] border border-(--chrome-border) px-3 text-[16px] text-(--chrome-fg-muted)">
            Coming soon
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[16px] text-(--chrome-fg) transition-transform group-hover:translate-x-0.5">
            Open <span aria-hidden>→</span>
          </span>
        )}
      </div>
    </Cmp>
  );
}
