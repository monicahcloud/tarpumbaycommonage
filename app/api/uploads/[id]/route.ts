import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob"; // replace if using another storage

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return new Response("Not Found", { status: 404 });

  const file = await prisma.attachment.findUnique({
    where: { id },
    select: {
      id: true,
      pathname: true,
      // ownership via either commoner or application
      commoner: { select: { userId: true } },
      application: { select: { userId: true } },
    },
  });
  if (!file) return new Response("Not Found", { status: 404 });

  const ownerId = file.commoner?.userId ?? file.application?.userId ?? null;
  if (!ownerId || ownerId !== dbUser.id)
    return new Response("Forbidden", { status: 403 });

  // Delete from storage (best-effort)
  if (file.pathname) {
    try {
      await del(file.pathname);
    } catch {
      // swallow; we still remove DB row
    }
  }

  await prisma.attachment.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
