// app/admin/applications/page.tsx
import { listApplications } from "@/lib/admin.service";
import ApplicationsToolbar from "./_components/ApplicationsToolbar";
import ApplicationsTable from "./_components/ApplicationsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const data = await listApplications({
    q: sp.q,
    status: sp.status,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 25,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Applications
            </h2>
            <p className="text-sm text-slate-600">
              Review submissions, documents, and status changes.
            </p>
          </div>
          <div className="text-sm text-slate-600">
            Total:{" "}
            <span className="font-semibold text-slate-900">{data.total}</span>
          </div>
        </div>

        <div className="mt-4">
          <ApplicationsToolbar />
        </div>
      </div>

      <ApplicationsTable
        data={data}
        query={{ q: sp.q ?? "", status: sp.status ?? "ALL" }}
      />
    </div>
  );
}
