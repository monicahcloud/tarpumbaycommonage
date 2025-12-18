/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";
import { z } from "zod";
import { DocCategory, DocStatus, Prisma } from "@prisma/client";

export const runtime = "nodejs";

const Query = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(DocStatus).optional(),
  category: z.nativeEnum(DocCategory).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(25),
});

const Body = z.object({
  title: z.string().min(1, "title required"),
  slug: z.string().min(1, "slug required"),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(DocCategory),
  status: z.nativeEnum(DocStatus).optional().default(DocStatus.PUBLISHED),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.map((s) => s.trim()).filter(Boolean);
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
  contentType: z.string().optional().nullable(),
  size: z
    .union([z.number().int().nonnegative(), z.string()])
    .nullish()
    .transform((v) => {
      if (v == null) return null;
      if (typeof v === "number") return v;
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    }),
  pinned: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (v == null) return false;
      if (typeof v === "boolean") return v;
      const s = v.toLowerCase();
      return s === "true" || s === "1" || s === "on" || s === "yes";
    }),
  blobPath: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams);

  if (raw.status && raw.status.toUpperCase() === "ALL")
    delete (raw as any).status;
  if (raw.category && raw.category.toUpperCase() === "ALL")
    delete (raw as any).category;

  const parsed = Query.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", detail: parsed.error.format() },
      { status: 400 }
    );
  }
  const { q, status, category, page, pageSize } = parsed.data;

  const where: Prisma.DocumentWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ] as Prisma.DocumentWhereInput[],
        }
      : {}),
  };

  try {
    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: true,
          status: true,
          tags: true,
          fileUrl: true,
          contentType: true,
          size: true,
          pinned: true,
          createdAt: true,
          updatedAt: true,
          blobPath: true,
        },
      }),
    ]);

    return NextResponse.json({ documents, total, page, pageSize });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to load documents", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const input = parsed.data;
    const created = await prisma.document.create({
      data: {
        title: input.title,
        slug: input.slug,
        description: input.description ?? null,
        category: input.category,
        status: input.status ?? DocStatus.PUBLISHED,
        tags: input.tags ?? [],
        fileUrl: input.fileUrl,
        contentType: input.contentType ?? null,
        size: input.size ?? null,
        pinned: input.pinned ?? false,
        blobPath: input.blobPath ?? null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "DB create failed", code: e?.code, message: e?.message },
      { status: 500 }
    );
  }
}
