/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/admin.commoners.ts
import { prisma } from "@/lib/prisma";
import type { CommonerStatus, AttachmentKind } from "@prisma/client";

export const REQUIRED_COMMONER_KINDS: AttachmentKind[] = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
  "PROOF_OF_PAYMENT",
];

export async function listCommoners(opts: {
  q?: string;
  status?: CommonerStatus | "ALL";
  missingOnly?: boolean;
}) {
  const q = (opts.q ?? "").trim();
  const status = opts.status ?? "ALL";

  const where: any = {};
  if (status !== "ALL") where.status = status;

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const regs = await prisma.commonerRegistration.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      approvedAt: true,
      firstName: true,
      lastName: true,
      email: true,
      userId: true,
      attachments: {
        where: { kind: { in: REQUIRED_COMMONER_KINDS } },
        select: { kind: true },
      },
    },
    take: 200,
  });

  const rows = regs.map((r) => {
    const have = new Set(r.attachments.map((a) => a.kind));
    const missing = REQUIRED_COMMONER_KINDS.filter((k) => !have.has(k));
    return {
      id: r.id,
      status: r.status,
      submittedAt: r.submittedAt,
      approvedAt: r.approvedAt,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      missingCount: missing.length,
      missing,
      uploadedCount: REQUIRED_COMMONER_KINDS.length - missing.length,
      requiredCount: REQUIRED_COMMONER_KINDS.length,
    };
  });

  return opts.missingOnly ? rows.filter((r) => r.missingCount > 0) : rows;
}
