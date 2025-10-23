/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import type { $Enums } from "@prisma/client";

export type ListParams = {
  q?: string;
  status?: $Enums.CommonerStatus; // PENDING | APPROVED | REJECTED
  limit?: number;
  cursor?: string | null; // CommonerRegistration.id
};

export async function listApplicants({
  q,
  status,
  limit = 20,
  cursor = null,
}: ListParams) {
  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.commonerRegistration.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      firstName: true,
      lastName: true,
      email: true,
      user: { select: { id: true, email: true } },
      _count: { select: { attachments: true, applications: true } },
    },
  });

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, -1) : rows;
  return { data, nextCursor: hasMore ? data[data.length - 1]!.id : null };
}

export async function getApplicant(regId: string) {
  const reg = await prisma.commonerRegistration.findUnique({
    where: { id: regId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          kind: true,
          url: true,
          contentType: true,
          size: true,
          createdAt: true,
          label: true,
        },
      },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          attachments: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              kind: true,
              url: true,
              contentType: true,
              size: true,
              createdAt: true,
              label: true,
            },
          },
          statusLogs: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!reg) return null;

  const required: $Enums.AttachmentKind[] = [
    "ID_PASSPORT",
    "BIRTH_CERT",
    "PROOF_OF_LINEAGE",
    "PROOF_OF_ADDRESS",
    "PROOF_OF_PAYMENT",
  ];

  const latestByKind = new Map<
    $Enums.AttachmentKind,
    (typeof reg.attachments)[number]
  >();
  const countByKind = new Map<$Enums.AttachmentKind, number>();
  for (const a of reg.attachments) {
    if (!latestByKind.has(a.kind)) latestByKind.set(a.kind, a);
    countByKind.set(a.kind, (countByKind.get(a.kind) ?? 0) + 1);
  }

  const checklist = required.map((k) => ({
    kind: k,
    ok: (countByKind.get(k) ?? 0) > 0,
    count: countByKind.get(k) ?? 0,
    latest: latestByKind.get(k) ?? null,
  }));

  const application = reg.applications[0] ?? null;

  return { reg, application, checklist };
}

export async function updateCommonerStatus(
  regId: string,
  to: $Enums.CommonerStatus
) {
  return prisma.commonerRegistration.update({
    where: { id: regId },
    data: {
      status: to,
      approvedAt: to === "APPROVED" ? new Date() : null,
    },
    select: { id: true, status: true, approvedAt: true },
  });
}
