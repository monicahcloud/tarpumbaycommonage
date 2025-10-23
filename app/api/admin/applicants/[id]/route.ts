// app/api/admin/applicants/[id]/route.ts
import { NextResponse } from "next/server";
import { requireStaffOrAdmin } from "@/lib/authz";
import { getApplicant } from "@/lib/admin.service";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const data = await getApplicant(params.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}
