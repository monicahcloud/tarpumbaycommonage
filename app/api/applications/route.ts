/* eslint-disable @typescript-eslint/no-explicit-any */
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
});

function parseDateOrNull(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export async function POST(req: Request) {
  try {
    // ✅ MUST await
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.format() }, { status: 400 });
    }
    const input = parsed.data;

    // Ensure we have a DB user row (handles first-visit / mismatches)
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await ensureUser();
      if (!user) return new Response("Unauthorized", { status: 401 });
    }

    const app = await prisma.application.create({
      data: {
        userId: user.id,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        dob: parseDateOrNull(input.dob),
        address: input.address ?? null,
        ancestry: input.ancestry ?? null,
        purpose: input.purpose,
        signature: input.signature ?? null,
        status: "SUBMITTED", // make sure your enum includes this
        submittedAt: new Date(),
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
