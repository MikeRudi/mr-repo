import Link from "next/link";
import Chip from "./Chip.jsx";
import LifecycleBadge from "./LifecycleBadge.jsx";
import TrackBadge from "./TrackBadge.jsx";
import { hasImplementation } from "../../library/registry.js";

function toTitleCase(s) {
  if (!s) return s;
  return s
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function SectionCard({ section }) {
  const live = hasImplementation(section.id);
  return (
    <Link
      href={`/library/${section.id}`}
      className="group flex flex-col rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) hover:border-(--chrome-border-strong) transition-colors overflow-hidden"
    >
      <div className="relative aspect-[16/10] bg-(--chrome-surface-muted) border-b border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled) overflow-hidden">
        <span className="font-[family-name:var(--chrome-font-mono)] text-xs">
          {section.id}
        </span>
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-(--chrome-radius-pill) text-[10px] uppercase tracking-[0.12em] ${
            live
              ? "bg-(--chrome-fg) text-(--chrome-fg-inverse)"
              : "bg-(--chrome-surface) border border-(--chrome-border) text-(--chrome-fg-muted)"
          }`}
        >
          {live ? (
            <>
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[var(--chrome-track-stable)]"
              />
              Live
            </>
          ) : (
            "Soon"
          )}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Chip>{toTitleCase(section.category)}</Chip>
          <TrackBadge track={section.track} />
        </div>
        <div>
          <h3 className="font-[family-name:var(--chrome-font-display)] text-[18px] leading-tight text-(--chrome-fg)">
            {section.name}
          </h3>
          <p className="mt-1.5 text-[13px] text-(--chrome-fg-muted) line-clamp-2">
            {section.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <LifecycleBadge lifecycle={section.lifecycle} />
          <span className="text-[11px] text-(--chrome-fg-subtle) font-[family-name:var(--chrome-font-mono)]">
            v{section.version}
          </span>
        </div>
      </div>
    </Link>
  );
}
