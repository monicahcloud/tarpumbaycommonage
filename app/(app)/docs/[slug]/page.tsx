// app/documents/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60; // cache for a minute; adjust or remove

export default async function DocumentDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const doc = await prisma.document.findUnique({
    where: { slug: params.slug },
  });
  if (!doc || doc.status === "ARCHIVED") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p className="mt-2 text-sm">
          Return to{" "}
          <Link href="/documents" className="text-blue-700 underline">
            All Documents
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-2 text-xs text-slate-500">{doc.category}</div>
      <h1 className="text-2xl font-bold">{doc.title}</h1>
      {doc.description ? (
        <p className="mt-2 text-slate-700">{doc.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        {doc.contentType ? <span>{doc.contentType}</span> : null}
        {typeof doc.size === "number" ? (
          <span>• {(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
        ) : null}
        <span>
          • Updated{" "}
          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
            new Date(doc.updatedAt)
          )}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <a
          href={doc.fileUrl}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
          View / Download
        </a>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
          All documents
        </Link>
      </div>
    </main>
  );
}
