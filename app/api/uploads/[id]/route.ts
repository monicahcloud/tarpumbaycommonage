import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const file = await prisma.attachment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      pathname: true,
      commoner: { select: { user: { select: { clerkId: true } } } },
      application: { select: { user: { select: { clerkId: true } } } },
    },
  });

  if (!file) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const ownerClerkId =
    file.commoner?.user.clerkId ?? file.application?.user.clerkId ?? null;

  if (!ownerClerkId || ownerClerkId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (file.pathname) {
    try {
      await del(file.pathname);
    } catch {
      // best-effort
    }
  }

  await prisma.attachment.delete({ where: { id: file.id } });
  return new NextResponse(null, { status: 204 });
}
