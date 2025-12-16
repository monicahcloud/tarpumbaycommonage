/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAttachmentButton({
  id,
  applicationId,
}: {
  id: string;
  applicationId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function confirmDelete() {
    toast.warning("Delete attachment?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => doDelete(),
      },
      cancel: (
        <button className="px-2 py-1 text-sm text-slate-700 hover:underline">
          Cancel
        </button>
      ),
    });
  }

  async function doDelete() {
    if (busy) return;

    const t = toast.loading("Deleting attachment…");
    setBusy(true);

    try {
      const res = await fetch(
        `/api/admin/attachments/${id}?applicationId=${encodeURIComponent(
          applicationId
        )}`,
        { method: "DELETE" }
      );

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(json?.error ?? `Delete failed (${res.status})`);
      }

      toast.success("Attachment deleted", { id: t });
      router.refresh();
    } catch (err: any) {
      toast.error("Delete failed", {
        id: t,
        description: err?.message ?? "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={confirmDelete}
      disabled={busy}
      className="inline-flex items-center justify-center rounded-lg border bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      aria-label="Delete attachment"
      title="Delete">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
