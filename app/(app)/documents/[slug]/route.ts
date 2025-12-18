/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(app)/documents/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DocStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: any) {
  const { slug } = ctx.params as { slug: string };

  const doc = await prisma.document.findFirst({
    where: { slug, status: DocStatus.PUBLISHED },
    select: { fileUrl: true },
  });

  if (!doc?.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 302 redirect to the storage URL
  return NextResponse.redirect(new URL(doc.fileUrl), { status: 302 });
}
