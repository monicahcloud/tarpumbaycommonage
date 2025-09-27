// app/api/uploads/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // 👈 params is a Promise in Next 15
) {
  const { id } = await ctx.params; // 👈 await it

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const att = await prisma.attachment.findUnique({
    where: { id },
    include: { application: true },
  });
  if (!att) return new Response("Not found", { status: 404 });

  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!me || att.application.userId !== me.id) {
    return new Response("Forbidden", { status: 403 });
  }

  // Delete the blob (ignore if already gone)
  try {
    await del(att.url);
  } catch {
    // ignore
  }

  await prisma.attachment.delete({ where: { id: att.id } });
  return new Response(null, { status: 204 });
}
