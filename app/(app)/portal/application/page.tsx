import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, FileDown, UploadCloud, AlertTriangle } from "lucide-react";

// --- helpers ---
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

const STATUS_ORDER = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;
type AppStatus = (typeof STATUS_ORDER)[number];

function statusIndex(s: string) {
  const i = STATUS_ORDER.indexOf(s.toUpperCase() as AppStatus);
  return i === -1 ? 0 : i;
}

function pillClass(status: string) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return map[s] ?? map["DRAFT"];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${pillClass(
        s
      )}`}>
      {s.replace("_", " ")}
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const idx = statusIndex(status);
  const pct = Math.min(
    100,
    Math.round((idx / (STATUS_ORDER.length - 1)) * 100)
  );
  const color =
    status === "APPROVED"
      ? "bg-emerald-500"
      : status === "REJECTED"
      ? "bg-rose-500"
      : "bg-blue-500";
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="w-1/5 text-center">
            {s.replace("_", " ")}
          </span>
        ))}
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-6xl p-6">
          <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">My Application</h1>
            <p className="mt-2 text-slate-600">
              We couldn&apos;t find your member record yet. Try reloading this
              page or signing out and back in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const app = apps[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                My Application
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Members may submit one application. Manage uploads and download
                your PDF here.
              </p>
            </div>
            {!app && (
              <Link
                href="/portal/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
                Apply <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-6">
        {apps.length > 1 && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>
              You have multiple applications on file. Only the most recent is
              shown below.
            </span>
          </div>
        )}

        {!app ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-slate-50/60 px-6 py-12 text-center">
            <p className="text-sm text-slate-600">No application found.</p>
            <Link
              href="/portal/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-5 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Application{" "}
                  <span className="font-mono text-xs text-slate-600">
                    #{app.id}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  Created {fmtDate(app.createdAt)}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard label="Purpose" value={app.purpose || "—"} />
              <InfoCard label="Email" value={app.email} />
            </div>

            <div className="mt-6">
              <ProgressBar status={app.status} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/portal/application/${app.id}/uploads`}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
                <UploadCloud className="h-4 w-4" /> Manage Uploads
              </Link>
              <a
                href={`/api/applications/${app.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
                <FileDown className="h-4 w-4" /> Download PDF
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800 break-words">{value}</p>
    </div>
  );
}
