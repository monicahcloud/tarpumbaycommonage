/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/commoners/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "../applications/_components/StatusBadge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminCommonersPage() {
  // ---- counts (cards) ----
  const [pending, approved, rejected, total] = await Promise.all([
    prisma.commonerRegistration.count({ where: { status: "PENDING" } }),
    prisma.commonerRegistration.count({ where: { status: "APPROVED" } }),
    prisma.commonerRegistration.count({ where: { status: "REJECTED" } }),
    prisma.commonerRegistration.count(),
  ]);

  // ---- list (table) ----
  const regs = await prisma.commonerRegistration.findMany({
    orderBy: { submittedAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      firstName: true,
      lastName: true,
      email: true,
      submittedAt: true,
      approvedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Commoner Registrations
          </h1>
          <p className="text-sm text-slate-600">
            Total registrations:{" "}
            <span className="font-semibold text-slate-900">{total}</span>
          </p>
        </div>

        {/* Optional: quick link to apps */}
        <div className="flex gap-2">
          <Link
            href="/admin/applications"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
            View Applications
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={pending}
          gradient="from-blue-100 to-blue-50"
        />
        <StatCard
          label="Approved"
          value={approved}
          gradient="from-emerald-100 to-emerald-50"
        />
        <StatCard
          label="Rejected"
          value={rejected}
          gradient="from-rose-100 to-rose-50"
        />
        <StatCard
          label="Total"
          value={total}
          gradient="from-slate-100 to-slate-50"
        />
      </div>

      {/* Table */}
      <section className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent registrations
          </h2>
          <div className="text-xs text-slate-600">
            Showing <span className="font-semibold">{regs.length}</span> of{" "}
            <span className="font-semibold">{total}</span>
          </div>
        </div>

        {regs.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-slate-50/60 p-10 text-center">
            <p className="text-sm text-slate-600">
              No commoner registrations yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Submitted</th>
                  <th className="px-3 py-2 font-medium">Approved</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {regs.map((r) => (
                  <tr key={r.id} className="align-middle hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">
                      {r.id}
                    </td>
                    <td className="px-3 py-3">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">{r.email}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.status as any} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {fmtDate(r.submittedAt)}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {r.approvedAt ? fmtDate(r.approvedAt) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/commoners/${r.id}`}
                        className="rounded border px-3 py-1 text-xs hover:bg-slate-50">
                        Review
                      </Link>
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

/* ---------------- small component ---------------- */

function StatCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-linear-to-b ${gradient} p-4 shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
