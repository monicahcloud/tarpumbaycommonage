import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AppSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.string().optional(), // ISO date from the form
  address: z.string().optional(),
  ancestry: z.string().optional(),
  purpose: z.string().min(3),
  signature: z.string().optional(), // dataURL if you add a canvas later
});

export async function POST(req: Request) {
  const body = await req.json();
  const data = AppSchema.parse(body);

  const created = await prisma.application.create({
    data: {
      ...data,
      dob: data.dob ? new Date(data.dob) : null,
    },
  });

  return NextResponse.json({ id: created.id });
}
