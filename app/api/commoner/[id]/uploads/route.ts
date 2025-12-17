// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/commoner/[id]/uploads/route.ts
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { put } from "@vercel/blob";
// import { NextResponse } from "next/server";
// import { AttachmentKind } from "@prisma/client";

// export const runtime = "nodejs";

// export async function POST(req: Request, context: any) {
//   const { userId } = await auth();
//   if (!userId)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const commonerId = context?.params?.id as string;

//   const me = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (!me)
//     return NextResponse.json({ error: "User not found" }, { status: 404 });

//   const reg = await prisma.commonerRegistration.findUnique({
//     where: { id: commonerId },
//   });
//   if (!reg || reg.userId !== me.id) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   const form = await req.formData();
//   const file = form.get("file") as File | null;
//   const kind = form.get("kind") as AttachmentKind | null;
//   const label = (form.get("label") as string | null) ?? undefined;

//   if (!file)
//     return NextResponse.json({ error: "Missing file" }, { status: 400 });
//   if (!kind)
//     return NextResponse.json({ error: "Missing kind" }, { status: 400 });

//   const filename = (file as any).name || "upload";
//   const key = `commoners/${commonerId}/${Date.now()}-${filename}`;

//   const uploaded = await put(key, file, {
//     access: "public",
//     token: process.env.BLOB_READ_WRITE_TOKEN,
//     contentType: file.type || "application/octet-stream",
//   });

//   const contentType = file.type || "application/octet-stream";

//   const record = await prisma.attachment.create({
//     data: {
//       commonerId,
//       applicationId: null,
//       kind,
//       url: uploaded.url,
//       contentType, // must be a string (schema requires it)
//       size: typeof file.size === "number" ? file.size : null,
//       label,
//       pathname: new URL(uploaded.url).pathname,
//     },
//   });

//   return NextResponse.json({ id: record.id, url: uploaded.url });
// }
