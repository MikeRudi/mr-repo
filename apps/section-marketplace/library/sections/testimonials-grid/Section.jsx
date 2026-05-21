const DEFAULT_ITEMS = [
  {
    quote:
      "MakeReign built us a marketing site that the engineering team didn't have to babysit. We ship pages in hours, not weeks.",
    author: "Maya Chen",
    role: "VP Marketing, Lattice",
  },
  {
    quote:
      "The judgement on small things — the spacing, the type, the moments of motion — is what sets their work apart.",
    author: "Tomás Reyes",
    role: "Creative Director, Field Notes",
  },
  {
    quote:
      "We came for the launch, we stayed because the system actually scaled to twelve country sites without a rebuild.",
    author: "Anya Petrov",
    role: "Head of Brand, North & Co.",
  },
];

export default function TestimonialsGrid({
  eyebrow = "Voices",
  heading = "What clients say after the launch.",
  items = DEFAULT_ITEMS,
} = {}) {
  return (
    <section className="bg-(--chrome-ground) text-(--chrome-fg)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-28">
        <div className="max-w-[640px]">
          <p
            data-sg-prop="eyebrow"
            className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)"
          >
            {eyebrow}
          </p>
          <h2
            data-sg-prop="heading"
            className="mt-3 font-[family-name:var(--chrome-font-display)] text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.01em] text-(--chrome-fg)"
          >
            {heading}
          </h2>
        </div>
        <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex flex-col gap-6 p-7 bg-(--chrome-surface) border border-(--chrome-border) rounded-(--chrome-radius-card) hover:border-(--chrome-border-strong) transition-colors"
            >
              <p
                data-sg-prop="items"
                data-sg-index={i}
                data-sg-sub="quote"
                className="text-[18px] leading-[1.4] text-(--chrome-fg) font-[family-name:var(--chrome-font-display)]"
              >
                <span aria-hidden className="text-(--chrome-fg-subtle)">“</span>
                {item.quote}
                <span aria-hidden className="text-(--chrome-fg-subtle)">”</span>
              </p>
              <div className="mt-auto pt-2 border-t border-(--chrome-border)">
                <p
                  data-sg-prop="items"
                  data-sg-index={i}
                  data-sg-sub="author"
                  className="text-[13px] font-medium text-(--chrome-fg)"
                >
                  {item.author}
                </p>
                <p
                  data-sg-prop="items"
                  data-sg-index={i}
                  data-sg-sub="role"
                  className="text-[12px] text-(--chrome-fg-muted) mt-0.5"
                >
                  {item.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
