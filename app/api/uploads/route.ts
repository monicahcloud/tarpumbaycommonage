/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/uploads/route.ts
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { PutBlobResult } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { AttachmentKind } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      request: req,
      body,
      // Optional: restrict types / add suffix / echo clientPayload into tokenPayload
      onBeforeGenerateToken: async (
        _pathname: string,
        clientPayload?: string
      ) => {
        // You can also enrich this with the server-side userId to trust ownership later
        return {
          addRandomSuffix: true,
          // allowedContentTypes: ["image/*", "application/pdf"],
          tokenPayload: clientPayload, // pass through what the client sent (applicationId, kind)
        };
      },
      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }: {
        blob: PutBlobResult;
        tokenPayload?: string;
      }) => {
        const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
        const { applicationId, kind } = payload as {
          applicationId: string;
          kind: AttachmentKind;
        };

        // Verify ownership
        const app = await prisma.application.findUnique({
          where: { id: applicationId },
          include: { user: true },
        });
        if (!app) throw new Error("Application not found");

        const me = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!me || app.userId !== me.id) throw new Error("Forbidden");

        // Save attachment
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
    });

    return Response.json(json);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
