/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/applications/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.string().optional(), // YYYY-MM-DD
  address: z.string().optional(),
  ancestry: z.string().optional(),
  purpose: z.string().min(3),
  signature: z.string().optional(),
  signDate: z.string().optional(), // optional if you want it
});

function parseDateOrNull(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.format() }, { status: 400 });
    }
    const input = parsed.data;

    // Ensure user row exists
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await ensureUser();
      if (!user) return new Response("Unauthorized", { status: 401 });
    }

    // Because Application.userId is UNIQUE, we must update if one exists
    const existing = await prisma.application.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        commonerId: true, // preserve
        alreadyHasLand: true,
        lotNumber: true,
      },
    });

    // If they already have land recorded, don’t let them submit a land application
    if (existing?.alreadyHasLand || existing?.lotNumber) {
      return Response.json(
        { error: "Lot already recorded for this user." },
        { status: 403 }
      );
    }

    const data = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      dob: parseDateOrNull(input.dob),
      address: input.address ?? null,
      ancestry: input.ancestry ?? null,
      purpose: input.purpose,
      signature: input.signature ?? null,
      signDate: parseDateOrNull(input.signDate),
      status: "SUBMITTED" as const,
      submittedAt: new Date(),
    };

    const app = existing
      ? await prisma.application.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await prisma.application.create({
          data: {
            userId: user.id,
            // commonerId should ideally be set by /portal/land/apply shell creator
            // but if you want to auto-link here too, we can add it
            ...data,
          },
          select: { id: true },
        });

    return Response.json({ id: app.id });
  } catch (err: any) {
    console.error("POST /api/applications failed:", err);
    return new Response(`Server error: ${err?.message ?? "unknown"}`, {
      status: 500,
    });
  }
}
