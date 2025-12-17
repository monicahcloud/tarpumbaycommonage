/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/commoners/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "../../applications/_components/StatusBadge";
import AttachmentThumb from "../../applications/_components/AttachmentThumb";
import AddAttachmentForm from "../../applications/_components/AddAttachmentForm";
import CommonerDecisionForm from "../_components/CommonerDecisionForm";
import { getCommonerReview } from "@/lib/admin.commoner.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCommonerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getCommonerReview(id);
  if (!data) notFound();

  const reg = data.reg;
  const checklist = data.checklist;
  const attachments = reg.attachments ?? [];
  const missing = checklist.filter((c) => !c.ok);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/commoners"
          className="text-sm font-medium text-purple-700 hover:underline">
          ← Back to Commoners
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={reg.status as any} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Commoner Registration Review
            </h2>
            <p className="text-sm text-slate-600">
              {reg.firstName} {reg.lastName} • {reg.email}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Registration ID: <span className="font-mono">{reg.id}</span>
            </p>
          </div>

          <div className="text-right text-sm text-slate-700">
            <div>
              Submitted:{" "}
              <span className="font-semibold">
                {new Date(reg.submittedAt).toLocaleString()}
              </span>
            </div>
            <div>
              Approved:{" "}
              <span className="font-semibold">
                {reg.approvedAt
                  ? new Date(reg.approvedAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Required documents checklist
          </h3>
          <div className="text-xs text-slate-600">
            Uploaded:{" "}
            <span className="font-semibold">
              {checklist.filter((c) => c.ok).length}
            </span>
            /{checklist.length}
          </div>
        </div>

        {missing.length > 0 ? (
          <div className="mt-3 rounded-xl border bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
            Missing required documents:
            <ul className="mt-2 list-disc pl-5">
              {missing.map((m) => (
                <li key={m.kind}>{m.kind.replaceAll("_", " ")}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-emerald-700">
            All required documents are present.
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Uploaded documents
          </h3>
          <div className="text-xs text-slate-600">
            Total: <span className="font-semibold">{attachments.length}</span>
          </div>
        </div>

        {attachments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No attachments uploaded.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {attachments.map((a) => (
              <AttachmentThumb
                key={a.id}
                attachment={a as any}
                scope="commoner"
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Decision</h3>
        <p className="mt-1 text-sm text-slate-600">
          Approve or reject this registration. Approval is blocked when required
          docs are missing.
        </p>

        <div className="mt-3">
          <CommonerDecisionForm
            regId={reg.id}
            currentStatus={reg.status as any}
            canApprove={missing.length === 0}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Add missing document
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Upload a file and attach it to this commoner registration.
        </p>
        <div className="mt-3">
          <AddAttachmentForm commonerId={reg.id} defaultTarget="COMMONER" />
        </div>
      </div>
    </div>
  );
}
