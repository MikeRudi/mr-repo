import Link from "next/link";
import Chip from "./Chip.jsx";
import LifecycleBadge from "./LifecycleBadge.jsx";
import TrackBadge from "./TrackBadge.jsx";

export default function SectionCard({ section }) {
  return (
    <Link
      href={`/library/${section.id}`}
      className="group flex flex-col rounded-(--chrome-radius-card) bg-(--chrome-surface) border border-(--chrome-border) hover:border-(--chrome-border-strong) transition-colors overflow-hidden"
    >
      <div className="aspect-[16/10] bg-(--chrome-surface-muted) border-b border-(--chrome-border) grid place-items-center text-(--chrome-fg-disabled)">
        <span className="font-[family-name:var(--chrome-font-mono)] text-xs">
          {section.id}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Chip>{section.category}</Chip>
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
