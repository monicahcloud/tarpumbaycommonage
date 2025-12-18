/* eslint-disable @typescript-eslint/no-explicit-any */
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
  fileUrl: z.string().url().optional(),
  contentType: z.string().min(1).optional().nullable(),
  size: z.number().int().nonnegative().optional().nullable(),
  blobPath: z.string().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const json = await req.json().catch(() => ({}));
  const parsed = UpdateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id: params.id },
    data: parsed.data as any,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const isBlobUrl = doc.fileUrl.includes(".blob.vercel-storage.com/");
    if (isBlobUrl) {
      await del(doc.fileUrl); // full URL works
    } else if (doc.blobPath) {
      await del([doc.blobPath]);
    }
  } catch {
    // ignore blob delete errors; continue to delete DB row
  }

  await prisma.document.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
