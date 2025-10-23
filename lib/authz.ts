// lib/authz.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function allowlist() {
  const raw = process.env.ADMIN_ALLOWLIST || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function getAdminGate() {
  const { userId } = await auth();
  if (!userId)
    return {
      signedIn: false as const,
      ok: false as const,
      reason: "unauthenticated",
    };

  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true },
  });

  const allow = allowlist();
  if (!me || !allow.has(me.email)) {
    return {
      signedIn: true as const,
      ok: false as const,
      reason: "forbidden",
      email: me?.email,
    };
  }

  return { signedIn: true as const, ok: true as const, email: me.email };
}
