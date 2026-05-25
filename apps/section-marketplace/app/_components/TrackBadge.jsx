const COLOR = {
  stable: "var(--chrome-track-stable)",
  experimental: "var(--chrome-track-experimental)",
  legacy: "var(--chrome-track-legacy)",
};

export default function TrackBadge({ track }) {
  const color = COLOR[track] ?? COLOR.legacy;
  return (
    <span
      className="inline-flex items-center gap-2 text-[16px] font-normal text-(--chrome-fg-muted)"
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
