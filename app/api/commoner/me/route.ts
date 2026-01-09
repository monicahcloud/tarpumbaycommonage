import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({ reg });
}
