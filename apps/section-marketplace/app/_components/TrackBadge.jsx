const COLOR = {
  stable: "var(--chrome-track-stable)",
  experimental: "var(--chrome-track-experimental)",
  legacy: "var(--chrome-track-legacy)",
};

export default function TrackBadge({ track }) {
  const color = COLOR[track] ?? COLOR.legacy;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-(--chrome-fg-muted)"
      title={`Track: ${track}`}
    >
      <span
        aria-hidden
        className="inline-block size-2 rounded-full"
        style={{ background: color }}
      />
      {track}
    </span>
  );
}
