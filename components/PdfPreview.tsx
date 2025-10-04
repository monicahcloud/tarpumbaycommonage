// components/PdfPreview.tsx
"use client";

export default function PdfPreview({ src }: { src: string }) {
  const base = src.split("#")[0]; // strip fragment
  const inlineUrl =
    base + (base.includes("?") ? "&" : "?") + "disposition=inline";

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white">
      <iframe
        title="Application PDF Preview"
        src={`${inlineUrl}#view=FitH&toolbar=1&navpanes=0`}
        className="h-[70vh] w-full"
      />
    </div>
  );
}
