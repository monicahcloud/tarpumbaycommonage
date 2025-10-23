// app/admin/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminGate } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await getAdminGate();

  if (!gate.signedIn) {
    // only unauthenticated users go to sign-in
    redirect("/sign-in?redirect_url=/admin");
  }
  if (!gate.ok) {
    // signed in but not allowed → no loop
    redirect("/admin/forbidden");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <h1 className="font-semibold">Admin</h1>
          <nav className="text-sm">
            <Link href="/admin/applicants" className="hover:underline">
              Applicants
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
