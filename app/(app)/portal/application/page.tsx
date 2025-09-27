import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// --- small helpers ---
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[s] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${cls}`}>
      {s.replace("_", " ")}
    </span>
  );
}

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">My Application</h1>
        <p className="mt-2 text-slate-600">
          We couldn’t find your member record yet. Try reloading this page or
          signing out and back in.
        </p>
      </div>
    );
  }

  // Fetch all but we’ll only show the latest (enforce one application UX)
  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const app = apps[0];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Application
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Members may submit one application. Manage uploads and download your
            PDF here.
          </p>
        </div>

        {!app && (
          <Link
            href="/portal/apply"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90">
            Apply
          </Link>
        )}
      </div>

      {/* Optional: show a warning if older data had multiple apps */}
      {apps.length > 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800">
          You have multiple applications on file. Only the most recent is shown
          below.
        </div>
      )}

      {!app ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-slate-50/60 px-6 py-12 text-center">
          <p className="text-sm text-slate-600">No application found.</p>
          <Link
            href="/portal/apply"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Start your application
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-white/70 p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                Application{" "}
                <span className="font-mono text-xs text-slate-600">
                  #{app.id.slice(0, 8)}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                Created {fmtDate(app.createdAt)}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Purpose
              </p>
              <p className="mt-1 text-sm">{app.purpose || "—"}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="mt-1 text-sm">{app.email}</p>
            </div>
            {/* Add more fields here if desired */}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
              href={`/portal/application/${app.id}/uploads`}>
              Manage Uploads
            </Link>
            <a
              className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
              href={`/api/applications/${app.id}/pdf`}>
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
