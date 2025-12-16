"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaffOrAdmin } from "@/lib/authz";

const decideSchema = z
  .object({
    applicationId: z.string().min(1),
    decision: z.enum(["UNDER_REVIEW", "APPROVE", "REJECT"]),
    adminNote: z.string().max(5000).optional().nullable(),
    rejectionReason: z.string().max(5000).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.decision === "REJECT") {
      const rr = (val.rejectionReason ?? "").trim();
      if (!rr) {
        ctx.addIssue({
          code: "custom",
          path: ["rejectionReason"],
          message: "Rejection reason is required when rejecting.",
        });
      }
    }
  });

export async function decideApplication(formData: FormData) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) throw new Error(authz.error);

  const parsed = decideSchema.safeParse({
    applicationId: formData.get("applicationId"),
    decision: formData.get("decision"),
    adminNote: (formData.get("adminNote") as string | null) ?? null,
    rejectionReason: (formData.get("rejectionReason") as string | null) ?? null,
  });

  if (!parsed.success) {
    // surface a readable message
    const msg = parsed.error.issues[0]?.message ?? "Invalid form submission.";
    throw new Error(msg);
  }

  const { applicationId, decision, adminNote, rejectionReason } = parsed.data;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true },
  });
  if (!app) throw new Error("Application not found.");

  const nextStatus =
    decision === "APPROVE"
      ? "APPROVED"
      : decision === "REJECT"
      ? "REJECTED"
      : "UNDER_REVIEW";

  // Basic transition guard (adjust as you like)
  const allowedFrom = new Set(["DRAFT", "SUBMITTED", "UNDER_REVIEW"]);
  if (!allowedFrom.has(app.status)) {
    throw new Error(`Cannot change status from ${app.status}.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: nextStatus as any,
        adminNote: adminNote ?? null,
        rejectionReason:
          decision === "REJECT" ? rejectionReason ?? "Rejected" : null,
      },
    });

    await tx.statusLog.create({
      data: {
        applicationId,
        changedBy: authz.userId, // Clerk userId is fine (String)
        fromStatus: app.status as any,
        toStatus: nextStatus as any,
        note: adminNote ?? null,
      },
    });
    await tx.adminEvent.create({
      data: {
        applicationId,
        type: "STATUS_CHANGED",
        actorClerkId: authz.userId,
        message: `Status changed: ${app.status} → ${nextStatus}`,
        meta: {
          from: app.status,
          to: nextStatus,
          note: adminNote ?? null,
          rejectionReason: decision === "REJECT" ? (rejectionReason ?? null) : null,
        },
      },
    });
  });
  

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
}

// app/admin/applications/actions.ts (replace the attachmentSchema + addApplicationAttachment)

const ATTACHMENT_KINDS = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
  "PROOF_OF_PAYMENT",
  "DRAWINGS",
  "BUSINESS_PLAN",
  "OTHER",
] as const;

const attachmentSchema = z
  .object({
    target: z.enum(["APPLICATION", "COMMONER"]),
    applicationId: z.string().min(1),
    commonerId: z.string().optional().nullable(),
    url: z.string().url(),
    contentType: z.string().min(1),
    size: z.number().int().nonnegative().optional(),
    label: z.string().max(255).optional().nullable(),
    kind: z.enum(ATTACHMENT_KINDS),
    pathname: z.string().max(500).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.target === "COMMONER" && !val.commonerId) {
      ctx.addIssue({
        code: "custom",
        path: ["commonerId"],
        message: "Missing commonerId for COMMONER attachment.",
      });
    }
  });

export async function addAttachment(input: {
  target: "APPLICATION" | "COMMONER";
  applicationId: string;
  commonerId?: string | null;
  url: string;
  contentType: string;
  size?: number;
  label?: string | null;
  kind: (typeof ATTACHMENT_KINDS)[number];
  pathname?: string | null;
}) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) throw new Error(authz.error);

  const parsed = attachmentSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid attachment.");

  const { target, applicationId, commonerId, ...rest } = parsed.data;

  // Ensure application exists (we're on the review page for an app)
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, userId: true },
  });
  if (!app) throw new Error("Application not found.");

  if (target === "COMMONER") {
    // Ensure the commoner registration exists and belongs to the same user (safety)
    const commoner = await prisma.commonerRegistration.findUnique({
      where: { id: commonerId! },
      select: { id: true, userId: true },
    });
    if (!commoner) throw new Error("Commoner registration not found.");
    if (commoner.userId !== app.userId)
      throw new Error(
        "Commoner registration does not belong to this applicant."
      );

    await prisma.attachment.create({
      data: {
        commonerId: commoner.id,
        ...rest,
      } as any,
    });

    await prisma.adminEvent.create({
      data: {
        applicationId,
        type: "ATTACHMENT_ADDED",
        actorClerkId: authz.userId,
        message: `Attachment added (COMMONER): ${rest.kind}`,
        meta: {
          target: "COMMONER",
          kind: rest.kind,
          label: rest.label ?? null,
          contentType: rest.contentType,
          size: rest.size ?? null,
          url: rest.url,
          pathname: rest.pathname ?? null,
          commonerId: commoner.id,
        },
      },
    });
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin/applications");
    return;
  }

  // APPLICATION
  await prisma.attachment.create({
    data: {
      applicationId,
      ...rest,
    } as any,
  });
await prisma.adminEvent.create({
  data: {
    applicationId,
    type: "ATTACHMENT_ADDED",
    actorClerkId: authz.userId,
    message: `Attachment added (APPLICATION): ${rest.kind}`,
    meta: {
      target: "APPLICATION",
      kind: rest.kind,
      label: rest.label ?? null,
      contentType: rest.contentType,
      size: rest.size ?? null,
      url: rest.url,
      pathname: rest.pathname ?? null,
    },
  },
});
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
}
