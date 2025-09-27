// app/(app)/portal/application/[id]/uploads/page.tsx  ← or "applications" (see note below)
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, FileDown, UploadCloud } from "lucide-react";
import { UploadButton } from "./upload.client";
import { DeleteButton } from "./delete.client";
import { AttachmentKind } from "@prisma/client";

type Params = Promise<{ id: string }>;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[s] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${cls}`}>
      {s.replace("_", " ")}
    </span>
  );
}

const REQUIRED: { kind: AttachmentKind; label: string; accept?: string }[] = [
  {
    kind: "ID_PASSPORT",
    label: "Government ID / Passport",
    accept: "image/*,application/pdf",
  },
  {
    kind: "BIRTH_CERT",
    label: "Birth Certificate",
    accept: "image/*,application/pdf",
  },
  {
    kind: "DRAWINGS",
    label: "Preliminary Drawings",
    accept: "application/pdf,image/*",
  },
  {
    kind: "PROOF_OF_ADDRESS",
    label: "Proof of Address",
    accept: "image/*,application/pdf",
  },
];

export default async function UploadsPage({ params }: { params: Params }) {
  const { id } = await params; // ✅ Next 15: await params
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const app = await prisma.application.findUnique({
    where: { id },
    include: { user: true, attachments: true },
  });
  if (!app) return notFound();

  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!me || app.userId !== me.id) return notFound();

  const attachments = app.attachments.sort(
    (a, b) => +b.createdAt - +a.createdAt
  );

  const byKind = new Map<AttachmentKind, number>();
  for (const a of attachments)
    byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uploads</h1>
          <p className="mt-1 text-sm text-slate-600">
            Application{" "}
            <span className="font-mono text-xs text-slate-600">
              #{app.id.slice(0, 8)}
            </span>{" "}
            <span className="mx-2">•</span> <StatusBadge status={app.status} />
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/portal/applications"
            className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
            Back to My Application
          </Link>
          <a
            className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-slate-50"
            href={`/api/applications/${app.id}/pdf`}>
            <FileDown className="h-4 w-4" /> Download PDF
          </a>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {REQUIRED.map((req) => {
          const count = byKind.get(req.kind) ?? 0;
          const ok = count > 0;
          return (
            <div
              key={req.kind}
              className="rounded-xl border bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{req.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ok
                      ? `${count} file${count > 1 ? "s" : ""} uploaded`
                      : "No file uploaded yet"}
                  </p>
                </div>
                {ok ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> Ready
                  </span>
                ) : (
                  <span className="text-slate-500">Required</span>
                )}
              </div>

              <div className="mt-3">
                <Suspense fallback={null}>
                  <UploadButton
                    applicationId={app.id}
                    kind={req.kind}
                    accept={req.accept}
                  />
                </Suspense>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border bg-white/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Other documents</h2>
          <Suspense fallback={null}>
            <UploadButton applicationId={app.id} kind="OTHER" />
          </Suspense>
        </div>

        {attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50/60 p-8 text-center">
            <UploadCloud className="h-5 w-5 text-slate-500" />
            <p className="text-sm text-slate-600">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">File</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium">Uploaded</th>
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attachments.map((f) => (
                  <tr key={f.id}>
                    <td className="px-3 py-3">{f.kind.replace("_", " ")}</td>
                    <td className="px-3 py-3">
                      <a
                        className="text-blue-700 hover:underline"
                        href={f.url}
                        target="_blank">
                        {new URL(f.url).pathname.split("/").pop()}
                      </a>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {fmtSize(f.size)}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {fmtDate(f.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <Suspense fallback={null}>
                        <DeleteButton attachmentId={f.id} />
                      </Suspense>
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
