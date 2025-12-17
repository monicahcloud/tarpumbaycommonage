// app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { REQUIRED_COMMONER_KINDS } from "@/lib/commonerRequirements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminHome() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.commonerRegistration.count({ where: { status: "PENDING" } }),
    prisma.commonerRegistration.count({ where: { status: "APPROVED" } }),
    prisma.commonerRegistration.count({ where: { status: "REJECTED" } }),
  ]);

  // show recent pending + whether required docs exist
  const recentPending = await prisma.commonerRegistration.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "desc" },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      submittedAt: true,
      attachments: {
        where: { kind: { in: REQUIRED_COMMONER_KINDS } },
        select: { kind: true },
      },
    },
  });

  const rows = recentPending.map((r) => {
    const have = new Set(r.attachments.map((a) => a.kind));
    const missing = REQUIRED_COMMONER_KINDS.filter((k) => !have.has(k));
    return { ...r, missingCount: missing.length };
  });

  const needsDocsCount = rows.filter((r) => r.missingCount > 0).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Commoner Registrations
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              Pending: <span className="font-semibold">{pending}</span>
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              Approved: <span className="font-semibold">{approved}</span>
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              Rejected: <span className="font-semibold">{rejected}</span>
            </span>

            {needsDocsCount > 0 ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900 ring-1 ring-amber-200">
                Needs docs:{" "}
                <span className="font-semibold">{needsDocsCount}</span>
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-900 ring-1 ring-emerald-200">
                Docs OK
              </span>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No pending registrations.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Submitted</th>
                  <th className="px-3 py-2 font-medium">Docs</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      {r.firstName} {r.lastName}
                      <div className="text-xs text-slate-500 font-mono">
                        {r.id}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{r.email}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {fmtDate(r.submittedAt)}
                    </td>
                    <td className="px-3 py-3">
                      {r.missingCount === 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900 ring-1 ring-emerald-200">
                          OK
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200">
                          Missing {r.missingCount}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                        href={`/admin/commoners/${r.id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <Link
            href="/admin/commoners"
            className="text-sm text-purple-700 hover:underline">
            Go to all commoners →
          </Link>
        </div>
      </div>
    </div>
  );
}
