import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function ensureUser() {
  const cu = await currentUser();
  if (!cu) return null;

  const email =
    cu.primaryEmailAddress?.emailAddress ??
    cu.emailAddresses?.[0]?.emailAddress ??
    "";
  const emailLc = email.toLowerCase();

  // A) already linked?
  const byClerk = await prisma.user.findUnique({ where: { clerkId: cu.id } });
  if (byClerk) {
    return prisma.user.update({
      where: { id: byClerk.id },
      data: {
        email: emailLc,
        firstName: cu.firstName ?? null,
        lastName: cu.lastName ?? null,
      },
    });
  }

  // B) not linked yet — reuse existing row by email (avoid unique conflicts)
  const byEmail = emailLc
    ? await prisma.user.findUnique({ where: { email: emailLc } })
    : null;

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: cu.id,
        firstName: cu.firstName ?? byEmail.firstName,
        lastName: cu.lastName ?? byEmail.lastName,
      },
    });
  }

  // C) brand new
  return prisma.user.create({
    data: {
      clerkId: cu.id,
      email: emailLc,
      firstName: cu.firstName ?? null,
      lastName: cu.lastName ?? null,
    },
  });
}
