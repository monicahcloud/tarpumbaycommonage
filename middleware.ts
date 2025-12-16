/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/faq",
  "/forbidden",
  "/clerk_(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/uploads(.*)",
  "/api/attachments(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Public pages are always accessible
  if (isPublicRoute(req)) return NextResponse.next();

  // Everything else requires auth
  await auth.protect();

  // Admin-only gate
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();

    const claims = sessionClaims as any;
    const role =
      claims?.metadata?.role ??
      claims?.publicMetadata?.role ??
      claims?.public_metadata?.role;

    if (role !== "admin") {
      // If already on /forbidden, do not redirect again
      if (pathname === "/forbidden") return NextResponse.next();

      // For API routes, return 403 (no redirects)
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // For pages, redirect to the single forbidden route
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|clerk_\\d+|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
