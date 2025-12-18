/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/documents/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";
import { z } from "zod";
import { del } from "@vercel/blob";
import { DocCategory, DocStatus } from "@prisma/client";

export const runtime = "nodejs";

const UpdateBody = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(DocCategory).optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  status: z.nativeEnum(DocStatus).optional(),
  // optional file swap
  fileUrl: z.string().url().optional(),
  contentType: z.string().min(1).optional().nullable(),
  size: z.number().int().nonnegative().optional().nullable(),
  blobPath: z.string().optional().nullable(),
});

export async function PATCH(req: Request, ctx: any) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const id = (ctx?.params?.id as string) || "";
  const json = await req.json().catch(() => ({}));
  const parsed = UpdateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: parsed.data as any,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: any) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const id = (ctx?.params?.id as string) || "";

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best effort: delete from Vercel Blob if it's ours
  try {
    const isBlobUrl = doc.fileUrl.includes(".blob.vercel-storage.com/");
    if (isBlobUrl) {
      await del(doc.fileUrl);
    } else if (doc.blobPath) {
      await del([doc.blobPath]);
    }
  } catch {
    // ignore blob delete errors
  }

  await prisma.document.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
