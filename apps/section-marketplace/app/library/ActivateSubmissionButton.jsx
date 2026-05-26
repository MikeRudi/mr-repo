"use client";

import { useState } from "react";

export default function ActivateSubmissionButton({ submissionId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const active = status === "active";

  async function activate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/library/build-mode/submissions/${submissionId}/activate`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Could not activate section");
        return;
      }
      setStatus(data.submission.status);
      window.location.reload();
    } catch {
      alert("Could not activate section");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/library/build-mode/submissions/${submissionId}/deactivate`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Could not deactivate section");
        return;
      }
      setStatus(data.submission.status);
      window.location.reload();
    } catch {
      alert("Could not deactivate section");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSubmission() {
    if (!window.confirm("Delete this submitted section from the review queue?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/library/build-mode/submissions/${submissionId}/delete`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Could not delete section");
        return;
      }
      setStatus(data.submission.status);
      window.location.reload();
    } catch {
      alert("Could not delete section");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {active ? (
        <button
          type="button"
          onClick={deactivate}
          disabled={busy}
          className="btn-chrome btn-chrome--ghost shrink-0"
        >
          {busy ? "Deactivating..." : "Deactivate"}
        </button>
      ) : (
        <button
          type="button"
          onClick={activate}
          disabled={busy}
          className="btn-chrome btn-chrome--ghost shrink-0"
        >
          {busy ? "Activating..." : "Activate"}
        </button>
      )}
      <button
        type="button"
        onClick={deleteSubmission}
        disabled={busy}
        className="btn-chrome btn-chrome--ghost shrink-0"
      >
        Delete
      </button>
    </div>
  );
}
