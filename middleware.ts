import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/app"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("sid")?.value);

  // Allow static & public routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/public")) {
    return NextResponse.next();
  }

  // Don’t guard the auth pages
  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    // Optional: if signed in already, send to /app
    if (hasSession) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
    return NextResponse.next();
  }

  // Guard protected routes
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!hasSession) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
