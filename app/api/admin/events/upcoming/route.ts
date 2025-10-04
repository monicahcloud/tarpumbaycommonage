/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/events/upcoming/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const now = new Date();
  const where: any = {
    status: "PUBLISHED",
    endsAt: { gte: from ? new Date(from) : now },
    ...(to ? { startsAt: { lte: new Date(to) } } : {}),
  };

  const items = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json({ items });
}
