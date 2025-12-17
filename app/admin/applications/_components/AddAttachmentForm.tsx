// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useTransition } from "react";
// import { toast } from "sonner";
// import { addAttachment } from "../actions";

// const KINDS = [
//   "ID_PASSPORT",
//   "BIRTH_CERT",
//   "PROOF_OF_LINEAGE",
//   "PROOF_OF_ADDRESS",
//   "PROOF_OF_PAYMENT",
//   "DRAWINGS",
//   "BUSINESS_PLAN",
//   "OTHER",
// ] as const;

// export default function AddAttachmentForm({
//   applicationId,
//   commonerId,
// }: {
//   applicationId: string;
//   commonerId: string | null;
// }) {
//   const [pending, startTransition] = useTransition();

//   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     const form = e.currentTarget;
//     const fd = new FormData(form);
//     const file = fd.get("file") as File | null;

//     if (!file) {
//       toast.error("No file selected", {
//         description: "Please choose a file to upload.",
//       });
//       return;
//     }

//     const target = String(fd.get("target") ?? "APPLICATION") as
//       | "APPLICATION"
//       | "COMMONER";

//     if (target === "COMMONER" && !commonerId) {
//       toast.error("No commoner record", {
//         description: "This user does not have a commoner registration.",
//       });
//       return;
//     }

//     const kind = String(fd.get("kind") ?? "OTHER") as (typeof KINDS)[number];
//     const label = String(fd.get("label") ?? "").trim() || null;

//     const toastId = toast.loading("Uploading document…");

//     try {
//       // 1) Upload to Blob via admin API
//       const up = await fetch("/api/admin/attachments/upload", {
//         method: "POST",
//         body: fd,
//       });

//       const text = await up.text();
//       let upJson: any = null;
//       try {
//         upJson = JSON.parse(text);
//       } catch {
//         // HTML/other response
//       }

//       if (!up.ok) {
//         throw new Error(
//           upJson?.error ?? `Upload failed (${up.status}): ${text.slice(0, 140)}`
//         );
//       }
//       if (!upJson?.url) {
//         throw new Error(
//           `Upload returned unexpected response: ${text.slice(0, 140)}`
//         );
//       }

//       // 2) Create Attachment record (server action)
//       startTransition(async () => {
//         try {
//           await addAttachment({
//             target,
//             applicationId,
//             commonerId,
//             url: upJson.url,
//             contentType: upJson.contentType,
//             size: upJson.size,
//             pathname: upJson.pathname,
//             kind,
//             label,
//           });

//           form.reset();
//           toast.success("Document uploaded", {
//             id: toastId,
//             description: "The file was successfully attached.",
//           });
//         } catch (err: any) {
//           toast.error("Save failed", {
//             id: toastId,
//             description: err?.message ?? "Failed to attach document.",
//           });
//         }
//       });
//     } catch (err: any) {
//       toast.error("Upload failed", {
//         id: toastId,
//         description: err?.message ?? "Something went wrong.",
//       });
//     }
//   }

//   return (
//     <form onSubmit={onSubmit} className="space-y-3">
//       <div className="grid gap-2 sm:grid-cols-2">
//         <div className="grid gap-1">
//           <label className="text-xs font-medium text-slate-700">
//             Attach to
//           </label>
//           <select
//             name="target"
//             className="h-10 rounded-xl border bg-white px-3 text-sm"
//             defaultValue="APPLICATION">
//             <option value="APPLICATION">Application</option>
//             <option value="COMMONER" disabled={!commonerId}>
//               Commoner Registration{!commonerId ? " (none)" : ""}
//             </option>
//           </select>
//         </div>

//         <div className="grid gap-1">
//           <label className="text-xs font-medium text-slate-700">Kind</label>
//           <select
//             name="kind"
//             className="h-10 rounded-xl border bg-white px-3 text-sm"
//             defaultValue="OTHER">
//             {KINDS.map((k) => (
//               <option key={k} value={k}>
//                 {k}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="grid gap-2 sm:grid-cols-2">
//         <div className="grid gap-1">
//           <label className="text-xs font-medium text-slate-700">
//             Label (optional)
//           </label>
//           <input
//             name="label"
//             className="h-10 rounded-xl border px-3 text-sm"
//             placeholder="e.g. Passport front…"
//           />
//         </div>

//         <div className="grid gap-1">
//           <label className="text-xs font-medium text-slate-700">File</label>
//           <input name="file" type="file" required className="text-sm" />
//         </div>
//       </div>

//       <button
//         type="submit"
//         disabled={pending}
//         className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
//         {pending ? "Adding…" : "Upload & Attach"}
//       </button>
//     </form>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addAttachment } from "../actions";

export const KINDS = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
  "PROOF_OF_PAYMENT",
  "DRAWINGS",
  "BUSINESS_PLAN",
  "OTHER",
] as const;

export type AttachmentKind = (typeof KINDS)[number];
export type AttachmentTarget = "APPLICATION" | "COMMONER";

export default function AddAttachmentForm({
  applicationId,
  commonerId,
  defaultTarget = "APPLICATION",
  defaultKind = "OTHER",
  keySeed,
}: {
  applicationId?: string | null;
  commonerId?: string | null;
  defaultTarget?: AttachmentTarget;
  defaultKind?: AttachmentKind;
  // change this to force the form to reset selections when user clicks "Upload" from checklist
  keySeed?: string | number;
}) {
  const [pending, startTransition] = useTransition();

  const [target, setTarget] = useState<AttachmentTarget>(defaultTarget);
  const [kind, setKind] = useState<AttachmentKind>(defaultKind);

  // If parent changes defaults, sync them
  useEffect(() => setTarget(defaultTarget), [defaultTarget]);
  useEffect(() => setKind(defaultKind), [defaultKind]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;

    if (!file) {
      toast.error("No file selected", {
        description: "Please choose a file to upload.",
      });
      return;
    }

    if (target === "COMMONER" && !commonerId) {
      toast.error("No commoner record", {
        description: "This user does not have a commoner registration.",
      });
      return;
    }

    const label = String(fd.get("label") ?? "").trim() || null;

    const toastId = toast.loading("Uploading document…");

    try {
      const up = await fetch("/api/admin/attachments/upload", {
        method: "POST",
        body: fd,
      });

      const text = await up.text();
      let upJson: any = null;
      try {
        upJson = JSON.parse(text);
      } catch {}

      if (!up.ok)
        throw new Error(upJson?.error ?? `Upload failed (${up.status})`);
      if (!upJson?.url) throw new Error("Upload returned no URL.");

      startTransition(async () => {
        try {
          await addAttachment({
            target,
            applicationId,
            commonerId,
            url: upJson.url,
            contentType: upJson.contentType,
            size: upJson.size,
            pathname: upJson.pathname,
            kind,
            label,
          });

          form.reset();
          toast.success("Document uploaded", {
            id: toastId,
            description: "The file was successfully attached.",
          });
        } catch (err: any) {
          toast.error("Save failed", {
            id: toastId,
            description: err?.message ?? "Failed to attach document.",
          });
        }
      });
    } catch (err: any) {
      toast.error("Upload failed", {
        id: toastId,
        description: err?.message ?? "Something went wrong.",
      });
    }
  }

  return (
    <form key={keySeed} onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">
            Attach to
          </label>
          <select
            name="target"
            className="h-10 rounded-xl border bg-white px-3 text-sm"
            value={target}
            onChange={(e) => setTarget(e.target.value as AttachmentTarget)}>
            <option value="APPLICATION">Application</option>
            <option value="COMMONER" disabled={!commonerId}>
              Commoner Registration{!commonerId ? " (none)" : ""}
            </option>
          </select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">Kind</label>
          <select
            name="kind"
            className="h-10 rounded-xl border bg-white px-3 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as AttachmentKind)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">
            Label (optional)
          </label>
          <input
            name="label"
            className="h-10 rounded-xl border px-3 text-sm"
            placeholder="e.g. Passport front…"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">File</label>
          <input name="file" type="file" required className="text-sm" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Adding…" : "Upload & Attach"}
      </button>
    </form>
  );
}
