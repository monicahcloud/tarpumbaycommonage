/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/documents/row-delete.client.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this document? The file will also be removed."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Delete failed");
      }
      toast.success("Deleted");
      // Optimistic: remove row without full reload
      const tr = document.querySelector<HTMLTableRowElement>(`tr[key="${id}"]`);
      tr?.remove();
      // Fallback: reload
      if (!tr) location.reload();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
