import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return new Response("Not Found", { status: 404 });

  const body = await req.json();
  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: dbUser.id },
  });
  if (!reg) return new Response("No registration", { status: 400 });
  if (reg.status !== "APPROVED")
    return new Response("Not approved", { status: 403 });

  await prisma.commonerRegistration.update({
    where: { userId: dbUser.id },
    data: {
      hasExistingProperty: !!body.hasExistingProperty,
      existingLotNumber: body.existingLotNumber || null,
      existingPropertyNotes: body.existingPropertyNotes || null,
    },
  });

  return Response.json({ ok: true });
}
