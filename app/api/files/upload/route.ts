import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  const json = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      // TODO: authorize user as needed
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
        addRandomSuffix: true,
        // maximumSizeInBytes: 20 * 1024 * 1024, // optional limit
        // callbackUrl: 'https://your-domain/api/files/upload', // optional override
        tokenPayload: clientPayload ?? "",
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      // Persist blob.url / metadata in your DB if needed
      // await prisma.file.create({ data: { url: blob.url, size: blob.size, type: blob.contentType }});
    },
  });

  return NextResponse.json(json);
}
