/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/uploads/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// ⬇️ v2: import from /client and use the body+request signature
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "edge";

export async function POST(request: Request) {
  // (keep auth if you want uploads gated)
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // v2: read JSON body and pass it + request to handleUpload
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname /* string */,
        clientPayload /* string | undefined */
      ) => {
        // You can validate clientPayload here if you want
        return {
          maximumSizeInBytes: 10 * 1024 * 1024,
          allowedContentTypes: [
            "application/pdf",
            "image/*",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
          // tokenPayload: JSON.stringify({ userId }) // optional, if you later use onUploadCompleted
        };
      },
      // We are NOT using onUploadCompleted here (local dev is tricky for callbacks).
      // You already persist to DB from the client via /api/attachments, which is perfect.
    });

    // v2: return the json result
    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Token generation failed" },
      { status: 400 }
    );
  }
}
