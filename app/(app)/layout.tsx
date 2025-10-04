// app/portal/layout.tsx — Beautiful, safe, and fixed (no undefined `app`)
import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/ensureUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, FolderOpenDot, UploadCloud } from "lucide-react";
import MobileNav from "@/components/MobileNav"; // client component (see below)

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

  await ensureUser();

  // 🔧 Fix: fetch the user's latest application (ID only) for sidebar link
  const latestApp = await prisma.application.findFirst({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const uploadsHref = latestApp
    ? `/portal/application/${latestApp.id}/uploads`
    : "/portal/application"; // graceful fallback if no app yet

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Mobile header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
        <div className="mx-auto flex h-14 w-full max-w-8xl items-center justify-between px-4">
          <Link href="/portal" className="text-sm font-semibold">
            Member Portal
          </Link>
          <MobileNav uploadsHref={uploadsHref} />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-[100dvh] border-r bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:block">
          <div className="p-5">
            <Link href="/portal" className="block text-center">
              <h1 className="text-lg font-semibold tracking-tight">
                Member Portal
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Tarpum Bay Commonage
              </p>
            </Link>

            <nav className="mt-6 space-y-1 text-sm">
              <NavItem
                href="/portal"
                icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavItem>
              <NavItem
                href="/portal/application"
                icon={<FolderOpenDot className="h-4 w-4" />}>
                My Application
              </NavItem>
              <NavItem
                href={uploadsHref}
                icon={<UploadCloud className="h-4 w-4" />}>
                Manage Uploads
              </NavItem>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
      {icon}
      <span>{children}</span>
    </Link>
  );
}

/* --------------------------------------------------------- */
