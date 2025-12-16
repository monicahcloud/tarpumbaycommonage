/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireStaffOrAdmin } from "@/lib/authz";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Optional size guard (10MB)
  const MAX = 10 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 413 }
    );
  }

  const pathname = `attachments/${crypto.randomUUID()}-${file.name}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({
      url: blob.url,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      pathname,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
