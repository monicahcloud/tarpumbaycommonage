// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", // landing
  "/sign-in(.*)", // Clerk sign-in
  "/sign-up(.*)", // Clerk sign-up
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that isn't public
  if (!isPublicRoute(req)) {
    await auth.protect(); // <-- v6 pattern
  }
});

export const config = {
  matcher: [
    // Skip Next internals & static files; always run for API/trpc
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
