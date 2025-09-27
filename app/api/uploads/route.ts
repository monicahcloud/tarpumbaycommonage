// app/api/uploads/route.ts
import { auth } from "@clerk/nextjs/server";
import { handleUpload } from "@vercel/blob/client";
import { prisma } from "@/lib/prisma";
import { AttachmentKind } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  return handleUpload(req, {
    onUploadCompleted: async ({ blob, clientPayload }) => {
      const payload = clientPayload ? JSON.parse(clientPayload) : {};
      const { applicationId, kind } = payload as {
        applicationId: string;
        kind: AttachmentKind;
      };

      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      if (!app) throw new Error("Application not found");

      const me = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!me || app.userId !== me.id) throw new Error("Forbidden");

      await prisma.attachment.create({
        data: {
          applicationId: app.id,
          kind,
          url: blob.url,
          contentType: blob.contentType || "application/octet-stream",
          size: blob.size,
          label: blob.pathname.split("/").pop() || null,
        },
      });
    },
    // maximumSizeInBytes: 10 * 1024 * 1024,
    // allowedContentTypes: ["image/*", "application/pdf"],
  });
}
