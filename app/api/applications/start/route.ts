import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const commoner = await prisma.commonerRegistration.findUnique({
    where: { userId: dbUser.id },
    select: {
      id: true,
      status: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      dob: true,
      address: true,
      ancestry: true,
    },
  });

  if (!commoner) {
    return NextResponse.json(
      { error: "No commoner registration" },
      { status: 400 }
    );
  }

  if (commoner.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Commoner not approved" },
      { status: 403 }
    );
  }

  // Your schema enforces Application.userId unique — so “upsert” is perfect.
  const app = await prisma.application.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      commonerId: commoner.id, // ✅ link to approved commoner

      // snapshot fields (prefill)
      firstName: commoner.firstName,
      lastName: commoner.lastName,
      email: commoner.email,
      phone: commoner.phone,
      dob: commoner.dob,
      address: commoner.address,
      ancestry: commoner.ancestry,

      purpose: "", // user fills this later
      status: "DRAFT",
    },
    update: {
      // if they already have an app but commonerId wasn’t set, fix it
      commonerId: commoner.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: app.id });
}
