import { FileText } from "lucide-react";
import AttachmentActions from "./AttachmentActions";

type Attachment = {
  id: string;
  url: string;
  contentType: string;
  kind: string;
  label: string | null;
  createdAt: Date;
  size: number | null;
};

function isImage(ct: string) {
  return ct?.startsWith("image/");
}

function isPdf(ct: string) {
  return ct === "application/pdf";
}

function fmtBytes(n?: number | null) {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function AttachmentThumb({
  attachment,
  scope,
  applicationId,
}: {
  attachment: Attachment;
  scope: "commoner" | "application";
  applicationId: string;
}) {
  const title = attachment.label ?? attachment.kind;

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white hover:border-purple-300">
      <div className="absolute right-2 top-2 z-10">
        <AttachmentActions
          id={attachment.id}
          url={attachment.url}
          applicationId={applicationId}
        />
      </div>

      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="block"
        title={title}>
        <div className="aspect-4/3 bg-slate-50">
          {isImage(attachment.contentType) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
              <FileText className="h-10 w-10" />
              <div className="text-xs font-semibold">
                {isPdf(attachment.contentType) ? "PDF" : "FILE"}
              </div>
            </div>
          )}
        </div>

        <div className="px-2 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-xs font-medium text-slate-800">
              {title}
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {scope}
            </span>
          </div>

          <div className="truncate text-[11px] text-slate-500">
            {attachment.contentType}
          </div>

          <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>{fmtBytes(attachment.size)}</span>
            <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </a>
    </div>
  );
}
