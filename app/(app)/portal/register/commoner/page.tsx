import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CommonerRegisterClient from "./CommonerRegisterClient";

export default async function CommonerRegisterPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId)
    return redirectToSignIn({ returnBackUrl: "/portal/register/commoner" });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/portal");

  const existing = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
  });
  if (existing) redirect("/portal/commoner"); // go to status if already started

  return <CommonerRegisterClient userEmail={user.email} />;
}
