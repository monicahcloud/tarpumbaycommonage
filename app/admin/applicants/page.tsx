/* eslint-disable @typescript-eslint/no-explicit-any */
import { listApplicants } from "@/lib/admin.service";
import { requireStaffOrAdmin } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicantsListPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const gate = await requireStaffOrAdmin();
  if (!gate.ok) return null;

  const q = searchParams.q;
  const status = (searchParams.status as any) || undefined;

  const { data } = await listApplicants({ q, status, limit: 50, cursor: null });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Applicants</h2>
          <p className="text-slate-600 text-sm">{data.length} result(s)</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search…"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border px-3 py-2 text-sm">
            <option value="">Any status</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button className="rounded-lg border px-3 py-2 text-sm">
            Filter
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Uploads</th>
              <th className="px-3 py-2">Apps</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((r) => (
              <tr key={r.id} className="align-middle">
                <td className="px-3 py-3">
                  {r.firstName} {r.lastName}
                </td>
                <td className="px-3 py-3">{r.email ?? r.user?.email}</td>
                <td className="px-3 py-3 text-center">{r.status}</td>
                <td className="px-3 py-3">
                  {new Date(r.submittedAt).toLocaleString()}
                </td>
                <td className="px-3 py-3 text-center">
                  {r._count.attachments}
                </td>
                <td className="px-3 py-3 text-center">
                  {r._count.applications}
                </td>
                <td className="px-3 py-3">
                  <a
                    className="text-blue-700 hover:underline"
                    href={`/admin/applicants/${r.id}`}>
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-slate-500">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
