// app/api/admin/events/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";
import slugify from "slugify";

// Context type for Next.js 15 route handlers (params is a Promise)
type RouteContext = {
  params: Promise<{ id: string }>;
};

const UpdateSchema = z.object({
  title: z.string().min(3).optional(),
  descriptionMd: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  location: z.string().nullable().optional(),
  isVirtual: z.boolean().optional(),
  zoomJoinUrl: z.string().url().nullable().optional(),
  zoomPasscode: z.string().nullable().optional(),
  regenerateSlug: z.boolean().optional(),
});

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const item = await prisma.event.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const starts = parsed.data.startsAt
    ? new Date(parsed.data.startsAt)
    : existing.startsAt;
  const ends = parsed.data.endsAt
    ? new Date(parsed.data.endsAt)
    : existing.endsAt;

  if (ends <= starts) {
    return NextResponse.json(
      { error: "endsAt must be after startsAt." },
      { status: 400 }
    );
  }

  const nextSlug =
    parsed.data.regenerateSlug && (parsed.data.title || parsed.data.startsAt)
      ? slugify(
          `${parsed.data.title ?? existing.title}-${starts
            .toISOString()
            .slice(0, 10)}`,
          { lower: true, strict: true }
        )
      : undefined;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.descriptionMd !== undefined
        ? { descriptionMd: parsed.data.descriptionMd }
        : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      startsAt: starts,
      endsAt: ends,
      ...(parsed.data.allDay !== undefined
        ? { allDay: parsed.data.allDay }
        : {}),
      ...(parsed.data.location !== undefined
        ? { location: parsed.data.location }
        : {}),
      ...(parsed.data.isVirtual !== undefined
        ? { isVirtual: parsed.data.isVirtual }
        : {}),
      ...(parsed.data.zoomJoinUrl !== undefined
        ? { zoomJoinUrl: parsed.data.zoomJoinUrl }
        : {}),
      ...(parsed.data.zoomPasscode !== undefined
        ? { zoomPasscode: parsed.data.zoomPasscode }
        : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      updatedBy: guard.userId!,
    },
  });

  return NextResponse.json({ updated });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
