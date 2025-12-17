/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/ensureUser.ts
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function ensureUser() {
  const cu = await currentUser();
  if (!cu) return null;

  const email =
    cu.primaryEmailAddress?.emailAddress ??
    cu.emailAddresses?.[0]?.emailAddress ??
    null;

  // ✅ Do NOT allow empty email in your DB because email is @unique
  if (!email) return null;

  const emailLc = email.toLowerCase();

  try {
    return await prisma.$transaction(async (tx) => {
      // A) already linked by clerkId?
      const byClerk = await tx.user.findUnique({ where: { clerkId: cu.id } });
      if (byClerk) {
        return tx.user.update({
          where: { id: byClerk.id },
          data: {
            email: emailLc,
            firstName: cu.firstName ?? null,
            lastName: cu.lastName ?? null,
          },
        });
      }

      // B) not linked yet — reuse by email (avoids unique conflicts)
      const byEmail = await tx.user.findUnique({ where: { email: emailLc } });
      if (byEmail) {
        return tx.user.update({
          where: { id: byEmail.id },
          data: {
            clerkId: cu.id,
            // keep existing names if Clerk is missing them
            firstName: cu.firstName ?? byEmail.firstName,
            lastName: cu.lastName ?? byEmail.lastName,
          },
        });
      }

      // C) brand new
      return tx.user.create({
        data: {
          clerkId: cu.id,
          email: emailLc,
          firstName: cu.firstName ?? null,
          lastName: cu.lastName ?? null,
        },
      });
    });
  } catch (e: any) {
    // ✅ If a race happens, retry once by re-fetching
    if (e?.code === "P2002") {
      const existing =
        (await prisma.user.findUnique({ where: { clerkId: cu.id } })) ??
        (await prisma.user.findUnique({ where: { email: emailLc } }));

      if (existing) {
        return prisma.user.update({
          where: { id: existing.id },
          data: {
            clerkId: cu.id, // safe if already set
            email: emailLc,
            firstName: cu.firstName ?? existing.firstName,
            lastName: cu.lastName ?? existing.lastName,
          },
        });
      }
    }

    throw e;
  }
}
