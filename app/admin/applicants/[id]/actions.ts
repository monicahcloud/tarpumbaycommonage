"use server";

import type { $Enums } from "@prisma/client";
import { requireStaffOrAdmin } from "@/lib/authz";
import { updateCommonerStatus } from "@/lib/admin.service";
import { revalidatePath } from "next/cache";

export async function setCommonerStatus(
  regId: string,
  next: $Enums.CommonerStatus
) {
  const gate = await requireStaffOrAdmin();
  if (!gate.ok) throw new Error("Forbidden");
  await updateCommonerStatus(regId, next);
  revalidatePath(`/admin/applicants/${regId}`);
}
