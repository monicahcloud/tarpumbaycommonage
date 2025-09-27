// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

type Props = {
  searchParams?:
    | { redirect?: string; redirect_url?: string }
    | Promise<{ redirect?: string; redirect_url?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const redirect = sp?.redirect ?? sp?.redirect_url ?? "/portal";

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignIn afterSignInUrl={redirect} afterSignUpUrl={redirect} />
    </div>
  );
}
