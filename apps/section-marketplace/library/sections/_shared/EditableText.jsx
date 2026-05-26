"use client";

import { useEffect, useRef } from "react";

// Shared inline-edit helper used by every section. See app-rules-ai/making-a-section/section-panel.md.
//
// Behaviour:
//   - When `editing` is false, renders the text as plain content.
//   - When `editing` is true, the element is rendered as a contentEditable
//     node that activates on double-click. Click positions the cursor only
//     after activation. Blur or Escape commits the new value via `onChange`.
//   - Enter inserts a line break for `multiline`, otherwise it commits.
//
// `as` lets sections pick the rendered tag (h1..h6, p, span, etc.).

export default function EditableText({
  value,
  editing = false,
  multiline = false,
  onChange,
  as: Tag = "span",
  className = "",
  placeholder = "",
  ...rest
}) {
  const ref = useRef(null);
  const lastValueRef = useRef(value);

  // Keep DOM text in sync with the controlled value, but only when we're not
  // actively editing — otherwise React would clobber the cursor on each
  // keystroke.
  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.innerText !== (value ?? "")) {
      ref.current.innerText = value ?? "";
    }
    lastValueRef.current = value;
  }, [value]);

  if (!editing) {
    return (
      <Tag className={className} {...rest}>
        {value || placeholder}
      </Tag>
    );
  }

  const commit = () => {
    const next = ref.current?.innerText ?? "";
    if (next !== lastValueRef.current) {
      lastValueRef.current = next;
      onChange?.(next);
    }
  };

  return (
    <Tag
      ref={ref}
      className={`${className} editable-text`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onDoubleClick={(e) => {
        // Bring focus on double-click, place caret at the end
        const el = e.currentTarget;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }}
      onClick={(e) => {
        // Don't trigger parent section selection while editing this text
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          ref.current?.blur();
        } else if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          ref.current?.blur();
        }
      }}
      onBlur={commit}
      data-placeholder={placeholder}
      {...rest}
    >
      {value}
    </Tag>
  );
}
