/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/authz.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function allowlist() {
  const raw = process.env.ADMIN_ALLOWLIST || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function getAdminGate() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      signedIn: false as const,
      ok: false as const,
      reason: "unauthenticated",
    };
  }

  // Clerk role from customized session token: claims.metadata.role
  const claims = sessionClaims as any;
  const role =
    claims?.metadata?.role ??
    claims?.publicMetadata?.role ??
    claims?.public_metadata?.role;

  // If role says admin, allow immediately
  if (role === "admin") {
    return { signedIn: true as const, ok: true as const, reason: "role", role };
  }

  // Optional fallback: email allowlist (keeps your old behavior as backup)
  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true },
  });

  const allow = allowlist();
  const email = me?.email?.toLowerCase();

  if (email && allow.has(email)) {
    return {
      signedIn: true as const,
      ok: true as const,
      reason: "allowlist",
      email,
    };
  }

  return {
    signedIn: true as const,
    ok: false as const,
    reason: "forbidden",
    role,
    email,
  };
}

export async function requireStaffOrAdmin(): Promise<
  | { ok: true; userId: string; role?: string; email?: string }
  | {
      ok: false;
      status: 401 | 403;
      error: "unauthenticated" | "forbidden";
      role?: string;
      email?: string;
    }
> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { ok: false, status: 401, error: "unauthenticated" };
  }

  const claims = sessionClaims as any;
  const role =
    claims?.metadata?.role ??
    claims?.publicMetadata?.role ??
    claims?.public_metadata?.role;

  // Allow role-based staff/admin
  if (role === "admin" || role === "staff") {
    return { ok: true, userId, role };
  }

  // Optional: allowlist fallback (keeps your old behavior if needed)
  const me = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true },
  });

  const email = me?.email?.toLowerCase();
  if (email && allowlist().has(email)) {
    return { ok: true, userId, email };
  }

  return { ok: false, status: 403, error: "forbidden", role, email };
}
