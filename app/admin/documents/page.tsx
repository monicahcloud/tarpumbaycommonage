import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewDocumentForm from "./new.client";
import DeleteButton from "./row-delete.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDocumentsPage() {
  const docs = await prisma.document.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-slate-600">
            Upload and publish bylaws, minutes, forms, etc.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-slate-600 hover:underline">
          Back
        </Link>
      </div>

      <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Upload new</h2>
        <div className="mt-3">
          <NewDocumentForm />
        </div>
      </div>

      <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
        <h2 className="text-sm font-semibold">All documents</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Pinned</th>
                <th className="px-3 py-2 font-medium">Updated</th>
                <th className="px-3 py-2 font-medium"></th>
                <th className="px-3 py-2 font-medium w-[1%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-3">{d.title}</td>
                  <td className="px-3 py-3">{d.category}</td>
                  <td className="px-3 py-3">{d.status}</td>
                  <td className="px-3 py-3">{d.pinned ? "Yes" : "No"}</td>
                  <td className="px-3 py-3">
                    {new Date(d.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <a
                      className="text-blue-700 hover:underline"
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer">
                      Download
                    </a>
                  </td>
                  <td className="px-3 py-3">
                     <DeleteButton id={d.id} />{" "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {docs.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">No documents yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
