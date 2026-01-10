import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/ensureUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FolderOpenDot, UploadCloud } from "lucide-react";
import MobileNav from "@/components/MobileNav";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UploadNav = {
  show: boolean;
  href: string;
  label: string;
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

  await ensureUser();
  const clerkUser = await currentUser();

  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!me) {
    return <main className="p-4 md:p-8">{children}</main>;
  }

  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: me.id },
    select: { id: true, status: true },
  });

  const app = await prisma.application.findUnique({
    where: { userId: me.id },
    select: { id: true },
  });

  const isApprovedCommoner = reg?.status === "APPROVED";

  const uploadNav: UploadNav = (() => {
    if (reg && reg.status !== "APPROVED") {
      return {
        show: true,
        href: "/portal/commoner/uploads",
        label: "Commoner Uploads",
      };
    }
    if (isApprovedCommoner && app?.id) {
      return {
        show: true,
        href: `/portal/application/${app.id}/uploads`,
        label: "Application Uploads",
      };
    }
    return { show: false, href: "/portal", label: "Manage Uploads" };
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Mobile header - Fluid width */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
        <div className="flex h-16 w-full items-center justify-between px-6">
          <Link href="/portal" className="text-xl font-bold tracking-tight">
            Member Portal
          </Link>
          <MobileNav
            uploadsHref={uploadNav.href}
            uploadsLabel={uploadNav.label}
            showUploads={uploadNav.show}
          />
        </div>
      </div>

      {/* Main Grid: Increased sidebar width and removed tight max-width */}
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-dvh border-r border-slate-200 bg-white md:block">
          <div className="flex h-full flex-col p-6">
            <Link href="/portal" className="mb-8 block">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Member Portal
              </h1>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Tarpum Bay Commonage
              </p>
            </Link>

            {/* Avatar Section - More spaced out */}
            <div className="mb-10 flex flex-col items-center gap-4 rounded-2xl bg-slate-50 py-6 ring-1 ring-slate-200/50">
              <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-sm">
                <Image
                  src={clerkUser?.imageUrl ?? "/avatar-fallback.png"}
                  alt={clerkUser?.fullName ?? "User avatar"}
                  className="h-full w-full object-cover"
                  width={80}
                  height={80}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">
                  {clerkUser?.fullName ?? "Welcome"}
                </p>
                <p className="text-xs text-slate-500">Member Account</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              <NavItem
                href="/portal"
                icon={<LayoutDashboard className="h-5 w-5" />}>
                Dashboard
              </NavItem>

              <NavItem
                href="/portal/commoner"
                icon={<FolderOpenDot className="h-5 w-5" />}>
                Commoner Registration
              </NavItem>

              {uploadNav.show && (
                <NavItem
                  href={uploadNav.href}
                  icon={<UploadCloud className="h-5 w-5" />}>
                  {uploadNav.label}
                </NavItem>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              {/* Sign out or settings can go here */}
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-tighter">
                Support: support@tarpumbay.com
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content: Padding increased for better "breathability" */}
        <main className="min-h-screen p-6 lg:p-12">{children}</main>
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
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]">
      <span className="text-slate-400">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
