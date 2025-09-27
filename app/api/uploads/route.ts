/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  const json = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      // TODO: add auth/authorization check if needed
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
        addRandomSuffix: true,
        tokenPayload: clientPayload ?? "",
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      // Persist in DB
      const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
      const { applicationId, kind } = payload as {
        applicationId: string;
        kind: string;
      };

      if (applicationId && kind) {
        await prisma.attachment.create({
          data: {
            applicationId,
            kind: kind as any,
            url: blob.url,
            contentType: blob.contentType,
            size: blob.size,
            label: blob.pathname, // or filename
          },
        });
      }
    },
  });

  return NextResponse.json(json);
}
