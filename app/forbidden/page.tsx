// app/forbidden/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2">
        {/* Left: copy */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-slate-700 shadow-sm">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            Access restricted
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            You don’t have permission to view this page
          </h1>

          <p className="text-sm leading-6 text-slate-600">
            This area is limited to authorized administration. If you believe
            you should have access, please contact the administrator or sign in
            with the correct account.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Portal
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Go Home
            </Link>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4 text-xs text-slate-600">
            <div className="font-semibold text-slate-800">Tip</div>
            If you’re signed in with multiple accounts, try signing out and back
            in with the account that has admin access.
          </div>
        </div>

        {/* Right: illustration */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.10),rgba(6,182,212,0.10)_40%,transparent_70%)]" />
          <div className="rounded-[2rem] border bg-white/70 p-6 shadow-sm">
            <Image
              src="/illustrations/secure-login.svg"
              alt="Forbidden access illustration"
              width={760}
              height={560}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
