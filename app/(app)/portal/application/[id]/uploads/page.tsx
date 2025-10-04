// app/(app)/portal/application/[id]/uploads/page.tsx  ← or "applications" (see note below)
// This server component renders the Uploads page for a single Application.
// It enforces access control via Clerk, fetches the application + attachments
// from Prisma, and renders required document blocks with an upload button
// plus an "Other documents" table.

import { auth } from "@clerk/nextjs/server"; // Server-side auth (App Router)
import { prisma } from "@/lib/prisma"; // Prisma client
import Link from "next/link"; // Client-side navigation links
import { notFound, redirect } from "next/navigation"; // App Router helpers
import { Suspense } from "react"; // For streaming/fallback UI
import { BadgeCheck, FileDown, UploadCloud } from "lucide-react"; // Icons
import { UploadButton } from "./upload.client"; // Client upload input (uses @vercel/blob/client)
import { DeleteButton } from "./delete.client"; // Client delete button (calls API)
import { AttachmentKind } from "@prisma/client"; // Enum for attachment categories
import Image from "next/image";

// Next.js 15 allows awaiting params (typed as a Promise)
type Params = Promise<{ id: string }>;

// Format a JS Date in a compact readable way
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// Human-readable byte size formatter for table display
function fmtSize(bytes?: number | null) {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const precision = n < 10 && i > 0 ? 1 : 0;
  return `${n.toFixed(precision)} ${units[i]}`;
}

// Small status pill that maps application status → Tailwind classes
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

// Required document types shown as individual cards with their own upload inputs
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

function PreviewThumb({
  url,
  contentType,
}: {
  url: string;
  contentType?: string | null;
}) {
  const ct = contentType ?? "";
  const isImg = ct.startsWith("image/");
  const isPdf = ct === "application/pdf";

  if (isImg) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <Image
          src={url}
          alt="preview"
          width={112} // 28 * 4px (Tailwind h-28 ~ 112px)
          height={112}
          className="h-28 w-28 rounded-md object-cover ring-1 ring-slate-200"
        />
      </a>
    );
  }
  if (isPdf) {
    // Lightweight inline preview. If a browser blocks it, the click still opens the file.
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          className="h-28 w-28 rounded-md ring-1 ring-slate-200"
        />
      </a>
    );
  }

  // Fallback icon for doc/docx/unknown
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className=" h-28 w-28 rounded-md ring-1 ring-slate-200 grid place-items-center">
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 text-slate-500"
        fill="currentColor"
        aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />
      </svg>
    </a>
  );
}

// Server component entry — enforces auth + ownership and renders UI
export default async function UploadsPage({ params }: { params: Params }) {
  // Next 15: params is a promise
  const { id } = await params;

  // Require login; redirect to /sign-in and then back to /portal on success
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  // Fetch application + related user + attachments
  const app = await prisma.application.findUnique({
    where: { id },
    include: { user: true, attachments: true },
  });
  if (!app) return notFound(); // 404 if no application

  // Check that the logged-in Clerk user owns this application
  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!me || app.userId !== me.id) return notFound();

  // Sort newest-first for table
  const attachments = app.attachments.sort(
    (a, b) => +b.createdAt - +a.createdAt
  );
  // Pick the most recent file for each required kind (for the preview card)
  const latestByKind = new Map<AttachmentKind, (typeof attachments)[number]>();
  for (const a of attachments) {
    if (!latestByKind.has(a.kind)) latestByKind.set(a.kind, a);
  }

  // Count files per required kind to show "Ready" / count messaging
  const byKind = new Map<AttachmentKind, number>();
  for (const a of attachments)
    byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Header: title, app id, status, back + download buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uploads</h1>
          <p className="mt-1 text-sm text-slate-600">
            Application{" "}
            <span className="font-mono text-xs text-slate-600">
              #{app.id.slice(0, 30)}
            </span>{" "}
            <span className="mx-2">•</span> <StatusBadge status={app.status} />
          </p>
        </div>
        <div className="flex gap-2">
          {/* Navigate back to the main Application page */}
          <Link
            href="/portal/application"
            className="rounded border px-3 py-2 text-sm hover:bg-slate-50">
            Back to My Application
          </Link>
          {/* Server-side PDF export for the application */}
          <a
            className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-slate-50"
            href={`/api/applications/${app.id}/pdf`}>
            <FileDown className="h-4 w-4" /> Download PDF
          </a>
        </div>
      </div>

      {/* Grid of required document cards, each with an UploadButton */}
      <section className="grid gap-4 sm:grid-cols-2">
        {REQUIRED.map((req) => {
          const count = byKind.get(req.kind) ?? 0;
          const ok = count > 0;
          const latest = latestByKind.get(req.kind);

          return (
            <div
              key={req.kind}
              className="rounded-xl border bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{req.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ok
                      ? count === 1
                        ? "File uploaded"
                        : `${count} files uploaded`
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

              <div className="mt-3 grid grid-cols-[auto_1fr] gap-4 items-start">
                {/* Preview square */}
                <div>
                  {ok && latest ? (
                    <PreviewThumb
                      url={latest.url}
                      contentType={latest.contentType}
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-md ring-1 ring-slate-200 grid place-items-center text-slate-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Upload control + meta */}
                <div className="space-y-2">
                  <Suspense fallback={null}>
                    <UploadButton
                      applicationId={app.id}
                      kind={req.kind}
                      accept={req.accept}
                    />
                  </Suspense>

                  {ok && latest && (
                    <div className="text-xs text-slate-600">
                      <div className="truncate">
                        <a
                          href={latest.url}
                          target="_blank"
                          className="text-blue-700 hover:underline">
                          {new URL(latest.url).pathname.split("/").pop()}
                        </a>
                      </div>
                      <div>
                        {fmtSize(latest.size)} • {latest.contentType ?? "—"} •{" "}
                        {fmtDate(latest.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* "Other documents" bucket with its own upload + tabular listing */}
      <section className="rounded-xl border bg-white/70 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Other documents</h2>
          {/* Upload to the generic OTHER kind */}
          <Suspense fallback={null}>
            <UploadButton applicationId={app.id} kind="OTHER" />
          </Suspense>
        </div>

        {attachments.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-slate-50/60 p-8 text-center">
            <UploadCloud className="h-5 w-5 text-slate-500" />
            <p className="text-sm text-slate-600">No documents uploaded yet.</p>
          </div>
        ) : (
          // Table of all attachments (newest first)
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
                    {/* Humanize the enum by replacing underscore with space */}
                    <td className="px-3 py-3">{f.kind.replace("_", " ")}</td>
                    <td className="px-3 py-3">
                      {/* Link to the Blob URL (opens in new tab) */}
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
                      {/* Delete is a client action that calls the API then refreshes */}
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
