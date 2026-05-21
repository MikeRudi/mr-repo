const KEY = {
  Local: "local",
  Draft: "draft",
  Submitted: "submitted",
  "In Review": "inreview",
  InReview: "inreview",
  Approved: "approved",
  Promoted: "promoted",
  Deprecated: "deprecated",
  Archived: "archived",
};

export default function LifecycleBadge({ lifecycle }) {
  const key = KEY[lifecycle] ?? lifecycle?.toLowerCase() ?? "local";
  const color = `var(--chrome-lifecycle-${key})`;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-6 rounded-(--chrome-radius-pill) bg-(--chrome-surface) border border-(--chrome-border) text-[11px] font-medium text-(--chrome-fg)"
      title={`Lifecycle: ${lifecycle}`}
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full"
        style={{ background: color }}
      />
      {lifecycle}
    </span>
  );
}
