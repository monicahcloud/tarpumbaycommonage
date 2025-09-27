import { SignUp } from "@clerk/nextjs";

// Next 15: searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  // support ?redirect_url=... (Clerk) or ?redirect=...
  const dest = first(sp?.redirect_url) || first(sp?.redirect) || "/portal";

  return (
    <div className="mx-auto max-w-md p-6">
      <SignUp afterSignInUrl={dest} afterSignUpUrl={dest} />
    </div>
  );
}
