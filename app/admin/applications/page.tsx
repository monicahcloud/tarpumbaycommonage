// app/admin/applications/page.tsx
import { prisma } from "@/lib/prisma";
import { listApplications } from "@/lib/admin.service";
import ApplicationsToolbar from "./_components/ApplicationsToolbar";
import ApplicationsTable from "./_components/ApplicationsTable";
import { AppStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const sp = await searchParams;

  const page = sp.page ? Number(sp.page) : 1;
  const pageSize = sp.pageSize ? Number(sp.pageSize) : 25;

  // Typed counts (mirrors Commoners cards)
  const [pending, approved, rejected, total] = await Promise.all([
    prisma.application.count({ where: { status: AppStatus.UNDER_REVIEW } }),
    prisma.application.count({ where: { status: AppStatus.APPROVED } }),
    prisma.application.count({ where: { status: AppStatus.REJECTED } }),
    prisma.application.count(),
  ]);

  const data = await listApplications({
    q: sp.q,
    status: sp.status,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 25,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Applications
          </h1>
          <p className="text-sm text-slate-600">
            Review submissions, documents, and status changes.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          Total:{" "}
          <span className="font-semibold text-slate-900">{data.total}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Under Review"
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

      {/* Toolbar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Application List
            </h2>
            <p className="text-sm text-slate-600">
              Filter and manage member applications.
            </p>
          </div>
          <div className="text-sm text-slate-600">
            Showing page{" "}
            <span className="font-semibold text-slate-900">{page}</span>
          </div>
        </div>
        <div className="mt-4">
          <ApplicationsToolbar />
        </div>
      </div>

      {/* Table */}
      <ApplicationsTable
        data={data}
        query={{ q: sp.q ?? "", status: sp.status ?? "ALL" }}
      />
    </div>
  );
}
