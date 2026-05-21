// <Section> — the canonical wrapper every library section renders inside.
//
// Responsibilities (incremental, fleshed out across phases):
//   1. Tag the DOM with `data-mr-section="<id>"` so scoped CSS / motion
//      selectors can target a single instance.
//   2. Provide a stable container element so ScrollTrigger / Lenis can
//      use a consistent scope per section.
//   3. Forward props.tokens so a section can opt into per-instance token
//      overrides without polluting the global theme.

import { forwardRef } from "react";

const Section = forwardRef(function Section(
  { id, as: Tag = "section", className = "", tokens, style, children, ...rest },
  ref
) {
  const inlineStyle = tokens
    ? { ...style, ...Object.fromEntries(Object.entries(tokens).map(([k, v]) => [`--${k}`, v])) }
    : style;
  return (
    <Tag
      ref={ref}
      data-mr-section={id}
      className={className}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Section;
