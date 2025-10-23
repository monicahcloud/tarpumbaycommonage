/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApplicant } from "@/lib/admin.service";
import { requireStaffOrAdmin } from "@/lib/authz";
import { setCommonerStatus } from "./actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeFileName(url?: string | null) {
  if (!url) return "";
  try {
    const u = url.startsWith("http")
      ? new URL(url)
      : new URL(url, "https://tarpumbaycommonage.com");
    return u.pathname.split("/").pop() || "";
  } catch {
    return "";
  }
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gate = await requireStaffOrAdmin();
  if (!gate.ok) return null;

  const data = await getApplicant(params.id);
  if (!data) return <div className="p-6">Not found</div>;

  const { reg, application, checklist } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Applicant</h2>
          <p className="text-slate-600 text-sm">
            {reg.firstName} {reg.lastName} • {reg.email}
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            const next = formData.get("status") as any;
            await setCommonerStatus(reg.id, next);
          }}
          className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={reg.status}
            className="rounded-lg border px-3 py-2 text-sm">
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button className="rounded-lg border px-3 py-2 text-sm">
            Update
          </button>
        </form>
      </div>

      {/* Checklist */}
      <section className="grid gap-4 sm:grid-cols-2">
        {checklist.map((c) => (
          <div key={c.kind} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.kind.replaceAll("_", " ")}</p>
              <span className={c.ok ? "text-emerald-700" : "text-slate-500"}>
                {c.ok ? "Ready" : "Missing"}
              </span>
            </div>
            {c.latest && (
              <div className="mt-2 text-sm text-slate-600">
                <a
                  className="text-blue-700 hover:underline"
                  href={c.latest.url}
                  target="_blank"
                  rel="noreferrer">
                  {safeFileName(c.latest.url)}
                </a>
                <div>
                  {c.latest.contentType ?? "—"} • {c.latest.size ?? "—"} •{" "}
                  {new Date(c.latest.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* All uploads */}
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold mb-2">All Uploads</h3>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Scope</th>
                <th className="px-3 py-2 text-left">Kind</th>
                <th className="px-3 py-2 text-left">File</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reg.attachments.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-3">Commoner</td>
                  <td className="px-3 py-3">{a.kind}</td>
                  <td className="px-3 py-3">
                    <a
                      className="text-blue-700 hover:underline"
                      href={a.url}
                      target="_blank"
                      rel="noreferrer">
                      {safeFileName(a.url)}
                    </a>
                  </td>
                  <td className="px-3 py-3">{a.contentType ?? "—"}</td>
                  <td className="px-3 py-3">{a.size ?? "—"}</td>
                  <td className="px-3 py-3">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {application?.attachments?.map((a) => (
                <tr key={a.id}>
                  <td className="px-3 py-3">Application</td>
                  <td className="px-3 py-3">{a.kind}</td>
                  <td className="px-3 py-3">
                    <a
                      className="text-blue-700 hover:underline"
                      href={a.url}
                      target="_blank"
                      rel="noreferrer">
                      {safeFileName(a.url)}
                    </a>
                  </td>
                  <td className="px-3 py-3">{a.contentType ?? "—"}</td>
                  <td className="px-3 py-3">{a.size ?? "—"}</td>
                  <td className="px-3 py-3">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {application && (
        <section className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">Application</h3>
          <div className="text-sm text-slate-700 space-y-1">
            <div>Status: {application.status}</div>
            <div>Purpose: {application.purpose}</div>
            <div>
              Submitted:{" "}
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleString()
                : "—"}
            </div>
            <div>Fee Paid: {application.feesPaid ? "Yes" : "No"}</div>
            {application.lotNumber && <div>Lot #: {application.lotNumber}</div>}
          </div>
        </section>
      )}
    </div>
  );
}
