"use client";

import { useState } from "react";

const REASONS = [
  "Launch a new product or campaign site",
  "Replatform an existing site to React",
  "Build a design system that scales",
  "Add motion + craft to a stale brand",
];

export default function FormContactSplit({
  eyebrow = "Get in touch",
  heading = "Tell us what you're working on.",
  reasons = REASONS,
} = {}) {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  function update(key) {
    return (e) => setState((s) => ({ ...s, [key]: e.target.value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!state.name || !state.email || !state.message) {
      setStatus("error");
      return;
    }
    setStatus("submitted");
  }

  return (
    <section className="bg-(--chrome-ground) text-(--chrome-fg)">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-(--chrome-fg-subtle)">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--chrome-font-display)] text-[clamp(36px,4.5vw,64px)] leading-[1.05] tracking-[-0.01em] text-(--chrome-fg)">
            {heading}
          </h2>
          <p className="mt-6 text-[14px] text-(--chrome-fg-muted) max-w-[440px] leading-relaxed">
            We typically reply within a working day. The more detail in your
            message, the better the first response.
          </p>
          <ul className="mt-8 space-y-2">
            {reasons.map((r) => (
              <li
                key={r}
                className="flex items-start gap-3 text-[13px] text-(--chrome-fg-muted)"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 rounded-full bg-(--chrome-fg)"
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-(--chrome-surface) border border-(--chrome-border) rounded-(--chrome-radius-card) p-7 flex flex-col gap-5"
        >
          <Field label="Name" htmlFor="name">
            <input
              id="name"
              value={state.name}
              onChange={update("name")}
              className="h-11 w-full px-3 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) text-[14px] focus:outline-none focus:border-(--chrome-border-strong)"
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              value={state.email}
              onChange={update("email")}
              className="h-11 w-full px-3 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) text-[14px] focus:outline-none focus:border-(--chrome-border-strong)"
            />
          </Field>
          <Field label="What you're working on" htmlFor="message">
            <textarea
              id="message"
              rows={5}
              value={state.message}
              onChange={update("message")}
              className="w-full p-3 rounded-(--chrome-radius-2) bg-(--chrome-ground) border border-(--chrome-border) text-[14px] focus:outline-none focus:border-(--chrome-border-strong) resize-y"
            />
          </Field>
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[12px] text-(--chrome-fg-subtle)">
              By submitting you agree to our privacy notice.
            </p>
            <button
              type="submit"
              disabled={status === "submitted"}
              className="inline-flex items-center h-10 px-5 rounded-(--chrome-radius-pill) bg-(--chrome-fg) text-(--chrome-fg-inverse) text-[13px] disabled:opacity-50"
            >
              {status === "submitted" ? "Sent" : "Send message"}
            </button>
          </div>
          {status === "error" ? (
            <p className="text-[12px] text-[var(--chrome-track-experimental)]">
              Please fill in all three fields.
            </p>
          ) : null}
          {status === "submitted" ? (
            <p className="text-[12px] text-[var(--chrome-track-stable)]">
              Thanks. We'll get back to you within a working day.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-[12px] text-(--chrome-fg)">{label}</span>
      {children}
    </label>
  );
}
