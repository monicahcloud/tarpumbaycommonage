import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, FileUp, FileText } from "lucide-react";

// ————— helpers —————
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
  };
  return map[s] ?? map["DRAFT"];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${pillClass(
        s
      )}`}>
      {s.replace("_", " ")}
    </span>
  );
}

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

  // Counts for stat cards
  const [submitted, underReview, approved, rejected] = await Promise.all([
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

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true, purpose: true },
    take: 8,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
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
                Start a new application, track status, and manage your
                documents.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/portal/application/${apps.id}/uploads"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Upload Documents
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={
                  apps[0]
                    ? `/api/applications/${apps[0].id}/pdf`
                    : "/portal/application"
                }
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Download PDF <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portal/apply"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                New Application <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portal/application"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                View Application <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-8">
        {/* Stat cards */}
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

        {/* Quick actions */}
        {/*  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="Upload Documents"
            description="Add ID, proof of address, or drawings"
            href="/portal/application"
            icon={<FileUp className="h-5 w-5" />}
          />
          <QuickAction
            title="Download Latest PDF"
            description="Get a stamped copy of your application"
            href={
              apps[0]
                ? `/api/applications/${apps[0].id}/pdf`
                : "/portal/application"
            }
            icon={<FileText className="h-5 w-5" />}
          />
          <QuickAction
            title="Continue Where You Left Off"
            description="Jump back into your most recent draft"
            href={
              apps[0] ? `/portal/application/${apps[0].id}` : "/portal/apply"
            }
            icon={<ArrowRight className="h-5 w-5" />}
          /> 
        </div>*/}
        <div className="grid grid-cols-2 gap-4 space-y-4">
          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">Fees</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>
                Registration Fee: <strong>$25 (non-refundable)</strong>
              </li>
              <li>
                Lot Processing Fee: <strong>$100 (non-refundable)</strong>
              </li>
              <li>
                Residential Lot Fee: <strong>TBD</strong>
              </li>
              <li>
                Commercial Lot Fee:{" "}
                <strong>To be advised based on lot size</strong>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-600">
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
                <strong>Registration only:</strong> fee receipt, passport copy,
                birth certificate copy
              </li>
              <li>
                <strong>Residential lot:</strong> processing + residential fees,
                preliminary building drawings
              </li>
              <li>
                <strong>Commercial lot:</strong> business plan, preliminary
                building drawings
              </li>
            </ul>
          </div>
        </div>
        {/* Recent application */}
        <section className="rounded-2xl border bg-white/70 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent application</h2>
            <Link
              href="/portal/application"
              className="text-sm text-blue-700 hover:underline">
              View
            </Link>
          </div>

          {apps.length === 0 ? (
            <EmptyState />
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
                        <div className="line-clamp-2">{a.purpose || "—"}</div>
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
      </main>
    </div>
  );
}

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
      className={`rounded-2xl border bg-gradient-to-b ${gradient} p-4 shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white/70 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 p-2 ring-1 ring-border">
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-slate-600">{description}</div>
        </div>
        <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-slate-50/60 px-6 py-10 text-center">
      <p className="text-sm text-slate-600">You have no applications yet.</p>
      <Link
        href="/portal/apply"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Start a new application <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
