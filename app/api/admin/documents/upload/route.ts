/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireStaffOrAdmin } from "@/lib/authz";
import { put } from "@vercel/blob";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function uploadFile(file: File) {
  const ext = file.name?.split(".").pop() ?? "";
  const key = `documents/${crypto.randomUUID()}${ext ? "." + ext : ""}`;
  const res = await put(key, Buffer.from(await file.arrayBuffer()), {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });
  return {
    url: res.url,
    contentType: file.type || "application/octet-stream",
    size: typeof file.size === "number" ? file.size : null,
    pathname: key,
    originalName: file.name || null,
  };
}

export async function POST(req: Request) {
  const authz = await requireStaffOrAdmin();
  if (!authz.ok)
    return NextResponse.json({ error: authz.error }, { status: authz.status });

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 415 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const uploaded = await uploadFile(file);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upload failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
