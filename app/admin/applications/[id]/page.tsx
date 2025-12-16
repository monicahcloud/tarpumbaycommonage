/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/applications/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicationForReview } from "@/lib/admin.service";
import AttachmentThumb from "../_components/AttachmentThumb";
import StatusBadge from "../_components/StatusBadge";
import DecisionForm from "../_components/DecisionForm";
//import AddAttachmentForm from "../_components/AddAttachmentForm";
import AttachmentsChecklist from "../_components/AttachmentsChecklist";
import ActivityFeed from "../_components/ActivityFeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getApplicationForReview(id);
  if (!app) notFound();

  const commonerAttachments = app.user.commoner?.attachments ?? [];
  const applicationAttachments = app.attachments ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/applications"
          className="text-sm font-medium text-purple-700 hover:underline">
          ← Back to Applications
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
          {app.user.commoner?.status ? (
            <StatusBadge status={app.user.commoner.status} />
          ) : null}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Application Review
            </h2>
            <p className="text-sm text-slate-600">
              {app.firstName} {app.lastName} • {app.email}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Application ID: <span className="font-mono">{app.id}</span>
            </p>
          </div>

          <div className="text-right text-sm text-slate-700">
            <div>
              Created:{" "}
              <span className="font-semibold">
                {new Date(app.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              Submitted:{" "}
              <span className="font-semibold">
                {app.submittedAt
                  ? new Date(app.submittedAt).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Purpose" value={app.purpose} />
          <Info
            label="Already has land"
            value={app.alreadyHasLand ? "Yes" : "No"}
          />
          <Info label="Lot number" value={app.lotNumber ?? "—"} />
          <Info label="Phone" value={app.phone ?? "—"} />
          <Info label="Address" value={app.address ?? "—"} />
          <Info label="Ancestry" value={app.ancestry ?? "—"} />
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Uploaded documents
          </h3>
          <div className="text-xs text-slate-600">
            Commoner:{" "}
            <span className="font-semibold">{commonerAttachments.length}</span>{" "}
            • Application:{" "}
            <span className="font-semibold">
              {applicationAttachments.length}
            </span>
          </div>
        </div>

        {commonerAttachments.length + applicationAttachments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No attachments uploaded.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {commonerAttachments.length > 0 ? (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Commoner registration docs
                </h4>
                <AttachmentsChecklist
                  applicationId={app.id}
                  commonerId={app.user.commoner?.id ?? null}
                  alreadyHasLand={app.alreadyHasLand}
                  commonerKinds={(app.user.commoner?.attachments ?? []).map(
                    (a) => a.kind
                  )}
                  applicationKinds={(app.attachments ?? []).map((a) => a.kind)}
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {commonerAttachments.map((a) => (
                    <AttachmentThumb
                      key={a.id}
                      attachment={a as any}
                      scope="commoner"
                      applicationId={app.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {applicationAttachments.length > 0 ? (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Application docs
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {applicationAttachments.map((a) => (
                    <AttachmentThumb
                      key={a.id}
                      attachment={a as any}
                      scope="commoner"
                      applicationId={app.id}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Recent activity
        </h3>
        <ActivityFeed events={(app as any).adminEvents ?? []} />
      </div>

      {/* Status history */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Status history</h3>
        {app.statusLogs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No status changes recorded yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {app.statusLogs.map((l) => (
              <li
                key={l.id}
                className="rounded-xl border bg-slate-50 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-slate-800">
                    <span className="font-semibold">{l.fromStatus}</span> →{" "}
                    <span className="font-semibold">{l.toStatus}</span>
                    {l.note ? (
                      <span className="text-slate-600"> • {l.note}</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(l.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Placeholder for #3 actions */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Decision</h3>
        <div className="mt-3">
          <DecisionForm applicationId={app.id} currentStatus={app.status} />
        </div>
      </div>

      {/* <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Add missing document
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Upload a file and attach it to this application.
        </p>
        <div className="mt-3">
          <AddAttachmentForm
            applicationId={app.id}
            commonerId={app.user.commoner?.id ?? null}
          />
        </div>
      </div> */}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}
