import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  FileDown,
  FileText,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { AttachmentKind } from "@prisma/client";
import { UploadButton } from "./upload.client";
import { DeleteButton } from "./delete.client";

import type { $Enums } from "@prisma/client"; // <-- add this

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

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

const REQUIRED: {
  kind: $Enums.AttachmentKind;
  label: string;
  accept?: string;
}[] = [
  {
    kind: AttachmentKind.ID_PASSPORT,
    label: "Government ID / Passport",
    accept: "image/*,application/pdf",
  },
  {
    kind: AttachmentKind.BIRTH_CERT,
    label: "Birth Certificate",
    accept: "image/*,application/pdf",
  },
  {
    kind: AttachmentKind.PROOF_OF_LINEAGE,
    label: "Proof of Lineage",
    accept: "image/*,application/pdf",
  },
  {
    kind: AttachmentKind.PROOF_OF_ADDRESS,
    label: "Proof of Address",
    accept: "image/*,application/pdf",
  },
  {
    kind: AttachmentKind.PROOF_OF_PAYMENT,
    label: "Proof of Payment - $25.00",
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
          width={112}
          height={112}
          className="h-28 w-28 rounded-md object-cover ring-1 ring-slate-200"
        />
      </a>
    );
  }
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <div className="grid h-28 w-28 place-items-center rounded-md ring-1 ring-slate-200 bg-slate-50">
          <FileText className="h-6 w-6 text-slate-500" />
        </div>
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="grid h-28 w-28 place-items-center rounded-md ring-1 ring-slate-200">
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

export default async function CommonerUploadsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/commoner/uploads");

  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!me) return notFound();

  const commoner = await prisma.commonerRegistration.findUnique({
    where: { userId: me.id },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!commoner) redirect("/portal/register/commoner");

  // group attachments
  const attachments = commoner.attachments;
  const latestByKind = new Map<AttachmentKind, (typeof attachments)[number]>();
  const byKind = new Map<AttachmentKind, number>();
  for (const a of attachments) {
    if (!latestByKind.has(a.kind)) latestByKind.set(a.kind, a);
    byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Commoner Uploads
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Registration{" "}
                <span className="font-mono text-xs text-slate-600">
                  #{commoner.id}
                </span>
                <span className="mx-2">•</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200">
                  {commoner.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/portal/commoner"
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" /> Back to Status
              </Link>
              <a
                href={`/api/commoner/${commoner.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                <FileDown className="h-4 w-4" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-8">
        {/* Required blocks */}
        <section className="grid gap-4 sm:grid-cols-2">
          {REQUIRED.map((req) => {
            const count = byKind.get(req.kind) ?? 0;
            const ok = count > 0;
            const latest = latestByKind.get(req.kind);
            return (
              <div
                key={req.kind}
                className="relative overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />

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

                <div className="mt-3 grid grid-cols-[auto_1fr] items-start gap-4">
                  <div>
                    {ok && latest ? (
                      <PreviewThumb
                        url={latest.url}
                        contentType={latest.contentType}
                      />
                    ) : (
                      <div className="grid h-28 w-28 place-items-center rounded-md ring-1 ring-slate-200 text-slate-400">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Suspense fallback={null}>
                      <UploadButton
                        commonerId={commoner.id}
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

        {/* Other documents */}
        <section className="relative overflow-hidden rounded-2xl border bg-white/80 p-4 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Other documents</h2>
            <Suspense fallback={null}>
              <UploadButton commonerId={commoner.id} kind="OTHER" />
            </Suspense>
          </div>

          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-slate-50/60 p-8 text-center">
              <UploadCloud className="h-5 w-5 text-slate-500" />
              <p className="text-sm text-slate-600">
                No documents uploaded yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600">
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
                    <tr
                      key={f.id}
                      className="align-middle hover:bg-slate-50/60">
                      <td className="px-3 py-3">
                        {f.kind.replaceAll("_", " ")}
                      </td>
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
      </main>
    </div>
  );
}
