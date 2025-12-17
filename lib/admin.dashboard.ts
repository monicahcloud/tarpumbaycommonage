// lib/admin.dashboard.ts
import { prisma } from "@/lib/prisma";
import type { AttachmentKind } from "@prisma/client";

export const REQUIRED_COMMONER_KINDS: AttachmentKind[] = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
  "PROOF_OF_PAYMENT",
];

export async function getAdminDashboardCommoners() {
  const [pending, approved, rejected] = await Promise.all([
    prisma.commonerRegistration.count({ where: { status: "PENDING" } }),
    prisma.commonerRegistration.count({ where: { status: "APPROVED" } }),
    prisma.commonerRegistration.count({ where: { status: "REJECTED" } }),
  ]);

  // recent pending (with attachments kinds)
  const recentPending = await prisma.commonerRegistration.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "desc" },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      submittedAt: true,
      attachments: {
        where: { kind: { in: REQUIRED_COMMONER_KINDS } },
        select: { kind: true },
      },
    },
  });

  const rows = recentPending.map((r) => {
    const have = new Set(r.attachments.map((a) => a.kind));
    const missing = REQUIRED_COMMONER_KINDS.filter((k) => !have.has(k));
    return {
      ...r,
      missing,
      missingCount: missing.length,
      okDocs: missing.length === 0,
    };
  });

  const needsDocsCount = rows.filter((r) => !r.okDocs).length;

  return {
    counts: { pending, approved, rejected },
    needsDocsCount,
    recentPending: rows,
  };
}
