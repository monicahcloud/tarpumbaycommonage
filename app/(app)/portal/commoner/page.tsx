// app/(app)/portal/commoner/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

/* --- helpers --- */
function fmtDate(d?: Date | null) {
  return d
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d)
    : "—";
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    PENDING: "bg-blue-50 text-blue-700 ring-blue-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
        map[s] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}>
      {s}
    </span>
  );
}

export default async function CommonerStatusPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: "/portal/commoner" });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return redirect("/portal");

  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
  });
  if (!reg) return redirect("/portal/register/commoner");

  const existingApp = await prisma.application.findFirst({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  const isApproved = reg.status === "APPROVED";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* hero matches dashboard */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Commoner Registration
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your registration status and see your next steps.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 space-y-8">
        {/* status card */}
        <section className="rounded-2xl border bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Registration Details</h2>
            <StatusBadge status={reg.status} />
          </div>

          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div className="font-medium">{reg.status}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Submitted</div>
              <div>{fmtDate(reg.submittedAt)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Approved</div>
              <div>{fmtDate(reg.approvedAt)}</div>
            </div>
          </div>
        </section>

        {/* next steps — matches portal CTA look/feel */}
        <section className="rounded-2xl border bg-white/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold">Next Steps</h2>

          {reg.status === "PENDING" && (
            <p className="mt-2 text-sm text-slate-600">
              Your registration is under review by the Committee. You’ll be
              notified once a decision is made.
            </p>
          )}

          {reg.status === "REJECTED" && (
            <p className="mt-2 text-sm text-rose-600">
              Your registration was not approved. Please contact the Committee
              if you have questions.
            </p>
          )}

          {isApproved && !existingApp && (
            <div className="mt-4 flex flex-wrap gap-2">
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
          )}

          {existingApp && (
            <div className="mt-3 text-sm text-slate-600">
              You already started an application.{" "}
              <Link
                href="/portal/application"
                className="text-blue-700 hover:underline">
                View your application
              </Link>
              .
            </div>
          )}
        </section>

        {/* info panel */}
        <section className="rounded-2xl border bg-white/80 p-6 shadow-sm">
          <h3 className="text-base font-semibold">Helpful Information</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Ensure your contact details are current for Committee follow-ups.
            </li>
            <li>
              Once approved, you can apply for land or add your existing lot
              details.
            </li>
            <li>
              Please review the{" "}
              <a
                className="underline"
                href="/documents/CommitteRules.pdf"
                target="_blank"
                rel="noreferrer">
                Commonage Committee Rules
              </a>{" "}
              and the{" "}
              <a
                className="underline"
                href="/documents/commonageAct.pdf"
                target="_blank"
                rel="noreferrer">
                Commonage Act
              </a>{" "}
              before applying.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
