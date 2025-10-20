import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new Response("User not found", { status: 404 });

  const body = await req.json();
  const existing = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
  });
  if (existing) return Response.json({ id: existing.id });

  const record = await prisma.commonerRegistration.create({
    data: {
      userId: user.id,
      status: "PENDING",
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? null,
      dob: body.dob ? new Date(body.dob) : null,
      address: body.address,
      ancestry: body.ancestry || null,
      agreeRules: !!body.agreeRules,
      signature: body.signature,
      signDate: body.signDate ? new Date(body.signDate) : null,
    },
    select: { id: true },
  });

  return Response.json({ id: record.id });
}
