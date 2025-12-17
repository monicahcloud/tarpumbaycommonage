import "server-only";
import { prisma } from "@/lib/prisma";
import type { AttachmentKind } from "@prisma/client";

export const REQUIRED_COMMONER_KINDS: AttachmentKind[] = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
  "PROOF_OF_PAYMENT",
];

export async function getCommonerDocsStatus(commonerId: string) {
  const rows = await prisma.attachment.findMany({
    where: {
      commonerId,
      kind: { in: REQUIRED_COMMONER_KINDS },
    },
    select: { kind: true },
  });

  const have = new Set(rows.map((r) => r.kind));
  const missing = REQUIRED_COMMONER_KINDS.filter((k) => !have.has(k));

  return {
    ok: missing.length === 0,
    missing,
    have: Array.from(have),
  };
}
