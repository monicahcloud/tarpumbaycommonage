"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Loader2, Save, ShieldAlert } from "lucide-react";

// ---------- Types that match your admin API response ----------
export type AdminDocument = {
  id: string;
  url: string;
  pathname?: string | null;
  contentType?: string | null;
};

export type StatusLog = {
  id: string;
  createdAt: string | Date;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  note?: string | null;
};

export type ApplicationAdmin = {
  id: string;
  // Some APIs send these combined, others as first/last — support both
  applicantName?: string | null;
  applicantEmail?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;

  status: string;
  lotNumber?: string | null;
  rejectionReason?: string | null;
  nextSteps?: string | null;
  adminNote?: string | null;

  feeAmount?: number | null;
  feesPaid?: boolean | null;
  feePaidAt?: string | Date | null;

  documents: AdminDocument[];
  statusHistory: StatusLog[];
};

// Preferred canonical statuses for admin
const STATUS_OPTIONS = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

function normalizeStatus(s: string | undefined) {
  const val = (s || "").toUpperCase();
  if (["PENDING", "SUBMITTED"].includes(val)) return "SUBMITTED";
  if (["INREVIEW", "IN_REVIEW", "UNDER_REVIEW"].includes(val))
    return "UNDER_REVIEW";
  if (val === "APPROVED") return "APPROVED";
  if (val === "REJECTED") return "REJECTED";
  return val || "SUBMITTED";
}

function fmtDateTime(d: string | Date | undefined | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminApplicationDetail() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params?.applicationId;

  const [application, setApplication] = useState<ApplicationAdmin | null>(null);
  const [status, setStatus] = useState<string>("SUBMITTED");
  const [lotNumber, setLotNumber] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive friendly name/email regardless of backend shape
  const applicantName = useMemo(() => {
    if (!application) return "";
    if (application.applicantName) return application.applicantName;
    const parts = [application.firstName, application.lastName].filter(Boolean);
    return parts.join(" ");
  }, [application]);
  const applicantEmail = useMemo(
    () => application?.applicantEmail || application?.email || "",
    [application]
  );

  useEffect(() => {
    if (!applicationId) return;
    setError(null);
    fetch(`/api/admin/applications/${applicationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((data: { application: ApplicationAdmin }) => {
        const app = data.application;
        setApplication(app);
        setStatus(normalizeStatus(app.status));
        setLotNumber(app.lotNumber ?? "");
        setRejectionReason(app.rejectionReason ?? "");
        setNextSteps(app.nextSteps ?? "");
        setAdminNote(app.adminNote ?? "");
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to fetch")
      );
  }, [applicationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!applicationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          lotNumber,
          rejectionReason,
          nextSteps,
          adminNote,
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = (await res.json()) as { updated: ApplicationAdmin };
      setApplication(data.updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!application) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
        {error && (
          <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Application{" "}
            <span className="font-mono text-xs text-slate-600">
              #{application.id}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {applicantName || "Unnamed"}{" "}
            {applicantEmail ? (
              <span className="text-slate-500">• {applicantEmail}</span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/portal/application/${application.id}/uploads`}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
            View Member Uploads
          </Link>
        </div>
      </div>

      {/* Fees */}
      <section className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <h2 className="text-base font-semibold">Fees</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-slate-500">Amount: </span>
            {application.feeAmount ?? "—"}
          </div>
          <div>
            <span className="text-slate-500">Paid: </span>
            {application.feesPaid ? "Yes" : "No"}
          </div>
          {application.feesPaid ? (
            <div>
              <span className="text-slate-500">Paid at: </span>
              {fmtDateTime(application.feePaidAt)}
            </div>
          ) : null}
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <h2 className="text-base font-semibold">Documents</h2>
        {application.documents?.length ? (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {application.documents.map((doc: AdminDocument) => (
              <li key={doc.id} className="truncate text-sm">
                <a
                  className="text-blue-700 hover:underline"
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer">
                  {doc.pathname ?? doc.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No documents uploaded.</p>
        )}
      </section>

      {/* Admin form */}
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
        <h2 className="text-base font-semibold">Admin Controls</h2>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
            <label className="text-sm text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(normalizeStatus(e.target.value))}
              className="rounded-xl border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {status === "APPROVED" && (
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
              <label className="text-sm text-slate-700">Lot Number</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {status === "REJECTED" && (
            <>
              <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                <label className="text-sm text-slate-700">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                <label className="text-sm text-slate-700">
                  Next Steps for Member
                </label>
                <textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </>
          )}

          <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
            <label className="text-sm text-slate-700">Add Admin Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <ShieldAlert className="mr-1 inline h-4 w-4" /> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link
              href={`/admin`}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Status history */}
      <section className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <h3 className="text-base font-semibold">Status History / Logs</h3>
        {application.statusHistory?.length ? (
          <ul className="mt-2 space-y-2">
            {application.statusHistory.map((log: StatusLog) => (
              <li key={log.id} className="text-sm text-slate-700">
                {fmtDateTime(log.createdAt)} — {log.fromStatus} → {log.toStatus}{" "}
                by {log.changedBy}
                {log.note ? (
                  <span className="text-slate-500"> — {log.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No logs yet.</p>
        )}
      </section>

      {/* Quick links */}
      <div className="pt-2 text-right text-sm">
        <a
          href={`/api/applications/${application.id}/pdf`}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-slate-50">
          <FileText className="h-4 w-4" /> Export PDF
        </a>
      </div>
    </div>
  );
}
