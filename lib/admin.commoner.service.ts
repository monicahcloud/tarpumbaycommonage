// lib/admin.commoner.service.ts
import { prisma } from "@/lib/prisma";
import { REQUIRED_COMMONER_KINDS } from "@/lib/admin.commoners";

export async function getCommonerReview(commonerId: string) {
  const reg = await prisma.commonerRegistration.findUnique({
    where: { id: commonerId },
    include: {
      attachments: { orderBy: { createdAt: "desc" } },
      user: true,
    },
  });
  if (!reg) return null;

  const rows = await prisma.attachment.findMany({
    where: { commonerId, kind: { in: REQUIRED_COMMONER_KINDS } },
    select: { kind: true },
  });

  const have = new Set(rows.map((r) => r.kind));
  const checklist = REQUIRED_COMMONER_KINDS.map((k) => ({
    kind: k,
    ok: have.has(k),
  }));

  return { reg, checklist };
}
