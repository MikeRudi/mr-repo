"use client";

import styles from "./Section.module.css";
import EditableText from "../../_shared/EditableText.jsx";
import { buttonClass } from "../../../../lib/styleguide-defaults.js";

const DEFAULT_TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "CEO, Creative Studio",
    image: "",
    quote: "This transformed how we present our work. The attention to detail is incredible.",
    featured: false
  },
  {
    name: "Michael Chen",
    role: "Design Director",
    image: "",
    quote: "Bold, expressive, and exactly what modern agencies need to stand out.",
    featured: false
  },
  {
    name: "Emma Williams",
    role: "Founder, Brand Co",
    image: "",
    quote: "The typography and color system helped us create a lasting impression from the first scroll.",
    featured: true
  }
];

function pctToPadding(pct) {
  const value = typeof pct === "number" ? pct : 50;
  return Math.round(32 + (value / 100) * 160);
}

function pctToGap(pct) {
  const value = typeof pct === "number" ? pct : 30;
  return Math.round(16 + (value / 100) * 48);
}

function isHeadingTag(value) {
  return /^h[1-6]$/.test(value ?? "");
}

export default function KlarheitTestimonial05({
  eyebrow = "Testimonials",
  heading = "What our clients say",
  headingTypography = "h2",
  textColor = "dark",
  accentColor = "brand",
  sectionPaddingPct = 50,
  cardGapPct = 30,
  ctaButtonVariant = "primary",
  ctaText = "View all testimonials",
  ctaLink = "#",
  testimonials = DEFAULT_TESTIMONIALS,
  _editing = false,
  _onPropChange,
} = {}) {
  const safeTestimonials = Array.isArray(testimonials) && testimonials.length ? testimonials : DEFAULT_TESTIMONIALS;
  const HeadingTag = isHeadingTag(headingTypography) ? headingTypography : "h2";

  const persist = (key, value) => {
    if (_onPropChange) _onPropChange(key, value);
  };

  const featuredTestimonial = safeTestimonials.find(t => t.featured === "true" || t.featured === true);
  const regularTestimonials = safeTestimonials.filter(t => t.featured !== "true" && t.featured !== true);

  return (
    <section
      className={styles.root}
      style={{
        "--section-padding": `${pctToPadding(sectionPaddingPct)}px`,
        "--section-text": `var(--sg-color-${textColor}, var(--chrome-fg))`,
        "--accent-color": `var(--sg-color-${accentColor}, var(--chrome-primary))`,
        "--card-gap": `${pctToGap(cardGapPct)}px`,
      }}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <EditableText
              as="p"
              value={eyebrow}
              editing={_editing}
              onChange={(value) => persist("eyebrow", value)}
              className={styles.eyebrow}
              placeholder="Eyebrow"
            />
            <EditableText
              as={HeadingTag}
              value={heading}
              editing={_editing}
              onChange={(value) => persist("heading", value)}
              className={styles.heading}
              placeholder="Heading"
            />
          </div>
          <EditableText
            as="a"
            value={ctaText}
            editing={_editing}
            onChange={(value) => persist("ctaText", value)}
            className={`${styles.cta} ${buttonClass(ctaButtonVariant)}`}
            href={ctaLink}
            placeholder="CTA text"
          />
        </div>

        <div className={styles.grid}>
          {featuredTestimonial && (
            <div className={`${styles.card} ${styles.featured}`}>
              {featuredTestimonial.image && (
                <div className={styles.portrait}>
                  <img src={featuredTestimonial.image} alt={featuredTestimonial.name} />
                </div>
              )}
              <blockquote className={styles.quote}>
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </blockquote>
              <div className={styles.author}>
                <div className={styles.name}>{featuredTestimonial.name}</div>
                <div className={styles.role}>{featuredTestimonial.role}</div>
              </div>
            </div>
          )}

          {regularTestimonials.map((testimonial, index) => (
            <div key={index} className={styles.card}>
              {testimonial.image && (
                <div className={styles.portrait}>
                  <img src={testimonial.image} alt={testimonial.name} />
                </div>
              )}
              <blockquote className={styles.quote}>
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className={styles.author}>
                <div className={styles.name}>{testimonial.name}</div>
                <div className={styles.role}>{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
