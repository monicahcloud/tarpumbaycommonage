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

  if (!gate.signedIn) redirect("/sign-in?redirect_url=/admin");
  if (!gate.ok) redirect("/forbidden");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <h1 className="font-semibold">Admin Page</h1>
          <nav className="text-sm flex gap-4">
            <Link href="/admin/applications" className="hover:underline">
              Applications
            </Link>
            <Link href="/admin/commoners" className="hover:underline">
              Commoners
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
