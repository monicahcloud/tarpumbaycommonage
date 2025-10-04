/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(app)/portal/application/[id]/uploads/upload.client.tsx
"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import type { AttachmentKind } from "@prisma/client";

export function UploadButton({
  applicationId,
  kind,
  accept,
}: {
  applicationId: string;
  kind: AttachmentKind;
  accept?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState<number | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget; // capture before await
    const file = inputEl.files?.[0];
    if (!file) return;

    setBusy(true);
    setPct(0);
    try {
      const res = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/uploads",
        clientPayload: JSON.stringify({ applicationId, kind }),
        contentType: file.type,
        onUploadProgress: (
          evt: number | { loaded?: number; total?: number } | undefined
        ) => {
          if (typeof evt === "number") setPct(Math.round(evt * 100));
          else {
            const loaded = evt?.loaded ?? 0,
              total = evt?.total ?? 1;
            setPct(Math.round((loaded / total) * 100));
          }
        },
      });

      // res has the blob URL/path; now write to DB in a Node route
      const pathname = new URL(res.url).pathname;

      const db = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          kind,
          url: res.url,
          contentType: file.type ?? "application/octet-stream",
          size: file.size,
          pathname,
        }),
      });
      if (!db.ok) {
        const txt = await db.text();
        throw new Error(txt || "DB save failed");
      }

      router.refresh();
    } catch (err: any) {
      alert(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      setPct(null);
      inputEl.value = ""; // safe; we captured inputEl before await
    }
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="file"
        accept={accept}
        onChange={onPick}
        disabled={busy}
        className="block w-full cursor-pointer text-sm file:mr-3 file:rounded file:border file:bg-muted file:px-3 file:py-1.5 hover:file:bg-muted/80 disabled:opacity-60"
      />
      {busy && (
        <span className="text-xs text-slate-600">
          {pct === null ? "Uploading…" : `Uploading… ${pct}%`}
        </span>
      )}
    </label>
  );
}
