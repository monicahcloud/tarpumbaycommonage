// app/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignedIn, SignedOut, RedirectToSignIn, SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <>
      <SignedOut>
        <SignIn
          afterSignInUrl={
            (typeof window !== "undefined" &&
              new URLSearchParams(window.location.search).get(
                "redirect_url"
              )) ||
            "/portal"
          }
        />
      </SignedOut>

      <SignedIn>
        {/* If a signed-in user somehow reaches this page, send them away */}
        <RedirectToSignIn redirectUrl="/portal" />
      </SignedIn>
    </>
  );
}
