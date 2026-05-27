"use client";

import React, { useEffect, useMemo, useState } from "react";

const BABEL_URL = "https://unpkg.com/@babel/standalone/babel.min.js";

let babelPromise;

function loadBabel() {
  if (globalThis.Babel) return Promise.resolve(globalThis.Babel);
  if (!babelPromise) {
    babelPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = BABEL_URL;
      script.async = true;
      script.onload = () => resolve(globalThis.Babel);
      script.onerror = () => reject(new Error("Could not load section compiler."));
      document.head.append(script);
    });
  }
  return babelPromise;
}

function makeClassMap(css, sectionId) {
  const classes = new Set();
  for (const match of css.matchAll(/\.([_a-zA-Z][\w-]*)/g)) {
    classes.add(match[1]);
  }
  return Object.fromEntries(
    [...classes].map((name) => [
      name,
      `mr-submitted-${sectionId}-${name}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
    ])
  );
}

function scopeCss(css, classMap) {
  let next = css;
  for (const [local, scoped] of Object.entries(classMap)) {
    next = next.replace(new RegExp(`\\.${local}(?![\\w-])`, "g"), `.${scoped}`);
  }
  return next;
}

function makeAssetUrlMap(files) {
  const entries = Object.entries(files ?? {}).filter(
    ([path, value]) => path.startsWith("assets/") && value?.encoding === "base64" && value?.content
  );
  return Object.fromEntries(
    entries.map(([path, value]) => {
      const publicPath = `/${path.slice("assets/".length)}`;
      const mimeType = value.mimeType ?? "application/octet-stream";
      return [publicPath, `data:${mimeType};base64,${value.content}`];
    })
  );
}

function rewriteAssetPaths(text, assetUrls) {
  let next = text ?? "";
  for (const [publicPath, dataUrl] of Object.entries(assetUrls)) {
    next = next.split(publicPath).join(dataUrl);
    next = next.split(publicPath.slice(1)).join(dataUrl);
  }
  return next;
}

function stripImports(source) {
  return source
    .replace(/^[\s;]*["']use client["'];?/m, "")
    .replace(/^import\s+[^;]+;?$/gm, "");
}

function getExportName(source) {
  const functionMatch = source.match(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/);
  if (functionMatch) return functionMatch[1];
  const namedExportMatch = source.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/);
  if (namedExportMatch) return namedExportMatch[1];
  return "SubmittedSection";
}

function normalizeSource(source, exportName) {
  return stripImports(source)
    .replace(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)/, "function $1")
    .replace(new RegExp(`export\\s+default\\s+${exportName}\\s*;?`), "")
    .replace(/export\s+default\s+function\s*\(/, `function ${exportName}(`);
}

function EditableText({
  value,
  editing = false,
  multiline = false,
  onChange,
  as: Tag = "span",
  className = "",
  placeholder = "",
  ...rest
}) {
  if (!editing) {
    return <Tag className={className} {...rest}>{value || placeholder}</Tag>;
  }
  return (
    <Tag
      className={`${className} editable-text`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(event) => onChange?.(event.currentTarget.innerText)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !multiline) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      {...rest}
    >
      {value}
    </Tag>
  );
}

function buttonClass(variant = "primary") {
  return variant === "primary" ? "sg-button" : `sg-button-${variant}`;
}

export default function SubmittedSectionRenderer({
  section,
  props = {},
  editing = false,
  onPropChange,
}) {
  const files = section?.packageData?.files ?? {};
  const source = files["section/Section.jsx"] ?? "";
  const css = files["section/Section.module.css"] ?? "";
  const sectionId = section?.id ?? "submitted";
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState("");

  const assetUrls = useMemo(() => makeAssetUrlMap(files), [files]);
  const sourceWithAssets = useMemo(() => rewriteAssetPaths(source, assetUrls), [source, assetUrls]);
  const cssWithAssets = useMemo(() => rewriteAssetPaths(css, assetUrls), [css, assetUrls]);
  const classMap = useMemo(() => makeClassMap(cssWithAssets, sectionId), [cssWithAssets, sectionId]);
  const scopedCss = useMemo(() => scopeCss(cssWithAssets, classMap), [cssWithAssets, classMap]);

  useEffect(() => {
    let cancelled = false;
    async function compile() {
      setError("");
      setComponent(null);
      try {
        const Babel = await loadBabel();
        const exportName = getExportName(sourceWithAssets);
        const normalized = normalizeSource(sourceWithAssets, exportName);
        const compiled = Babel.transform(normalized, {
          presets: [["react", { runtime: "classic" }]],
        }).code;
        const factory = new Function(
          "React",
          "styles",
          "EditableText",
          "buttonClass",
          `"use strict"; const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React; ${compiled}; return ${exportName};`
        );
        const NextComponent = factory(React, classMap, EditableText, buttonClass);
        if (!cancelled) setComponent(() => NextComponent);
      } catch (compileError) {
        if (!cancelled) {
          setError(compileError?.message ?? "Could not compile submitted section.");
        }
      }
    }
    compile();
    return () => {
      cancelled = true;
    };
  }, [sourceWithAssets, classMap]);

  if (!source) {
    return <SubmittedError section={section} message="Submitted section source is missing." />;
  }

  if (error) {
    return <SubmittedError section={section} message={error} />;
  }

  if (!Component) {
    return <SubmittedError section={section} message="Loading submitted section..." muted />;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <Component {...props} _editing={editing} _onPropChange={onPropChange} />
    </>
  );
}

function SubmittedError({ section, message, muted = false }) {
  return (
    <div className="grid min-h-[360px] place-items-center px-6 py-20 text-center">
      <div className="max-w-[520px]">
        <p className="text-[16px] font-medium text-[var(--chrome-fg)]">
          {section?.name ?? "Submitted section"}
        </p>
        <p
          className={`mt-2 text-[16px] ${muted ? "text-[var(--chrome-fg-muted)]" : "text-red-700"}`}
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
