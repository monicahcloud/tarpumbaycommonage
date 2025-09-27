// app/apply/page.tsx
import { auth } from "@clerk/nextjs/server";
import ApplyFormClient from "@/app/(app)/portal/apply/ApplyFormClient";
import { ensureUser } from "@/lib/ensureUser";

export default async function ApplyPage() {
  // ⬅️ auth() is async; destructure the helper from it
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    // ⬅️ use the helper returned by auth()
    return redirectToSignIn({ returnBackUrl: "/" });
  }

  await ensureUser();
  return <ApplyFormClient />;
}
