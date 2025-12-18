// app/api/admin/settings/land-applications/route.ts
import { NextResponse } from "next/server";
import { requireStaffOrAdmin } from "@/lib/authz";
import { z } from "zod";
import { setLandApplicationsOpen } from "@/lib/settings";

export const runtime = "nodejs";

const Body = z.object({
  open: z.boolean(),
});

export async function POST(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const row = await setLandApplicationsOpen(parsed.data.open);
  return NextResponse.json({
    ok: true,
    value: row.value,
    updatedAt: row.updatedAt,
  });
}
