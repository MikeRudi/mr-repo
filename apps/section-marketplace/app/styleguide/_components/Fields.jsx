"use client";

// Small, intentionally plain inputs. All controlled.
// No external deps — we want the styleguide to be its own thing visually,
// independent of the chrome tokens.

export function Field({ label, hint, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-[16px]">
      <span className="font-normal text-[var(--chrome-fg)]">{label}</span>
      {children}
      {hint ? (
        <span className="text-[16px] leading-relaxed text-[var(--chrome-fg-subtle)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputBase =
  "min-h-11 px-3 rounded-[0.25rem] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[16px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)] tabular-nums";

export function TextInput({ value, onChange, placeholder, id, monospace = true }) {
  return (
    <input
      id={id}
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        monospace
          ? inputBase
          : inputBase.replace("font-[family-name:var(--chrome-font-mono)] ", "")
      }
    />
  );
}

export function NumberInput({ value, onChange, min, max, step, id, suffix }) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        min={min}
        max={max}
        step={step ?? "any"}
        className={`${inputBase} w-full ${suffix ? "pr-9" : ""}`}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--chrome-fg-subtle)]">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

export function ColorInput({ value, onChange, id }) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-14 cursor-pointer rounded-[0.25rem] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-1"
      />
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} flex-1`}
      />
    </div>
  );
}

export function SelectInput({ value, onChange, options, id }) {
  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} pr-7 appearance-none`}
    >
      {options.map((o) => {
        const [val, label] = Array.isArray(o) ? o : [o, o];
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

// Filter pills with a filled background style + hover.
// Used by Typography (scale picker), Cards, Buttons.
export function FilterPills({ items, activeId, onSelect }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2">
      {items.map(({ id, label }) => {
        const sel = id === activeId;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={sel}
            onClick={() => onSelect(id)}
            className={`inline-flex min-h-11 items-center rounded-[0.25rem] border px-4 text-[16px] font-normal transition-colors ${
              sel
                ? "border-[var(--chrome-fg)] bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                : "border-[var(--chrome-border)] bg-transparent text-[var(--chrome-fg)] hover:border-[var(--chrome-fg)] hover:bg-[var(--chrome-fg)] hover:text-[var(--chrome-fg-inverse)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Stack({ children, cols = 2 }) {
  const c =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : cols === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-4";
  return <div className={`grid ${c} gap-3`}>{children}</div>;
}
