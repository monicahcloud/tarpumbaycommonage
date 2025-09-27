// app/api/uploads/route.ts
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { head } from "@vercel/blob"; // 👈 get metadata here
import { prisma } from "@/lib/prisma";
import { AttachmentKind } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as HandleUploadBody;

  const json = await handleUpload({
    request: req,
    body,
    onBeforeGenerateToken: async (_pathname, clientPayload) => ({
      addRandomSuffix: true,
      tokenPayload: clientPayload ?? undefined,
    }),
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
      const { applicationId, kind } = payload as {
        applicationId: string;
        kind: AttachmentKind;
      };

      // Verify ownership
      const app = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      const me = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!app || !me || app.userId !== me.id) throw new Error("Forbidden");

      // 👇 Fetch metadata (has size, contentType, pathname, etc.)
      const meta = await head(blob.url);

      await prisma.attachment.create({
        data: {
          applicationId: app.id,
          kind,
          url: meta.url, // (blob.url is fine too)
          contentType: meta.contentType ?? "application/octet-stream",
          size: typeof meta.size === "number" ? meta.size : null, // your schema allows Int?
          label:
            (meta.pathname || new URL(meta.url).pathname).split("/").pop() ??
            null,
        },
      });
    },
  });

  return Response.json(json);
}
