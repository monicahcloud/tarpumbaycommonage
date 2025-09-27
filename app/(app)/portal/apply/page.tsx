// app/(app)/portal/apply/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplyFormClient from "./ApplyFormClient";

export default async function PortalApplyPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  const existing = await prisma.application.findFirst({
    where: { userId: user!.id },
  });
  if (existing) redirect("/portal/application");
  return <ApplyFormClient />;
}
