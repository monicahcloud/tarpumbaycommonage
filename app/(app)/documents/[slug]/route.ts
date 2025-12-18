import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DocStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const doc = await prisma.document.findFirst({
    where: { slug: params.slug, status: DocStatus.PUBLISHED },
    select: { fileUrl: true },
  });

  if (!doc?.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.redirect(doc.fileUrl, { status: 302 });
}
