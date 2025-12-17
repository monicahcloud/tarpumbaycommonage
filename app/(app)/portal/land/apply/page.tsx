// app/portal/land/apply/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplyFormClient from "../../apply/ApplyFormClient";
import { getLandApplicationsSetting } from "@/lib/settings";
import { getCommonerDocsStatus } from "@/lib/commonerRequirements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplyForLotPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/land/apply");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/portal");

  // Site toggle
  const { open } = await getLandApplicationsSetting();
  if (!open) redirect("/portal?land=closed");

  // Must be approved commoner
  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
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
  if (!reg || reg.status !== "APPROVED") redirect("/portal/commoner");

  // ✅ REQUIRE commoner required docs before land apply
  const docs = await getCommonerDocsStatus(reg.id);
  if (!docs.ok) redirect("/portal/commoner/uploads?missing=1");

  // Ensure exactly one Application per user
  const existing = await prisma.application.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      commonerId: true,
      alreadyHasLand: true,
      lotNumber: true,
    },
  });

  // If they already have land recorded, don't let them apply
  if (existing?.alreadyHasLand || existing?.lotNumber) redirect("/portal");

  if (!existing) {
    await prisma.application.create({
      data: {
        userId: user.id,
        commonerId: reg.id, // ✅ link commoner docs

        // snapshot fields (prefill)
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone ?? null,
        dob: reg.dob ?? null,
        address: reg.address,
        ancestry: reg.ancestry ?? null,

        // land fields start empty
        purpose: "",
        status: "DRAFT",
      },
    });
  } else if (!existing.commonerId) {
    await prisma.application.update({
      where: { id: existing.id },
      data: { commonerId: reg.id }, // ✅ link if missing
    });
  }

  return <ApplyFormClient />;
}
