/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  dob: z.string().optional().nullable(), // YYYY-MM-DD
  address: z.string().min(1),
  ancestry: z.string().optional().nullable(),

  agreeRules: z.boolean(),
  signature: z.string().min(2),
  signDate: z.string().optional().nullable(), // YYYY-MM-DD
});

function parseDateOrNull(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: z.infer<typeof Body>;
  try {
    input = Body.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invalid body", detail: e?.issues ?? String(e) },
      { status: 400 }
    );
  }

  // Ensure we have a matching DB User row
  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await ensureUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // If the registration already exists, return it (don’t force restart)
  const existing = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  if (existing) {
    // Optional: update snapshot fields to latest submission info
    const updated = await prisma.commonerRegistration.update({
      where: { userId: user.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        dob: parseDateOrNull(input.dob),
        address: input.address,
        ancestry: input.ancestry ?? null,
        agreeRules: !!input.agreeRules,
        signature: input.signature,
        signDate: parseDateOrNull(input.signDate),
        // status stays as-is (PENDING/APPROVED/REJECTED)
      },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  }

  // Create new registration
  const created = await prisma.commonerRegistration.create({
    data: {
      userId: user.id,
      status: "PENDING",
      submittedAt: new Date(),

      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      dob: parseDateOrNull(input.dob),
      address: input.address,
      ancestry: input.ancestry ?? null,

      agreeRules: !!input.agreeRules,
      signature: input.signature,
      signDate: parseDateOrNull(input.signDate),
    } as any,
    select: { id: true, status: true },
  });

  return NextResponse.json(created, { status: 201 });
}
