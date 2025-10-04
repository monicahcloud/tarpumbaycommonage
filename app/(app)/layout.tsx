import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/ensureUser";
import Link from "next/link";
import { FolderOpenDot, LayoutDashboard } from "lucide-react";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

  await ensureUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 h-[100dvh] border-r bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="p-5">
            <Link
              href="/portal"
              className="block justify-center items-center text-center">
              <h1 className="text-lg font-semibold tracking-tight">
                Member Portal
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Tarpum Bay Commonage
              </p>
            </Link>

            <nav className="mt-6 space-y-1 text-md">
              <NavItem
                href="/portal"
                icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavItem>
              {/* <NavItem
                href="/portal/apply"
                icon={<FilePlus2 className="h-4 w-4" />}>
                Apply
              </NavItem> */}
              <NavItem
                href="/portal/application"
                icon={<FolderOpenDot className="h-4 w-4" />}>
                My Applications
              </NavItem>
              {/* <NavItem
                href="/portal/profile"
                icon={<User className="h-4 w-4" />}>
                Profile
              </NavItem> */}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="p-6 md:p-8">{children}</main>
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
      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100">
      {icon}
      <span>{children}</span>
    </Link>
  );
}
