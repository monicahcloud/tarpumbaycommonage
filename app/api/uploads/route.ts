/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/uploads/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { put /*, del */ } from "@vercel/blob";
import crypto from "node:crypto";

export const runtime = "nodejs"; // Buffer/crypto needed in Node runtime

// ---- storage adapter (swap with your own) ----
async function uploadFile(file: File) {
  const ext = file.name?.split(".").pop() ?? "";
  const key = `${crypto.randomUUID()}${ext ? "." + ext : ""}`;

  // Upload to Vercel Blob (public). If you use a token, add `token:` here.
  const res = await put(key, Buffer.from(await file.arrayBuffer()), {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return {
    url: res.url, // public URL
    contentType: file.type || "application/octet-stream", // <-- ALWAYS string
    size: typeof file.size === "number" ? file.size : null,
    pathname: key, // stable key we used
  };
}
// --------------------------------------------

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return new Response("Expected multipart/form-data", { status: 415 });
  }

  const form = await request.formData();
  const kind = String(form.get("kind") || "");
  const commonerId = form.get("commonerId")?.toString() || null;
  const applicationId = form.get("applicationId")?.toString() || null;
  const file = form.get("file") as File | null;

  if (!kind) return new Response("Missing kind", { status: 400 });
  if (!file) return new Response("Missing file", { status: 400 });
  if (!commonerId && !applicationId) {
    return new Response("Provide commonerId or applicationId", { status: 400 });
  }

  // Ownership checks
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return new Response("User not found", { status: 404 });

  if (commonerId) {
    const reg = await prisma.commonerRegistration.findUnique({
      where: { id: commonerId },
      select: { userId: true },
    });
    if (!reg || reg.userId !== dbUser.id)
      return new Response("Forbidden", { status: 403 });
  }

  if (applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { userId: true },
    });
    if (!app || app.userId !== dbUser.id)
      return new Response("Forbidden", { status: 403 });
  }

  // Upload the file
  const uploaded = await uploadFile(file);

  // Save unified Attachment (contentType must be a string per schema)
  const created = await prisma.attachment.create({
    data: {
      commonerId,
      applicationId,
      kind: kind as any, // AttachmentKind
      url: uploaded.url,
      contentType: uploaded.contentType, // <-- string
      size: uploaded.size ?? undefined,
      label: file.name || undefined,
      pathname: uploaded.pathname,
    },
  });

  return Response.json({
    id: created.id,
    url: created.url,
    contentType: created.contentType,
    size: created.size,
    kind: created.kind,
    createdAt: created.createdAt,
  });
}
