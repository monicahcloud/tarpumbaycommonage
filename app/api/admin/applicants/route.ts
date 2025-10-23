/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/applicants/route.ts
import { NextResponse } from "next/server";
import { requireStaffOrAdmin } from "@/lib/authz";
import { listApplicants } from "@/lib/admin.service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const status = (searchParams.get("status") ?? undefined) as any;
  const limit = Number(searchParams.get("limit") ?? "20");
  const cursor = searchParams.get("cursor");

  const result = await listApplicants({ q, status, limit, cursor });
  return NextResponse.json(result);
}
