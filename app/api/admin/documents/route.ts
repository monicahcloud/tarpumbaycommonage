/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/documents/route.ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(base: string) {
  // try base, then base-2, base-3, ...
  let candidate = base || "document";
  let n = 1;
  // hard cap to avoid infinite loop if something weird happens
  while (n < 200) {
    const exists = await prisma.document.findUnique({
      where: { slug: candidate },
    });
    if (!exists) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
  // fallback to time-based if somehow we looped a lot
  return `${base}-${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    if (!title)
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const rawSlug = (String(form.get("slug") ?? "") || title).trim();
    const baseSlug = slugify(rawSlug);
    const slug = await ensureUniqueSlug(baseSlug);

    const description = String(form.get("description") ?? "");
    const category = String(
      form.get("category") ?? "OTHER"
    ).toUpperCase() as any;
    const tagsCsv = String(form.get("tags") ?? "");
    const tags = tagsCsv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const pinned = String(form.get("pinned")) === "true";
    const status = String(form.get("status") ?? "PUBLISHED").toUpperCase() as
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED";

    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "File required" }, { status: 400 });

    // Upload to Vercel Blob (public)
    const key = `docs/${slug}/${Date.now()}-${file.name}`;
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Auto-fill from uploaded File
    const size = file.size ?? null;
    const contentType = file.type || null;

    const doc = await prisma.document.create({
      data: {
        title,
        slug,
        description,
        category,
        tags,
        fileUrl: blob.url,
        contentType,
        size,
        pinned,
        status,
      },
    });

    return NextResponse.json({ ok: true, item: doc });
  } catch (err: any) {
    // Map Prisma unique constraint nicely
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target = (err.meta as any)?.target as string[] | undefined;
      return NextResponse.json(
        {
          error: `Duplicate value for unique field${
            target ? `: ${target.join(", ")}` : ""
          }.`,
        },
        { status: 409 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
