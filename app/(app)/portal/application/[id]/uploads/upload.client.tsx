/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AttachmentKind } from "@prisma/client";
import { toast } from "sonner";

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    const t = toast.loading("Uploading…");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("applicationId", applicationId);
      fd.set("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Upload failed (${res.status})`);
      }

      toast.success("Uploaded", { id: t });
      router.refresh();
    } catch (err: any) {
      toast.error("Upload failed", {
        id: t,
        description: err?.message ?? "Something went wrong.",
      });
    } finally {
      setBusy(false);
      inputEl.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? "image/*,application/pdf"}
        className="hidden"
        onChange={onChange}
        disabled={busy}
      />
      <button
        type="button"
        onClick={pick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
        {busy ? "Uploading…" : "Upload file"}
      </button>
    </>
  );
}
