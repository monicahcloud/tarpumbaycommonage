// // app/portal/layout.tsx
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { ensureUser } from "@/lib/ensureUser";
// import { prisma } from "@/lib/prisma";
// import Link from "next/link";
// import { LayoutDashboard, FolderOpenDot, UploadCloud } from "lucide-react";
// import MobileNav from "@/components/MobileNav";
// import Image from "next/image";

// export default async function PortalLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { userId, redirectToSignIn } = await auth();
//   if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

//   await ensureUser();
//   const user = await currentUser();

//   // Latest land application (if any)
//   const latestApp = await prisma.application.findFirst({
//     where: { user: { clerkId: userId } },
//     orderBy: { createdAt: "desc" },
//     select: { id: true },
//   });

//   const uploadsHref = latestApp
//     ? `/portal/application/${latestApp.id}/uploads`
//     : "/portal/application";

//   const hasApplication = !!latestApp;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
//       {/* Mobile header */}
//       <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
//         <div className="mx-auto flex h-14 w-full max-w-8xl items-center justify-between px-4">
//           <Link href="/portal" className="text-xl font-semibold">
//             Member Portal
//           </Link>
//           <MobileNav uploadsHref={uploadsHref} />
//         </div>
//       </div>

//       <div className="mx-auto grid w-full max-w-8xl grid-cols-1 md:grid-cols-[240px_1fr]">
//         {/* Sidebar (desktop) */}
//         <aside className="sticky top-0 hidden h-[100dvh] border-r bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:block">
//           <div className="p-5">
//             <Link href="/portal" className="block text-center">
//               <h1 className="text-3xl font-semibold tracking-tight">
//                 Member Portal
//               </h1>
//               <p className="mt-0.5 text-md text-slate-500">
//                 Tarpum Bay Commonage
//               </p>
//             </Link>

//             <nav className="mt-6 space-y-1 text-sm">
//               {/* BIG AVATAR */}
//               <div className="mx-auto flex flex-col items-center gap-2 py-4">
//                 <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-md">
//                   <Image
//                     src={user?.imageUrl ?? "/avatar-fallback.png"}
//                     alt={user?.fullName ?? "User avatar"}
//                     className="h-full w-full object-cover"
//                     width={96}
//                     height={96}
//                   />
//                 </div>
//                 {user?.fullName ? (
//                   <div className="text-lg font-medium text-slate-700">
//                     {user.fullName}
//                   </div>
//                 ) : null}
//               </div>

//               <div className="text-lg">
//                 <NavItem
//                   href="/portal"
//                   icon={<LayoutDashboard className="h-5 w-5" />}>
//                   Dashboard
//                 </NavItem>

//                 {/* Commoner: register/status is always available */}
//                 <NavItem
//                   href="/portal/commoner"
//                   icon={<FolderOpenDot className="h-5 w-5" />}>
//                   Commoner Registration
//                 </NavItem>

//                 {/* Land application links only appear if an application exists */}
//                 {hasApplication && (
//                   <>
//                     <NavItem
//                       href="/portal/application"
//                       icon={<FolderOpenDot className="h-5 w-5" />}>
//                       My Application
//                     </NavItem>
//                     <NavItem
//                       href={uploadsHref}
//                       icon={<UploadCloud className="h-5 w-5" />}>
//                       Manage Uploads
//                     </NavItem>
//                   </>
//                 )}
//               </div>
//             </nav>
//           </div>
//         </aside>

//         {/* Main */}
//         <main className="p-4 md:p-8">{children}</main>
//       </div>
//     </div>
//   );
// }

// function NavItem({
//   href,
//   icon,
//   children,
// }: {
//   href: string;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <Link
//       href={href}
//       className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
//       {icon}
//       <span>{children}</span>
//     </Link>
//   );
// }
// app/(app)/portal/layout.tsx — replace the nav items block
// (assumes you already call ensureUser() and have userId)

// import { prisma } from "@/lib/prisma";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import Link from "next/link";
// import { LayoutDashboard, FolderOpenDot, MapPin, Landmark } from "lucide-react";
// import Image from "next/image";

// export default async function PortalLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { userId, redirectToSignIn } = await auth();
//   if (!userId) return redirectToSignIn({ returnBackUrl: "/portal" });

//   const me = await prisma.user.findUnique({ where: { clerkId: userId } });
//   const app = me
//     ? await prisma.application.findUnique({
//         where: { userId: me.id },
//         select: { id: true, alreadyHasLand: true, lotNumber: true },
//       })
//     : null;

//   const hasLot = !!app?.alreadyHasLand && !!app?.lotNumber;

//   const reg = me
//     ? await prisma.commonerRegistration.findUnique({
//         where: { userId: me.id },
//         select: { status: true },
//       })
//     : null;
//   const isApprovedCommoner = reg?.status === "APPROVED";

//   const user = await currentUser();
//   const canStartLotFlows = isApprovedCommoner && !hasLot;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
//       <div className="mx-auto grid w-full max-w-8xl grid-cols-1 md:grid-cols-[240px_1fr]">
//         <aside className="sticky top-0 hidden h-[100dvh] border-r bg-white/70 backdrop-blur md:block">
//           <div className="p-5">
//             <Link href="/portal" className="block text-center">
//               <h1 className="text-3xl font-semibold tracking-tight">
//                 Member Portal
//               </h1>
//               <p className="mt-0.5 text-md text-slate-500">
//                 Tarpum Bay Commonage
//               </p>
//             </Link>

//             <div className="mx-auto flex flex-col items-center gap-2 py-4">
//               <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-primary/20 shadow-md">
//                 <Image
//                   src={user?.imageUrl ?? "/avatar-fallback.png"}
//                   alt={user?.fullName ?? "User avatar"}
//                   className="h-full w-full object-cover"
//                   width={96}
//                   height={96}
//                 />
//               </div>
//               {user?.fullName ? (
//                 <div className="text-lg font-medium text-slate-700">
//                   {user.fullName}
//                 </div>
//               ) : null}
//             </div>

//             <nav className="mt-4 space-y-1 text-lg">
//               <NavItem
//                 href="/portal"
//                 icon={<LayoutDashboard className="h-5 w-5" />}>
//                 Dashboard
//               </NavItem>

//               <NavItem
//                 href="/portal/commoner"
//                 icon={<FolderOpenDot className="h-5 w-5" />}>
//                 Commoner Registration
//               </NavItem>

//               {/* Lot flows gated */}
//               {canStartLotFlows ? (
//                 <>
//                   <NavItem
//                     href="/portal/land/apply"
//                     icon={<MapPin className="h-5 w-5" />}>
//                     Apply for Land
//                   </NavItem>
//                   <NavItem
//                     href="/portal/land/existing"
//                     icon={<Landmark className="h-5 w-5" />}>
//                     I Already Have Land
//                   </NavItem>
//                 </>
//               ) : null}

//               {/* If a lot exists, surface the application viewer */}
//               {hasLot && app?.id ? (
//                 <NavItem
//                   href={`/portal/application/${app.id}`}
//                   icon={<MapPin className="h-5 w-5" />}>
//                   View Lot Details
//                 </NavItem>
//               ) : null}
//             </nav>
//           </div>
//         </aside>

//         <main className="p-4 md:p-8">{children}</main>
//       </div>
//     </div>
//   );
// }

// function NavItem({
//   href,
//   icon,
//   children,
// }: {
//   href: string;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }) {
//   return (
//     <Link
//       href={href}
//       className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
//       {icon}
//       <span>{children}</span>
//     </Link>
//   );
// }

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
  const user = await currentUser();

  // Latest lot application (for its uploads link)
  const latestApp = await prisma.application.findFirst({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  // Commoner registration (to show Commoner uploads CTA)
  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  const reg = me
    ? await prisma.commonerRegistration.findUnique({
        where: { userId: me.id },
        select: { status: true },
      })
    : null;

  const uploadsHref = latestApp
    ? `/portal/application/${latestApp.id}/uploads`
    : "/portal/application";

  const showCommonerUploads = !!reg && reg.status !== "APPROVED";
  const commonerUploadsHref = "/portal/commoner/uploads";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white text-slate-900">
      {/* Mobile header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur md:hidden">
        <div className="mx-auto flex h-14 w-full max-w-8xl items-center justify-between px-4">
          <Link href="/portal" className="text-xl font-semibold">
            Member Portal
          </Link>
          {/* If you also surface commoner uploads in MobileNav, pass it here if needed */}
          <MobileNav uploadsHref={uploadsHref} />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-8xl grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-dvh border-r bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/60 md:block">
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

                {/* Commoner registration */}
                <NavItem
                  href="/portal/commoner"
                  icon={<FolderOpenDot className="h-5 w-5" />}>
                  Commoner Registration
                </NavItem>

                {/* SHOW Commoner Uploads until approval */}
                {showCommonerUploads && (
                  <NavItem
                    href={commonerUploadsHref}
                    icon={<UploadCloud className="h-5 w-5" />}>
                    Commoner Uploads
                  </NavItem>
                )}

                {/* Lot application entry (kept discoverable) */}
                {reg?.status === "APPROVED" && (
                  <>
                    <NavItem
                      href="/portal/application"
                      icon={<FolderOpenDot className="h-5 w-5" />}>
                      Apply for Land
                    </NavItem>
                    <NavItem
                      href={uploadsHref}
                      icon={<UploadCloud className="h-5 w-5" />}>
                      Application Uploads
                    </NavItem>{" "}
                  </>
                )}
              </div>
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
