/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { requireStaffOrAdmin } from "@/lib/authz";
import { updateCommonerStatus } from "@/lib/admin.service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCommonerRegistrationStatus(
  regId: string,
  to: "APPROVED" | "REJECTED"
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) throw new Error(authz.error);

  const updated = await updateCommonerStatus(regId, to as any);

  // Optional audit log (matches your AdminEvent model)
  await prisma.adminEvent.create({
    data: {
      applicationId: "COMMONER:" + regId, // if you want to reuse appId, or change schema later
      type: "STATUS_CHANGED",
      actorClerkId: authz.userId,
      message: `Commoner status changed to ${to}`,
      meta: { regId, to },
    },
  });

  revalidatePath(`/admin/commoners/${regId}`);
  revalidatePath(`/admin/commoners`);

  return updated;
}
