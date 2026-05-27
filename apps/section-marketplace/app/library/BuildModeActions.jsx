"use client";

import { useRef, useState } from "react";

export default function BuildModeActions() {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadPackage(file) {
    if (!file) return;
    setUploading(true);
    setStatus("");

    try {
      const form = new FormData();
      form.append("package", file);
      const res = await fetch("/api/library/build-mode/submissions", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setStatus(data?.error ?? "Upload failed");
        return;
      }

      setStatus("Uploaded for review");
      window.location.reload();
    } catch {
      setStatus("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="/api/library/build-mode/package"
        className="btn-chrome"
      >
        Make a new section
      </a>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json,application/zip,.zip"
        className="sr-only"
        onChange={(event) => uploadPackage(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-chrome btn-chrome--ghost"
      >
        {uploading ? "Uploading..." : "Upload section"}
      </button>
      {status ? (
        <span
          className="text-[16px] text-[var(--chrome-fg-muted)]"
          style={{ textTransform: "none", letterSpacing: "normal" }}
        >
          {status}
        </span>
      ) : null}
    </div>
  );
}
