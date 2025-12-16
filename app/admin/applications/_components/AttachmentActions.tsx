"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import DeleteAttachmentButton from "./DeleteAttachmentButton";

export default function AttachmentActions({
  id,
  url,
  applicationId,
}: {
  id: string;
  url: string;
  applicationId: string;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied");
        }}
        className="inline-flex items-center justify-center rounded-lg border bg-white p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Copy link"
        title="Copy link">
        <Copy className="h-4 w-4" />
      </button>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-lg border bg-white p-2 text-slate-600 hover:bg-slate-50"
        aria-label="Open"
        title="Open">
        <ExternalLink className="h-4 w-4" />
      </a>

      <DeleteAttachmentButton id={id} applicationId={applicationId} />
    </div>
  );
}
