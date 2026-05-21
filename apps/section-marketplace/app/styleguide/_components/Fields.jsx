"use client";

// Small, intentionally plain inputs. All controlled.
// No external deps — we want the styleguide to be its own thing visually,
// independent of the chrome tokens.

export function Field({ label, hint, children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-[12px]">
      <span className="text-[var(--chrome-fg)] font-medium">{label}</span>
      {children}
      {hint ? (
        <span className="text-[11px] text-[var(--chrome-fg-subtle)] leading-relaxed">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputBase =
  "h-9 px-2.5 rounded-[8px] bg-[var(--chrome-ground)] border border-[var(--chrome-border)] text-[13px] text-[var(--chrome-fg)] focus:outline-none focus:border-[var(--chrome-border-strong)] font-[family-name:var(--chrome-font-mono)] tabular-nums";

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
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--chrome-fg-subtle)] pointer-events-none">
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
        className="h-9 w-12 cursor-pointer rounded-[8px] border border-[var(--chrome-border)] bg-[var(--chrome-ground)] p-0.5"
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
    <div role="tablist" className="flex flex-wrap gap-1.5">
      {items.map(({ id, label }) => {
        const sel = id === activeId;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={sel}
            onClick={() => onSelect(id)}
            className={`inline-flex items-center h-7 px-3 rounded-full text-[11px] font-medium transition-colors ${
              sel
                ? "bg-[var(--chrome-fg)] text-[var(--chrome-fg-inverse)]"
                : "bg-[var(--chrome-ground)] text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-fg)] hover:text-[var(--chrome-fg-inverse)]"
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
