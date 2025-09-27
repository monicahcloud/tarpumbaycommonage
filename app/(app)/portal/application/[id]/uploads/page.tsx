// app/(app)/portal/applications/[id]/uploads/page.tsx
"use client";
import { useParams } from "next/navigation";
import { upload, type PutBlobResult } from "@vercel/blob/client";
import { useState } from "react";

type Kind =
  | "ID_PASSPORT"
  | "BIRTH_CERT"
  | "DRAWINGS"
  | "PROOF_OF_ADDRESS"
  | "OTHER";

export default function UploadsPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<PutBlobResult[]>([]);

  async function doUpload(kind: Kind, file: File) {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/uploads",
      clientPayload: JSON.stringify({ applicationId: id, kind }),
      addRandomSuffix: true,
    });
    setItems((prev) => [blob, ...prev]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Upload Documents</h1>

      <UploadRow
        label="Government ID / Passport"
        kind="ID_PASSPORT"
        onPick={doUpload}
      />
      <UploadRow
        label="Birth Certificate"
        kind="BIRTH_CERT"
        onPick={doUpload}
      />
      <UploadRow
        label="Preliminary Drawings"
        kind="DRAWINGS"
        onPick={doUpload}
      />
      <UploadRow
        label="Proof of Address"
        kind="PROOF_OF_ADDRESS"
        onPick={doUpload}
      />

      <div className="pt-2">
        <a
          className="rounded border px-3 py-1"
          href={`/api/applications/${id}/pdf`}>
          Download PDF
        </a>
      </div>
    </div>
  );
}

function UploadRow({
  label,
  kind,
  onPick,
}: {
  label: string;
  kind: Kind;
  onPick: (k: Kind, f: File) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded border p-3">
      <span>{label}</span>
      <input
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(kind, f);
        }}
      />
    </div>
  );
}
