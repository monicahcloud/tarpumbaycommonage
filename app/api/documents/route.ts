/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DocCategory, DocStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Query = z.object({
  q: z.string().optional(),
  category: z.nativeEnum(DocCategory).optional(),
  tag: z.string().optional(),
  sort: z.enum(["RECENT", "A_Z"]).optional().default("RECENT"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams);

  if (raw.category && raw.category.toUpperCase() === "ALL") {
    delete (raw as any).category;
  } else if (raw.category) {
    raw.category = raw.category.toUpperCase();
  }

  const parsed = Query.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", detail: parsed.error.format() },
      { status: 400 }
    );
  }

  const { q, category, tag, sort, page, pageSize } = parsed.data;

  const where: Prisma.DocumentWhereInput = {
    status: DocStatus.PUBLISHED,
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } }, // exact tag match
          ] as Prisma.DocumentWhereInput[],
        }
      : {}),
    ...(tag ? { tags: { has: tag } } : {}),
  };

  const orderBy =
    sort === "A_Z"
      ? [{ title: "asc" as const }]
      : [{ pinned: "desc" as const }, { updatedAt: "desc" as const }];

  const [total, rows] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        tags: true,
        fileUrl: true,
        contentType: true,
        size: true,
        pinned: true,
        updatedAt: true,
        status: true,
      },
    }),
  ]);

  const items = rows.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    description: d.description,
    category: d.category,
    tags: d.tags,
    fileUrl: d.fileUrl,
    contentType: d.contentType,
    size: d.size,
    updatedAt: d.updatedAt,
    status: d.status,
    pinned: d.pinned,
  }));

  return NextResponse.json({ items, total, page, pageSize });
}
