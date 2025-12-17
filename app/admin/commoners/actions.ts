"use server";

import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  regId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional().nullable(),
});

export async function decideCommoner(formData: FormData) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) throw new Error(authz.error);

  const parsed = schema.safeParse({
    regId: formData.get("regId"),
    decision: formData.get("decision"),
    note: (formData.get("note") as string | null) ?? null,
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form.");

  const { regId, decision } = parsed.data;

  const updated =
    decision === "APPROVE"
      ? await prisma.commonerRegistration.update({
          where: { id: regId },
          data: { status: "APPROVED", approvedAt: new Date() },
          select: { id: true, status: true, approvedAt: true },
        })
      : await prisma.commonerRegistration.update({
          where: { id: regId },
          data: { status: "REJECTED", approvedAt: null },
          select: { id: true, status: true, approvedAt: true },
        });

  // optional but helpful during dev
  console.log("COMMONER_UPDATED", updated);

  revalidatePath("/admin/commoners");
  revalidatePath(`/admin/commoners/${regId}`);
}
