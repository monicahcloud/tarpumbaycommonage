/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // file upload

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const commonerId = String(form.get("commonerId") || "");
  const kind = String(form.get("kind") || "OTHER");
  const file = form.get("file") as File | null;

  if (!commonerId || !file)
    return new Response("Missing fields", { status: 400 });

  // TODO: Upload `file` to your storage (S3/R2/GCS). For now we store a placeholder URL.
  const bytes = await file.arrayBuffer();
  const size = bytes.byteLength;
  const contentType = file.type || "application/octet-stream";
  const filename = file.name || "upload";

  // Placeholder URL (replace with your storage URL after uploading)
  const url = `/uploads/commoner/${commonerId}/${encodeURIComponent(filename)}`;

  await prisma.commonerAttachment.create({
    data: {
      commonerId,
      kind: kind as any,
      url,
      contentType,
      size,
      label: filename,
      pathname: url,
    },
  });

  return Response.json({ ok: true });
}
