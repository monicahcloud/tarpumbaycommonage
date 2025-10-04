"use client";

import { useEffect, useRef, useState } from "react";

type UploadRow = {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: string;
};

export default function UploadManager({ appId }: { appId: string }) {
  const [files, setFiles] = useState<UploadRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing uploads
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/uploads?appId=${encodeURIComponent(appId)}`,
        { cache: "no-store" }
      );
      if (res.ok) setFiles(await res.json());
    })();
  }, [appId]);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const f = e.target.files[0];
    await uploadFile(f);
    // reset
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadFile(file: File) {
    setBusy(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("appId", appId);

    // Use XHR for progress (fetch has no progress)
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      } else {
        setProgress(null);
      }
    };
    xhr.onerror = () => {
      alert("Upload failed.");
      setBusy(false);
      setProgress(null);
    };
    xhr.onload = () => {
      setBusy(false);
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        const row: UploadRow = JSON.parse(xhr.responseText);
        setFiles((prev) => [row, ...prev]);
      } else {
        alert(`Upload failed: ${xhr.status} ${xhr.responseText}`);
      }
    };
    xhr.send(form);
  }

  async function remove(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Delete failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold">Upload documents</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Accepted: PDF, JPG, PNG, DOC, DOCX. Max 10 MB.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            onChange={handleSelect}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={busy}
            className="block w-full text-sm file:mr-3 file:rounded file:border file:px-3 file:py-1.5 file:bg-muted file:hover:bg-muted/70"
          />
          {busy && (
            <span className="text-sm text-muted-foreground">
              {progress === null ? "Uploading…" : `Uploading… ${progress}%`}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-base font-semibold">Your files</h3>
        </div>
        {files.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No files uploaded yet.
          </div>
        ) : (
          <ul className="divide-y">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{f.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {(f.size / 1024).toFixed(1)} KB • {f.contentType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    className="text-sm underline"
                    href={f.url}
                    target="_blank"
                    rel="noreferrer">
                    View
                  </a>
                  <button
                    onClick={() => remove(f.id)}
                    className="text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
