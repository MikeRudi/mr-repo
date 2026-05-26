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

  return (
    <button
      type="button"
      onClick={activate}
      disabled={busy || active}
      className="btn-chrome btn-chrome--ghost shrink-0"
    >
      {active ? "Active" : busy ? "Activating..." : "Activate"}
    </button>
  );
}
