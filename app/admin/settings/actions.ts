"use server";

import { revalidatePath } from "next/cache";
import { setLandApplicationsOpen } from "@/lib/settings";
import { requireStaffOrAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function updateLandApplications(open: boolean) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) throw new Error(authz.error);

  const updated = await setLandApplicationsOpen(open);

  // Optional: audit log (recommended)
  // If you want this without an applicationId, either:
  //  A) allow applicationId to be nullable in AdminEvent, OR
  //  B) store settings changes elsewhere
  //
  // If your AdminEvent.applicationId is required, skip this for now.
  // await prisma.adminEvent.create({ ... });

  revalidatePath("/portal");
  revalidatePath("/portal/commoner");
  revalidatePath("/portal/land/apply");
  revalidatePath("/portal/land/existing");
  revalidatePath("/admin/settings");

  return updated;
}
