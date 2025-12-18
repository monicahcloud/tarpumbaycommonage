import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);
}

export default async function PortalDocumentsPage() {
  const docs = await prisma.document.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Documents
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Bylaws, minutes, forms, and other committee documents.
            </p>
          </div>
          <Link
            href="/portal"
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
            Back to Portal
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border bg-white/80 p-4 shadow-sm">
              <div className="text-xs text-slate-500">
                {d.category.replaceAll("_", " ")}
              </div>
              <div className="mt-1 font-semibold">{d.title}</div>
              {d.description ? (
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                  {d.description}
                </p>
              ) : null}

              <div className="mt-3 text-xs text-slate-500">
                Updated: {fmtDate(d.updatedAt)}
              </div>

              <div className="mt-4 flex gap-2">
                <a
                  href={d.fileUrl}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  target="_blank"
                  rel="noreferrer">
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {docs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed bg-slate-50/60 p-8 text-center text-sm text-slate-600">
            No documents published yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
