/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { z } from "zod";
import slugify from "slugify";

const Base = {
  title: z.string().min(3),
  descriptionMd: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  zoomJoinUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  zoomPasscode: z.string().optional(),
};
const CreateSchema = z.object(Base);

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const status = searchParams.get("status") ?? "ALL";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {
    ...(status !== "ALL" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { descriptionMd: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(from || to
      ? {
          AND: [
            from ? { endsAt: { gte: new Date(from) } } : {},
            to ? { startsAt: { lte: new Date(to) } } : {},
          ],
        }
      : {}),
  };

  const items = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok)
    return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json();
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );

  const data = parsed.data;
  const starts = new Date(data.startsAt);
  const ends = new Date(data.endsAt);
  if (ends <= starts)
    return NextResponse.json(
      { error: "endsAt must be after startsAt." },
      { status: 400 }
    );

  const slug = slugify(`${data.title}-${starts.toISOString().slice(0, 10)}`, {
    lower: true,
    strict: true,
  });

  const item = await prisma.event.create({
    data: {
      slug,
      title: data.title,
      descriptionMd: data.descriptionMd ?? null,
      status: data.status,
      startsAt: starts,
      endsAt: ends,
      allDay: data.allDay,
      location: data.location ?? null,
      isVirtual: data.isVirtual,
      zoomJoinUrl: data.zoomJoinUrl ?? null,
      zoomPasscode: data.zoomPasscode ?? null,
      createdBy: guard.userId!,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
