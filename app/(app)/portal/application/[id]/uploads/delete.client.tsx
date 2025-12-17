/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteButton({ attachmentId }: { attachmentId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function del() {
    toast("Remove this file?", {
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
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded border px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
      title="Delete"
      type="button">
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  );
}
