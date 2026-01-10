// app/(app)/portal/layout.tsx
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

  // DB user
  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  // If user row is missing for some reason, still render children;
  // most pages will redirect accordingly.
  if (!me) {
    return <main className="p-4 md:p-8">{children}</main>;
  }

  // Commoner reg status
  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: me.id },
    select: { id: true, status: true },
  });

  // Application (1:1 in your schema)
  const app = await prisma.application.findUnique({
    where: { userId: me.id },
    select: { id: true },
  });

  const isApprovedCommoner = reg?.status === "APPROVED";

  // ✅ Determine which uploads link to show (this is the “desktop behavior”)
  const uploadNav: UploadNav = (() => {
    // If they have a commoner registration but it’s not approved yet -> show commoner uploads
    if (reg && reg.status !== "APPROVED") {
      return {
        show: true,
        href: "/portal/commoner/uploads",
        label: "Commoner Uploads",
      };
    }

    // If commoner is approved and an application exists -> show application uploads
    if (isApprovedCommoner && app?.id) {
      return {
        show: true,
        href: `/portal/application/${app.id}/uploads`,
        label: "Application Uploads",
      };
    }

    // Otherwise: don’t show uploads in nav (keeps it clean)
    return { show: false, href: "/portal", label: "Manage Uploads" };
  })();

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white text-slate-900">
      {/* Mobile header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/portal" className="text-xl font-semibold">
            Member Portal
          </Link>

          <MobileNav
            uploadsHref={uploadNav.href}
            uploadsLabel={uploadNav.label}
            showUploads={uploadNav.show}
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-[100dvh] border-r bg-white/70 backdrop-blur md:block">
          <div className="p-5">
            <Link href="/portal" className="block text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Member Portal
              </h1>
              <p className="mt-0.5 text-md text-slate-500">
                Tarpum Bay Commonage
              </p>
            </Link>

            {/* Avatar */}
            <div className="mx-auto flex flex-col items-center gap-2 py-5">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-purple-500/20 shadow-md">
                <Image
                  src={clerkUser?.imageUrl ?? "/avatar-fallback.png"}
                  alt={clerkUser?.fullName ?? "User avatar"}
                  className="h-full w-full object-cover"
                  width={96}
                  height={96}
                />
              </div>
              {clerkUser?.fullName ? (
                <div className="text-lg font-medium text-slate-700">
                  {clerkUser.fullName}
                </div>
              ) : null}
            </div>

            <nav className="mt-2 space-y-1 text-base">
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
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100">
      {icon}
      <span>{children}</span>
    </Link>
  );
}
