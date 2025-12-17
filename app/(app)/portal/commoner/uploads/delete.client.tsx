/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteButton({ attachmentId }: { attachmentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const del = () => {
    toast("Delete this file?", {
      action: {
        label: "Delete",
        onClick: async () => {
          const t = toast.loading("Deleting…");
          setBusy(true);
          try {
            const res = await fetch(`/api/uploads/${attachmentId}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              const txt = await res.text().catch(() => "");
              throw new Error(txt || `Delete failed (${res.status})`);
            }
            toast.success("Deleted", { id: t });
            router.refresh();
          } catch (err: any) {
            toast.error("Delete failed", {
              id: t,
              description: err?.message ?? "Something went wrong.",
            });
          } finally {
            setBusy(false);
          }
        },
      },
      cancel: "Cancel",
    });
  };

  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50">
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
