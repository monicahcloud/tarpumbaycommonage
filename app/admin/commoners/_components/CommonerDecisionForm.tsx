// app/admin/commoners/_components/CommonerDecisionForm.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function CommonerDecisionForm({
  regId,
  currentStatus,
  canApprove,
}: {
  regId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
  canApprove: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  async function decide(next: "APPROVED" | "REJECTED") {
    if (next === "APPROVED" && !canApprove) {
      toast.error("Cannot approve", {
        description: "Missing required documents. Upload them first.",
      });
      return;
    }
    if (next === "REJECTED" && rejectionReason.trim().length === 0) {
      toast.error("Rejection reason required");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/commoners/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next,
          note: note.trim() || null,
          rejectionReason: next === "REJECTED" ? rejectionReason.trim() : null,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        toast.error("Update failed", { description: t });
        return;
      }

      toast.success("Updated");
      // simplest: hard refresh the page
      window.location.reload();
    });
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-700">
        Current status: <strong>{currentStatus}</strong>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-slate-700">
          Admin note (optional)
        </label>
        <textarea
          className="min-h-[70px] rounded-xl border bg-white p-3 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-slate-700">
          Rejection reason (required if rejecting)
        </label>
        <textarea
          className="min-h-[70px] rounded-xl border bg-white p-3 text-sm"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !canApprove}
          onClick={() => decide("APPROVED")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? "Working…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("REJECTED")}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? "Working…" : "Reject"}
        </button>

        {!canApprove ? (
          <span className="self-center text-xs text-amber-700">
            Upload missing required docs to enable approval.
          </span>
        ) : null}
      </div>
    </div>
  );
}
