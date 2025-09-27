import { SignIn } from "@clerk/nextjs";

// Next 15: searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  // helper to normalize param that might be string|string[]
  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  // support both ?redirect_url=... (Clerk) and ?redirect=...
  const dest = first(sp.redirect_url) || first(sp.redirect) || "/portal";

  return (
    <div className="mx-auto max-w-md p-6">
      <SignIn afterSignInUrl={dest} afterSignUpUrl={dest} />
    </div>
  );
}
