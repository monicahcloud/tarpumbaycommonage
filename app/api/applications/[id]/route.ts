/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/applications/[id]/route.ts
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { userId } = await auth();
//   if (!userId) return new Response("Unauthorized", { status: 401 });

//   const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (!dbUser) return new Response("Not Found", { status: 404 });

//   const app = await prisma.application.findUnique({
//     where: { id: params.id },
//     select: { id: true, userId: true },
//   });
//   if (!app || app.userId !== dbUser.id)
//     return new Response("Forbidden", { status: 403 });

//   const body = await req.json();

//   // Only update fields you explicitly allow from the client
//   const data: any = {};
//   if (typeof body.lotNumber === "string") data.lotNumber = body.lotNumber;
//   if (typeof body.alreadyHasLand === "boolean")
//     data.alreadyHasLand = body.alreadyHasLand;
//   if (typeof body.purpose === "string") data.purpose = body.purpose;
//   if (typeof body.additionalInfo === "string")
//     data.additionalInfo = body.additionalInfo;

//   const updated = await prisma.application.update({
//     where: { id: params.id },
//     data,
//     select: {
//       id: true,
//       lotNumber: true,
//       alreadyHasLand: true,
//       purpose: true,
//       additionalInfo: true,
//       updatedAt: true,
//     },
//   });

//   return Response.json(updated);
// }
// app/api/applications/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: any) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params; // ← no custom type annotation; avoids the build error

  const me = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!me)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app || app.userId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  // Build a partial update safely
  const data: Record<string, any> = {};
  if (typeof body.purpose === "string") data.purpose = body.purpose;
  if (typeof body.lotNumber === "string") data.lotNumber = body.lotNumber;
  if (typeof body.signature === "string") data.signature = body.signature;
  if (typeof body.signDate === "string")
    data.signDate = body.signDate ? new Date(body.signDate) : null;
  if (typeof body.additionalInfo === "string")
    data.additionalInfo = body.additionalInfo;
  if (typeof body.alreadyHasLand === "boolean")
    data.alreadyHasLand = body.alreadyHasLand;

  const updated = await prisma.application.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id });
}
