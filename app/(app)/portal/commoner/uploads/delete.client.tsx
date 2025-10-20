"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ attachmentId }: { attachmentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const del = async () => {
    if (!confirm("Delete this file?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/uploads/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const t = await res.text();
        alert(`Delete failed. ${t}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50">
      {busy ? "Deleting..." : "Delete"}
    </button>
  );
}
