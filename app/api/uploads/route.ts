/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { AttachmentKind } from "@prisma/client";

export const runtime = "nodejs";

function assertAttachmentKind(kind: string): asserts kind is AttachmentKind {
  if (!Object.values(AttachmentKind).includes(kind as AttachmentKind)) {
    throw new Error("Invalid attachment kind");
  }
}

async function uploadFile(file: File) {
  const ext = file.name?.split(".").pop() ?? "";
  const key = `${crypto.randomUUID()}${ext ? "." + ext : ""}`;

  const res = await put(key, Buffer.from(await file.arrayBuffer()), {
    access: "public",
    contentType: file.type || "application/octet-stream",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: res.url,
    contentType: file.type || "application/octet-stream",
    size: typeof file.size === "number" ? file.size : null,
    key,
  };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 415 }
    );
  }

  const form = await request.formData();
  const kindRaw = String(form.get("kind") || "");
  const file = form.get("file") as File | null;

  const commonerId = form.get("commonerId")?.toString() || null;
  const applicationId = form.get("applicationId")?.toString() || null;

  const label =
    (form.get("label")?.toString() || file?.name || "").trim() || null;

  if (!kindRaw)
    return NextResponse.json({ error: "Missing kind" }, { status: 400 });
  if (!file)
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!commonerId && !applicationId) {
    return NextResponse.json(
      { error: "Provide commonerId or applicationId" },
      { status: 400 }
    );
  }

  try {
    assertAttachmentKind(kindRaw);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Invalid kind" },
      { status: 400 }
    );
  }

  // ✅ Ownership checks using relational user.clerkId (NOT User.id)
  if (commonerId) {
    const reg = await prisma.commonerRegistration.findUnique({
      where: { id: commonerId },
      select: { id: true, user: { select: { clerkId: true } } },
    });

    if (!reg || reg.user.clerkId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
          debug: {
            commonerId,
            ownerClerkId: reg?.user?.clerkId ?? null,
            sessionUserId: userId,
          },
        },
        { status: 403 }
      );
    }
  }

  if (applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, user: { select: { clerkId: true } } },
    });

    if (!app || app.user.clerkId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
          debug: {
            applicationId,
            ownerClerkId: app?.user?.clerkId ?? null,
            sessionUserId: userId,
          },
        },
        { status: 403 }
      );
    }
  }

  const uploaded = await uploadFile(file);

  const created = await prisma.attachment.create({
    data: {
      commonerId,
      applicationId,
      kind: kindRaw,
      url: uploaded.url,
      contentType: uploaded.contentType,
      size: uploaded.size ?? null,
      label,
      pathname: uploaded.key,
    },
    select: {
      id: true,
      url: true,
      contentType: true,
      size: true,
      kind: true,
      createdAt: true,
      label: true,
      pathname: true,
      commonerId: true,
      applicationId: true,
    },
  });

  return NextResponse.json(created);
}
