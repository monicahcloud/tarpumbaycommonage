/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

const KEY = "LAND_APPLICATIONS";

export async function getLandApplicationsSetting() {
  const row = await prisma.siteSetting.findUnique({
    where: { key: KEY },
    select: { value: true, updatedAt: true },
  });

  const open = (row?.value as any)?.open;
  return {
    open: open !== false, // default open unless explicitly set false
    updatedAt: row?.updatedAt ?? null,
  };
}

export async function setLandApplicationsOpen(open: boolean) {
  return prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: { open } },
    update: { value: { open } },
    select: { key: true, value: true, updatedAt: true },
  });
}
