// app/admin/applications/_components/ApplicationsTable.tsx
import Link from "next/link";
import type { ApplicationListItem } from "@/lib/admin.service";

function badgeClass(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "SUBMITTED":
      return "bg-cyan-50 text-cyan-800 border-cyan-200";
    default:
      return "bg-slate-50 text-slate-800 border-slate-200";
  }
}

export default function ApplicationsTable({
  data,
  query,
}: {
  data: {
    items: ApplicationListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  query: { q: string; status: string };
}) {
  const { items, page, totalPages } = data;

  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.status && query.status !== "ALL")
      params.set("status", query.status);
    params.set("page", String(nextPage));
    return `/admin/applications?${params.toString()}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Commoner</th>
              <th className="px-4 py-3">Docs</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-600" colSpan={6}>
                  No applications found.
                </td>
              </tr>
            ) : (
              items.map((a) => (
                <tr key={a.id} className="hover:bg-purple-50/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {a.applicant.firstName} {a.applicant.lastName}
                    </div>
                    <div className="text-slate-600">{a.applicant.email}</div>
                    <div className="text-xs text-slate-500">
                      Purpose: {a.purpose}
                      {a.alreadyHasLand ? " • Existing land" : ""}
                      {a.lotNumber ? ` • Lot: ${a.lotNumber}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass(
                        a.status
                      )}`}>
                      {a.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {a.user.commonerStatus ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {a.attachmentsCount}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700">
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <div className="text-xs text-slate-600">
          Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
          <span className="font-semibold text-slate-900">{totalPages}</span>
        </div>

        <div className="flex gap-2">
          <Link
            aria-disabled={page <= 1}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50"
            }`}
            href={makeHref(Math.max(1, page - 1))}>
            Prev
          </Link>

          <Link
            aria-disabled={page >= totalPages}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              page >= totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-slate-50"
            }`}
            href={makeHref(Math.min(totalPages, page + 1))}>
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
