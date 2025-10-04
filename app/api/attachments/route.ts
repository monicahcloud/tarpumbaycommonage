/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/attachments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AttachmentKind } from "@prisma/client";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({
  applicationId: z.string().min(1, "applicationId required"),
  kind: z
    .nativeEnum(AttachmentKind)
    .refine((val) => Object.values(AttachmentKind).includes(val), {
      message: "Invalid attachment kind",
    }),
  url: z.string().url("url must be a valid URL"),
  contentType: z.string().min(1).default("application/octet-stream"),
  size: z.number().int().nonnegative().optional(),
  pathname: z.string().optional(), // keep optional; only persist if your schema has it
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  try {
    const json = await req.json();
    payload = Body.parse(json);
  } catch (e: any) {
    console.error("ATTACHMENTS_PARSE_ERROR", e?.issues ?? e);
    return NextResponse.json(
      { error: "Invalid request body", detail: e?.issues ?? String(e) },
      { status: 400 }
    );
  }

  const { applicationId, kind, url, contentType, size, pathname } = payload;

  try {
    // Ownership check
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    if (app.user.clerkId !== userId) {
      console.error("ATTACHMENTS_OWNERSHIP_FAIL", {
        userId,
        ownerClerkId: app.user.clerkId,
        applicationId,
      });
      return NextResponse.json(
        { error: "Not allowed (ownership)" },
        { status: 403 }
      );
    }

    // Build data object. Only include pathname if your model has it required/desired.
    const data: any = {
      applicationId,
      kind, // enum is already validated by z.nativeEnum
      url,
      contentType: contentType || "application/octet-stream",
      size: typeof size === "number" ? size : null,
    };
    if (typeof pathname === "string" && pathname.length > 0) {
      data.pathname = pathname;
    }

    const rec = await prisma.attachment.create({ data });
    return NextResponse.json(rec, { status: 201 });
  } catch (e: any) {
    // Prisma error formatting
    // P2002: unique constraint; P2003: foreign key; etc.
    const code = e?.code;
    console.error("ATTACHMENTS_DB_ERROR", { code, message: e?.message, e });
    return NextResponse.json(
      { error: "DB save failed", code, message: e?.message },
      { status: 500 }
    );
  }
}
