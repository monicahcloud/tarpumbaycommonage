// app/api/commoner/[id]/uploads/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // we need Node APIs for file handling

// --- Optional: Vercel Blob
let putToBlob:
  | null
  | ((file: File, keyPrefix: string) => Promise<{ url: string }>) = null;

async function ensureBlob() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Lazy import to avoid bundling on local dev if not used
    const { put } = await import("@vercel/blob");
    putToBlob = async (file, keyPrefix) => {
      const arrayBuffer = await file.arrayBuffer();
      const filename = file.name || "upload";
      const key = `${keyPrefix}/${Date.now()}-${filename}`;
      const res = await put(key, new Uint8Array(arrayBuffer), {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || "application/octet-stream",
      });
      return { url: res.url };
    };
  }
}

// --- Local dev fallback (/uploads)
import path from "path";
import { promises as fs } from "fs";

async function putToLocal(file: File, keyPrefix: string) {
  const arrayBuffer = await file.arrayBuffer();
  const filename = file.name || "upload";
  const rel = path.join("uploads", keyPrefix, `${Date.now()}-${filename}`);
  const abs = path.join(process.cwd(), "public", rel); // public/uploads/...

  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, Buffer.from(arrayBuffer));

  // Served statically from /public
  const url = "/" + rel.replace(/\\/g, "/");
  return { url };
}

type SlotKey = "feeReceipt" | "passport" | "birthCert";
const slotToKind: Record<
  SlotKey,
  "PROOF_OF_ADDRESS" | "ID_PASSPORT" | "BIRTH_CERT" | "OTHER"
> = {
  feeReceipt: "PROOF_OF_ADDRESS", // or "OTHER" if you prefer a new enum later
  passport: "ID_PASSPORT",
  birthCert: "BIRTH_CERT",
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  // Verify the commoner registration belongs to the current user
  const commoner = await prisma.commonerRegistration.findFirst({
    where: { id, user: { clerkId: userId } },
    select: { id: true },
  });
  if (!commoner)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse formData (works in Node runtime on Next 13/14/15 app router)
  const form = await req.formData();

  // init blob if token is present
  if (!putToBlob) await ensureBlob();

  const uploaded: Array<{
    slot: SlotKey;
    url: string;
    contentType?: string | null;
    size?: number | null;
  }> = [];

  // Helper to process one slot
  const handleSlot = async (slot: SlotKey) => {
    const f = form.get(slot);
    if (!f || !(f instanceof File)) return;

    const keyPrefix = `commoner/${id}/${slot}`;
    let url: string;

    if (putToBlob) {
      const res = await putToBlob(f, keyPrefix);
      url = res.url;
    } else {
      const res = await putToLocal(f, keyPrefix);
      url = res.url;
    }

    // Persist metadata
    await prisma.commonerAttachment.create({
      data: {
        commonerId: id,
        kind: slotToKind[slot], // AttachmentKind
        url,
        contentType: f.type || null,
        size: typeof f.size === "number" ? f.size : null,
        label: f.name || null,
      },
    });

    uploaded.push({
      slot,
      url,
      contentType: f.type || null,
      size: typeof f.size === "number" ? f.size : null,
    });
  };

  // Process the three expected slots
  await Promise.all([
    handleSlot("feeReceipt"),
    handleSlot("passport"),
    handleSlot("birthCert"),
  ]);

  if (uploaded.length === 0) {
    return NextResponse.json(
      { error: "No files found in request" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, files: uploaded });
}
