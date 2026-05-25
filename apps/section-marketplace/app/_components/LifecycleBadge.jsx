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
      className="inline-flex min-h-10 items-center gap-2 rounded-[0.25rem] border border-(--chrome-border) bg-(--chrome-surface) px-3 text-[16px] font-normal text-(--chrome-fg)"
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
