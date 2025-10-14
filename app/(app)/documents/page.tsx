// // app/documents/page.tsx
// import { prisma } from "@/lib/prisma";
// import Link from "next/link";

// export const revalidate = 60;

// function fmtDate(d: string | Date) {
//   return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
//     typeof d === "string" ? new Date(d) : d
//   );
// }

// export default async function DocumentDetail({
//   params,
// }: {
//   params: { slug: string };
// }) {
//   const doc = await prisma.document.findUnique({
//     where: { slug: params.slug },
//   });
//   if (!doc || doc.status === "ARCHIVED") {
//     return (
//       <main className="mx-auto max-w-3xl p-6">
//         <h1 className="text-2xl font-bold">Document not found</h1>
//         <p className="mt-2 text-sm">
//           Return to{" "}
//           <Link href="/docs" className="text-blue-700 underline">
//             All Documents
//           </Link>
//           .
//         </p>
//       </main>
//     );
//   }

//   return (
//     <main className="mx-auto max-w-3xl p-6">
//       <div className="mb-2 text-xs text-slate-500">{doc.category}</div>
//       <h1 className="text-2xl font-bold">{doc.title}</h1>
//       {doc.description ? (
//         <p className="mt-2 text-slate-700">{doc.description}</p>
//       ) : null}

//       <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
//         {doc.contentType ? <span>{doc.contentType}</span> : null}
//         {typeof doc.size === "number" ? (
//           <span>• {(doc.size / (1024 * 1024)).toFixed(2)} MB</span>
//         ) : null}
//         <span>• Updated {fmtDate(doc.updatedAt)}</span>
//       </div>

//       <div className="mt-6 flex gap-3">
//         <a
//           href={doc.fileUrl}
//           target="_blank"
//           className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
//           View / Download
//         </a>
//         <Link
//           href="/docs"
//           className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
//           All documents
//         </Link>
//       </div>
//     </main>
//   );
// }

// app/documents/page.tsx
"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/components/commonage/motion";
import {
  Filters,
  useDocumentFilter,
} from "@/components/commonage/documents/Filters";
import { DocumentGrid } from "@/components/commonage/documents/DocumentGrid";
import { DOCUMENTS } from "@/data/documents";

export default function DocumentsPage() {
  const { state, setState, categories, filtered } =
    useDocumentFilter(DOCUMENTS);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[rgba(243,244,246,0.6)] to-white text-gray-900">
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <motion.h1
          {...fadeUp}
          className="text-4xl md:text-5xl font-extrabold text-center">
          Documents
        </motion.h1>
        <motion.p
          {...fadeUp}
          className="mt-3 text-center text-muted-foreground">
          Bylaws, applications, transfers, minutes, and public notices — all in
          one place.
        </motion.p>

        <div className="mt-8">
          <Filters state={state} setState={setState} categories={categories} />
        </div>

        <DocumentGrid docs={filtered} />

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-gray-500">
            No documents match your filters.
          </p>
        ) : null}
      </section>
    </main>
  );
}
