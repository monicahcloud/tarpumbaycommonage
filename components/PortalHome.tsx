// app/(app)/portal/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLandApplicationsSetting } from "@/lib/settings";
import { getCommonerDocsStatus } from "@/lib/commonerRequirements";

/* ---------------- helpers ---------------- */
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function pillClass(status: string) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
    PENDING: "bg-blue-50 text-blue-700 ring-blue-200",
  };
  return map[s] ?? "bg-slate-100 text-slate-700 ring-slate-200";
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${pillClass(
        s
      )}`}>
      {s.replaceAll("_", " ")}
    </span>
  );
}

/* ---------------- page ---------------- */
export default async function PortalHome() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            We couldn&apos;t find your member record yet. Try reloading this
            page or signing out and back in.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Commoner status ---------- */
  const commoner = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      approvedAt: true,
    },
  });

  const hasCommoner = !!commoner;
  const isApprovedCommoner = commoner?.status === "APPROVED";

  /* ---------- Application flags for gating ---------- */
  const app = await prisma.application.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      purpose: true,
      alreadyHasLand: true,
      lotNumber: true,
    },
  });

  const hasLot = !!app?.alreadyHasLand && !!app?.lotNumber;

  /* ---------- Site toggle ---------- */
  const { open: landOpen } = await getLandApplicationsSetting();

  /* ---------- Docs gate (only check if approved commoner) ---------- */
  const docs = isApprovedCommoner
    ? await getCommonerDocsStatus(commoner!.id)
    : null;

  const canApplyForLand =
    isApprovedCommoner && landOpen && !!docs?.ok && !hasLot;

  /* ---------- Lot Application stats & list ---------- */
  let submitted = 0,
    underReview = 0,
    approved = 0,
    rejected = 0;

  if (isApprovedCommoner && !hasLot) {
    [submitted, underReview, approved, rejected] = await Promise.all([
      prisma.application.count({
        where: { userId: user.id, status: "SUBMITTED" },
      }),
      prisma.application.count({
        where: { userId: user.id, status: "UNDER_REVIEW" },
      }),
      prisma.application.count({
        where: { userId: user.id, status: "APPROVED" },
      }),
      prisma.application.count({
        where: { userId: user.id, status: "REJECTED" },
      }),
    ]);
  }

  const apps =
    isApprovedCommoner && !hasLot
      ? await prisma.application.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, createdAt: true, purpose: true },
          take: 8,
        })
      : [];

  const latestApp = apps[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome{user.firstName ? `, ${user.firstName}` : ""}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Register as a Commoner first. Once approved, you can apply for
                land or add your existing lot info, and manage your documents.
              </p>
            </div>

            {/* Top-right actions */}
            <div className="flex flex-wrap gap-2">
              {!hasCommoner && (
                <Link
                  href="/portal/register/commoner"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  Register as Commoner <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {hasCommoner && !isApprovedCommoner && (
                <Link
                  href="/portal/commoner"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  View Commoner Status <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {isApprovedCommoner && !hasLot && (
                <>
                  {canApplyForLand ? (
                    <Link
                      href="/portal/land/apply"
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                      Apply for Land <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : !landOpen ? (
                    <span className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium bg-slate-50 text-slate-500">
                      Apply for Land (closed)
                    </span>
                  ) : (
                    <Link
                      href="/portal/commoner/uploads?missing=1"
                      className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                      Upload required docs <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  <Link
                    href="/portal/land/existing"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    I Already Have Land <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-8">
        {/* Banner when land closed */}
        {isApprovedCommoner && !hasLot && !landOpen && (
          <div className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            Land applications are currently <strong>closed</strong>. You can
            still keep your Commoner registration up to date, and we’ll reopen
            applications when the Committee is ready.
          </div>
        )}

        {/* Commoner panel */}
        <section className="rounded-2xl border bg-white/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Commoner Registration</h2>
            <StatusBadge status={hasCommoner ? commoner!.status : "PENDING"} />
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
            <div>
              <div className="text-slate-500 text-xs">Status</div>
              <div className="font-medium">
                {hasCommoner ? commoner!.status : "Not started"}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">Submitted</div>
              <div>{hasCommoner ? fmtDate(commoner!.submittedAt) : "—"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs">Approved</div>
              <div>
                {commoner?.approvedAt ? fmtDate(commoner.approvedAt) : "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!hasCommoner && (
              <Link
                href="/portal/register/commoner"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Start Registration
              </Link>
            )}

            {hasCommoner && !isApprovedCommoner && (
              <Link
                href="/portal/commoner"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
                View / Continue Registration
              </Link>
            )}

            {isApprovedCommoner && !hasLot && (
              <>
                {canApplyForLand ? (
                  <Link
                    href="/portal/land/apply"
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Apply for Land
                  </Link>
                ) : !landOpen ? (
                  <span className="rounded-xl border px-4 py-2 text-sm text-slate-500 bg-slate-50">
                    Apply for Land (closed)
                  </span>
                ) : (
                  <Link
                    href="/portal/commoner/uploads?missing=1"
                    className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
                    Upload required docs
                  </Link>
                )}

                <Link
                  href="/portal/land/existing"
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
                  I Already Have Land
                </Link>
              </>
            )}

            {isApprovedCommoner && hasLot && app && (
              <>
                <span className="rounded-xl border px-4 py-2 text-sm text-slate-500 bg-slate-50">
                  Apply for Land (disabled)
                </span>
                <Link
                  href={`/portal/application/${app.id}`}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  View Lot Details
                </Link>
              </>
            )}
          </div>
        </section>

        {/* LOT APPLICATION STAT CARDS */}
        {isApprovedCommoner && !hasLot && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Submitted"
                value={submitted}
                gradient="from-blue-100 to-blue-50"
              />
              <StatCard
                label="Under review"
                value={underReview}
                gradient="from-amber-100 to-amber-50"
              />
              <StatCard
                label="Approved"
                value={approved}
                gradient="from-emerald-100 to-emerald-50"
              />
              <StatCard
                label="Rejected"
                value={rejected}
                gradient="from-rose-100 to-rose-50"
              />
            </div>

            <section className="rounded-2xl border bg-white/70 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent application</h2>
                {latestApp ? (
                  <Link
                    href={`/portal/application/${latestApp.id}`}
                    className="text-sm text-blue-700 hover:underline">
                    View
                  </Link>
                ) : null}
              </div>

              {apps.length === 0 ? (
                <EmptyState isApprovedCommoner={true} hasCommoner={true} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-xs text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">ID</th>
                        <th className="px-3 py-2 font-medium">Purpose</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {apps.map((a) => (
                        <tr
                          key={a.id}
                          className="align-middle hover:bg-slate-50/60">
                          <td className="px-3 py-3 font-mono text-xs text-slate-600">
                            {a.id}
                          </td>
                          <td className="px-3 py-3">
                            <div className="line-clamp-2">
                              {a.purpose || "—"}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            {fmtDate(a.createdAt)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                                href={`/portal/application/${a.id}`}>
                                View
                              </Link>
                              <Link
                                className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                                href={`/portal/application/${a.id}/uploads`}>
                                Uploads
                              </Link>
                              <a
                                className="rounded border px-3 py-1 text-xs hover:bg-slate-50"
                                href={`/api/applications/${a.id}/pdf`}>
                                PDF
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">Fees</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>
                Commoner Registration:{" "}
                <strong>$25 annually (non-refundable)</strong>
              </li>

              <li>
                Lot Processing: <strong>$100 (non-refundable)</strong>
              </li>
              <li>
                Residential Lot Fee: <strong>TBD</strong>
              </li>
              <li>
                Commercial Lot Fee:{" "}
                <strong>To be advised based on lot size</strong>
              </li>
            </ul>
            <p className="mt-3 text-sm font-bold mb-2 items-center justify-center text-center">
              Payments: Tarpum Bay Commonage No. 10419388,
              <br />
              Acct # 1350006680 — Bank of the Bahamas, Rock Sound (Branch #
              03153).
            </p>
          </div>

          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">Required Documentation</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>
                <strong>Commoner registration:</strong> passport, birth
                certificate, proof of lineage, proof of address
              </li>
              <li>
                <strong>Residential lot:</strong> processing + residential fees,
                preliminary building drawings
              </li>
              <li>
                <strong>Commercial lot:</strong> business plan, preliminary
                drawings
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- small components ---------------- */

function StatCard({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-linear-to-b ${gradient} p-4 shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({
  isApprovedCommoner,
  hasCommoner,
}: {
  isApprovedCommoner: boolean;
  hasCommoner: boolean;
}) {
  if (!hasCommoner) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-slate-50/60 px-6 py-10 text-center">
        <p className="text-sm text-slate-600">
          You haven’t registered as a Commoner yet.
        </p>
        <Link
          href="/portal/register/commoner"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Register as Commoner <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!isApprovedCommoner) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-slate-50/60 px-6 py-10 text-center">
        <p className="text-sm text-slate-600">
          Your Commoner registration is not approved yet.
        </p>
        <Link
          href="/portal/commoner"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          View Commoner Status <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-slate-50/60 px-6 py-10 text-center">
      <p className="text-sm text-slate-600">You have no applications yet.</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/portal/land/apply"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Apply for Land <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/portal/land/existing"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          I Already Have Land <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
