import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const url = new URL(req.url);
  const applicationIdFromQuery = url.searchParams.get("applicationId") || null;

  const attachment = await prisma.attachment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      pathname: true,
      applicationId: true,
      commonerId: true,
      kind: true,
      url: true,
      contentType: true,
      size: true,
      label: true,
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applicationId = attachment.applicationId ?? applicationIdFromQuery;
  if (!applicationId) {
    return NextResponse.json(
      {
        error:
          "Missing applicationId for audit logging (pass ?applicationId=...)",
      },
      { status: 400 }
    );
  }

  // Best-effort blob delete
  if (attachment.pathname) {
    try {
      await del(attachment.pathname);
    } catch (e) {
      console.warn("Blob delete failed:", e);
    }
  }

  await prisma.attachment.delete({ where: { id: attachment.id } });

  // ✅ Audit event
  await prisma.adminEvent.create({
    data: {
      applicationId,
      type: "ATTACHMENT_DELETED",
      actorClerkId: authz.userId,
      message: `Attachment deleted: ${attachment.kind}`,
      meta: {
        attachmentId: attachment.id,
        kind: attachment.kind,
        label: attachment.label ?? null,
        contentType: attachment.contentType,
        size: attachment.size ?? null,
        url: attachment.url,
        pathname: attachment.pathname ?? null,
        applicationId: attachment.applicationId ?? null,
        commonerId: attachment.commonerId ?? null,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
