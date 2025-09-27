/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { AttachmentKind } from "@prisma/client";

export function UploadButton({
  applicationId,
  kind,
  accept,
}: {
  applicationId: string;
  kind: AttachmentKind;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onPick(file: File) {
    setBusy(true);
    try {
      await upload(file.name, file, {
        access: "public",
        addRandomSuffix: true,
        handleUploadUrl: "/api/uploads",
        clientPayload: JSON.stringify({ applicationId, kind }),
      });
      router.refresh();
    } catch (e: any) {
      alert(`Upload failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-50">
      <input
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.currentTarget.value = ""; // allow re-selecting same file
        }}
        disabled={busy}
      />
      <span>{busy ? "Uploading…" : "Upload file"}</span>
    </label>
  );
}
