// app/portal/layout.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/ensureUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, FolderOpenDot, UploadCloud } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

  await ensureUser();
  const user = await currentUser(); // 👈 get user data
  const latestApp = await prisma.application.findFirst({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const uploadsHref = latestApp
    ? `/portal/application/${latestApp.id}/uploads`
    : "/portal/application";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Mobile header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
        <div className="mx-auto flex h-14 w-full max-w-8xl items-center justify-between px-4">
          <Link href="/portal" className="text-xl font-semibold">
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
              <h1 className="text-3xl font-semibold tracking-tight">
                Member Portal
              </h1>
              <p className="mt-0.5 text-md text-slate-500">
                Tarpum Bay Commonage
              </p>
            </Link>

            <nav className="mt-6 space-y-1 text-sm">
              {/* BIG AVATAR */}
              <div className="mx-auto flex flex-col items-center gap-2 py-4">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-md">
                  {/* Use next/image if you prefer */}
                  <Image
                    src={user?.imageUrl ?? "/avatar-fallback.png"}
                    alt={user?.fullName ?? "User avatar"}
                    className="h-full w-full object-cover"
                    width={96}
                    height={96}
                  />
                </div>
                {user?.fullName ? (
                  <div className="text-lg font-medium text-slate-700">
                    {user.fullName}
                  </div>
                ) : null}
              </div>
              <div className="text-lg">
                <NavItem
                  href="/portal"
                  icon={<LayoutDashboard className="h-5 w-5" />}>
                  Dashboard
                </NavItem>
                <NavItem
                  href="/portal/application"
                  icon={<FolderOpenDot className="h-5 w-5" />}>
                  My Application
                </NavItem>
                <NavItem
                  href={uploadsHref}
                  icon={<UploadCloud className="h-5 w-5" />}>
                  Manage Uploads
                </NavItem>
              </div>{" "}
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
