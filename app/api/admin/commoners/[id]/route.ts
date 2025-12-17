/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  note: z.string().max(5000).optional().nullable(), // accepted but not persisted unless you add a column
  rejectionReason: z.string().max(5000).optional().nullable(), // accepted but not persisted unless you add a column
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const { id } = await params;

  let payload: z.infer<typeof Body>;
  try {
    payload = Body.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invalid body", detail: e?.issues ?? String(e) },
      { status: 400 }
    );
  }

  const reg = await prisma.commonerRegistration.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = payload.status;

  // ✅ set timestamp when approving; clear when moving away from approved
  const approvedAt = nextStatus === "APPROVED" ? new Date() : null;

  const updated = await prisma.commonerRegistration.update({
    where: { id },
    data: {
      status: nextStatus as any,
      approvedAt,
    },
    select: { id: true, status: true, approvedAt: true },
  });

  return NextResponse.json(updated);
}
