"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AttachmentKind } from "@prisma/client";
import { UploadCloud } from "lucide-react";

export function UploadButton({
  commonerId,
  kind,
  accept,
}: {
  commonerId: string;
  kind: AttachmentKind;
  accept?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);

    try {
      // unified uploads API
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("commonerId", commonerId);
      fd.set("file", file);

      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) {
        const t = await res.text();
        alert(`Upload failed. ${t}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
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
      />
      <button
        type="button"
        onClick={pick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
        <UploadCloud className="h-4 w-4" />
        {busy ? "Uploading..." : "Upload file"}
      </button>
    </>
  );
}
