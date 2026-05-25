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
      className="group flex flex-col overflow-hidden rounded-[0.25rem] border border-(--chrome-border) bg-(--chrome-surface) transition-colors hover:border-(--chrome-border-strong)"
    >
      <div className="relative aspect-[16/10] bg-(--chrome-surface-muted) border-b border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled) overflow-hidden">
        <span className="font-[family-name:var(--chrome-font-mono)] text-[16px]">
          {section.id}
        </span>
        <span
          className={`absolute right-3 top-3 inline-flex min-h-10 items-center gap-2 rounded-[0.25rem] border px-3 text-[16px] ${
            live
              ? "border-(--chrome-fg) bg-(--chrome-fg) text-(--chrome-fg-inverse)"
              : "border-(--chrome-border) bg-(--chrome-surface) text-(--chrome-fg-muted)"
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
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <Chip>{toTitleCase(section.category)}</Chip>
          <TrackBadge track={section.track} />
        </div>
        <div>
          <h3 className="app-subtitle">
            {section.name}
          </h3>
          <p className="app-text mt-2 line-clamp-2">
            {section.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <LifecycleBadge lifecycle={section.lifecycle} />
          <span className="font-[family-name:var(--chrome-font-mono)] text-[16px] text-(--chrome-fg-subtle)">
            v{section.version}
          </span>
        </div>
      </div>
    </Link>
  );
}
