/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useTransition } from "react";
import { decideApplication } from "../actions";
import { toast } from "sonner";

export default function DecisionForm({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [decisionPreview, setDecisionPreview] = useState<
    "UNDER_REVIEW" | "APPROVE" | "REJECT" | null
  >(null);

  const showRejectReason = decisionPreview === "REJECT";

  const statusHelp = useMemo(() => {
    if (currentStatus === "APPROVED" || currentStatus === "REJECTED") {
      return "This application is finalized. If you need to change it, we can add an override flow.";
    }
    return "Choose an action to update status and log the change.";
  }, [currentStatus]);

  function submit(
    decision: "UNDER_REVIEW" | "APPROVE" | "REJECT",
    form: HTMLFormElement
  ) {
    setError(null);
    const fd = new FormData(form);
    fd.set("decision", decision);

    const t = toast.loading("Updating status…");

    startTransition(async () => {
      try {
        await decideApplication(fd);
        toast.success("Status updated", { id: t });
      } catch (e: any) {
        const msg = e?.message ?? "Something went wrong.";
        toast.error("Update failed", { id: t, description: msg });
        setError(msg); // optional inline error
      }
    });
  }

  return (
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="decision" value="" />

      <div className="text-sm text-slate-700">
        Current status: <span className="font-semibold">{currentStatus}</span>
      </div>
      <p className="text-xs text-slate-500">{statusHelp}</p>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-900">Admin note</label>
        <textarea
          name="adminNote"
          className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="Internal notes for the record…"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-900">
          Rejection reason{" "}
          <span className="text-slate-500">(required only if rejecting)</span>
        </label>
        <textarea
          name="rejectionReason"
          className={`min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm ${
            showRejectReason ? "" : "opacity-60"
          }`}
          placeholder="Why was this rejected?"
          disabled={!showRejectReason}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onMouseEnter={() => setDecisionPreview("UNDER_REVIEW")}
          onFocus={() => setDecisionPreview("UNDER_REVIEW")}
          onClick={(e) =>
            submit("UNDER_REVIEW", (e.currentTarget as HTMLButtonElement).form!)
          }
          className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60">
          {pending ? "Working…" : "Set UNDER_REVIEW"}
        </button>

        <button
          type="button"
          disabled={pending}
          onMouseEnter={() => setDecisionPreview("APPROVE")}
          onFocus={() => setDecisionPreview("APPROVE")}
          onClick={(e) =>
            submit("APPROVE", (e.currentTarget as HTMLButtonElement).form!)
          }
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Working…" : "Approve"}
        </button>

        <button
          type="button"
          disabled={pending}
          onMouseEnter={() => setDecisionPreview("REJECT")}
          onFocus={() => setDecisionPreview("REJECT")}
          onClick={(e) =>
            submit("REJECT", (e.currentTarget as HTMLButtonElement).form!)
          }
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Working…" : "Reject"}
        </button>
      </div>
    </form>
  );
}
