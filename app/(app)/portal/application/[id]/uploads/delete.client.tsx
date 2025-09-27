/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({ attachmentId }: { attachmentId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm("Remove this file?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/uploads/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Delete failed (${res.status})`);
      }
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
      title="Delete">
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  );
}
