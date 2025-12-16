import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireStaffOrAdmin } from "@/lib/authz";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const pathname = `attachments/${crypto.randomUUID()}-${file.name}`;

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
}
