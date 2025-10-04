// components/pdf/ApplyPdfInline.tsx
"use client";
import { BlobProvider } from "@react-pdf/renderer";
import { ApplyPdfDoc, type ApplyPdfData } from "./ApplyPdfDoc";

export default function ApplyPdfInline({ data }: { data: ApplyPdfData }) {
  return (
    <div className="rounded-lg border bg-white">
      <BlobProvider document={<ApplyPdfDoc data={data} />}>
        {({ url, loading, error }) => {
          if (loading) {
            return (
              <div className="h-[70vh] w-full flex items-center justify-center text-sm text-slate-500">
                Generating preview…
              </div>
            );
          }
          if (error || !url) {
            return (
              <div className="p-4 text-sm text-red-600">
                Couldn’t generate preview. {error?.message}
              </div>
            );
          }
          return (
            <>
              {/* Real inline preview without iframe */}
              <object
                data={url}
                type="application/pdf"
                className="w-full h-[70vh]">
                <div className="p-4 text-sm text-slate-600">
                  Your browser can’t preview PDFs here.{" "}
                  <a
                    href={url}
                    className="underline"
                    target="_blank"
                    rel="noreferrer">
                    Open in new tab
                  </a>
                  .
                </div>
              </object>

              {/* Optional footer actions */}
              <div className="flex items-center justify-end gap-3 p-3 border-t">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline">
                  Open in new tab
                </a>
                <a
                  href={url}
                  download="application-preview.pdf"
                  className="text-sm underline">
                  Download PDF
                </a>
              </div>
            </>
          );
        }}
      </BlobProvider>
    </div>
  );
}
