/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/adminAuth.ts (reuse)
import { auth } from "@clerk/nextjs/server";
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };
  const role = (sessionClaims as any)?.role;
  if (role !== "admin") return { ok: false, status: 403, error: "Forbidden" };
  return { ok: true, userId };
}
