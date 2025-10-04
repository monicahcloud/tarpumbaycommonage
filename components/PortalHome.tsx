import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// ————— helpers —————
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

export default async function PortalHome() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    // If ensureUser somehow didn’t run, keep this page safe
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          We couldn&apos;t find your member record yet. Try reloading this page
          or signing out and back in.
        </p>
      </div>
    );
  }

  // Counts for stat cards
  const [submitted, reviewing, approved, rejected] = await Promise.all([
    prisma.application.count({ where: { userId: user.id } }),
    prisma.application.count({
      where: { userId: user.id, status: "SUBMITTED" },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "UNDER_REVIEW" },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "APPROVED" },
    }),
    prisma.application.count({
      where: { userId: user.id, status: "REJECTED" },
    }),
  ]);

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true, purpose: true },
    take: 8,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome{user.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Start a new application or view your status.
          </p>
        </div>
        {/* <Link
          href="/portal/apply"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90">
          New Application
        </Link> */}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* <StatCard label="Total" value={total} /> */}
        <StatCard label="Submitted" value={submitted} />
        <StatCard label="Under review" value={reviewing} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Rejected" value={rejected} />
      </div>

      {/* Recent applications */}
      <section className="rounded-xl border bg-white/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent application</h2>
          <Link
            href="/portal/application"
            className="text-sm text-blue-700 hover:underline">
            View all
          </Link>
        </div>

        {apps.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {apps.map((a) => (
                  <tr key={a.id} className="align-middle">
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">
                      {a.id.slice(0, 30)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="line-clamp-2">{a.purpose || "—"}</div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {fmtDate(a.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {/* <Link
                          className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                          href={`/portal/application/${a.id}`}>
                          View
                        </Link> */}
                        <Link
                          className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                          href={`/portal/application/${a.id}/uploads`}>
                          Uploads
                        </Link>
                        <a
                          className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                          href={`/api/applications/${a.id}/pdf`}>
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white/70 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-slate-50/60 px-6 py-10 text-center">
      <p className="text-sm text-slate-600">You have no applications yet.</p>
      <Link
        href="/portal/apply"
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        Start a new application
      </Link>
    </div>
  );
}
