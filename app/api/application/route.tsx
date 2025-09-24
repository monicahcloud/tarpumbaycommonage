import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const saved = await prisma.application.create({ data });
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
