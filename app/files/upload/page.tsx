"use client";

import { upload } from "@vercel/blob/client";
import type { PutBlobResult } from "@vercel/blob"; // ← type comes from here
import { useRef, useState } from "react";

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const file = inputRef.current?.files?.[0];
        if (!file) return;

        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/files/upload",
        });
        setBlob(newBlob);
      }}>
      <input ref={inputRef} type="file" required />
      <button type="submit">Upload</button>
      {blob && (
        <p>
          Uploaded: <a href={blob.url}>{blob.url}</a>
        </p>
      )}
    </form>
  );
}
