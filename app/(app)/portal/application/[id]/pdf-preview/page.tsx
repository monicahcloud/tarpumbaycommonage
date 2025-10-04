"use client";

import { useEffect, useState } from "react";

export default function PdfPreview({ src }: { src: string }) {
  const [ok, setOk] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src, { method: "GET" });
        // accept 200 + content-type application/pdf
        const ct = res.headers.get("content-type") || "";
        if (!cancelled) setOk(res.ok && ct.includes("application/pdf"));
      } catch {
        if (!cancelled) setOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (ok === null) {
    return (
      <div className="relative overflow-hidden rounded-lg border bg-white">
        <div className="aspect-[8.5/11] w-full max-h-[80vh]">
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <div className="animate-pulse text-sm text-slate-500">
              Loading preview…
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ok) {
    return (
      <div className="relative overflow-hidden rounded-lg border bg-white p-6">
        <p className="text-sm text-slate-600">
          We couldn&apos;t load the PDF preview. You can still{" "}
          <a href={src} className="underline" target="_blank" rel="noreferrer">
            open or download it in a new tab
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white">
      <iframe
        title="Application PDF Preview"
        src={src}
        className="h-[70vh] w-full"
      />
    </div>
  );
}
