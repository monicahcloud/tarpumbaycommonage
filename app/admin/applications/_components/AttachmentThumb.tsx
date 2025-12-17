// import { FileText } from "lucide-react";
// import AttachmentActions from "./AttachmentActions";

// type Attachment = {
//   id: string;
//   url: string;
//   contentType: string;
//   kind: string;
//   label: string | null;
//   createdAt: Date;
//   size: number | null;
// };

// function isImage(ct: string) {
//   return ct?.startsWith("image/");
// }

// function isPdf(ct: string) {
//   return ct === "application/pdf";
// }

// function fmtBytes(n?: number | null) {
//   if (!n) return "—";
//   const units = ["B", "KB", "MB", "GB"];
//   let i = 0;
//   let v = n;
//   while (v >= 1024 && i < units.length - 1) {
//     v /= 1024;
//     i++;
//   }
//   return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
// }

// export default function AttachmentThumb({
//   attachment,
//   scope,
//   applicationId,
// }: {
//   attachment: Attachment;
//   scope: "commoner" | "application";
//   applicationId: string;
// }) {
//   const title = attachment.label ?? attachment.kind;

//   return (
//     <div className="group relative overflow-hidden rounded-2xl border bg-white hover:border-purple-300">
//       <div className="absolute right-2 top-2 z-10">
//         <AttachmentActions
//           id={attachment.id}
//           url={attachment.url}
//           applicationId={applicationId}
//         />
//       </div>

//       <a
//         href={attachment.url}
//         target="_blank"
//         rel="noreferrer"
//         className="block"
//         title={title}>
//         <div className="aspect-4/3 bg-slate-50">
//           {isImage(attachment.contentType) ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={attachment.url}
//               alt={title}
//               className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
//             />
//           ) : (
//             <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
//               <FileText className="h-10 w-10" />
//               <div className="text-xs font-semibold">
//                 {isPdf(attachment.contentType) ? "PDF" : "FILE"}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="px-2 py-2">
//           <div className="flex items-center justify-between gap-2">
//             <div className="truncate text-xs font-medium text-slate-800">
//               {title}
//             </div>
//             <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
//               {scope}
//             </span>
//           </div>

//           <div className="truncate text-[11px] text-slate-500">
//             {attachment.contentType}
//           </div>

//           <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-500">
//             <span>{fmtBytes(attachment.size)}</span>
//             <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
//           </div>
//         </div>
//       </a>
//     </div>
//   );
// }
// app/admin/applications/_components/AttachmentThumb.tsx
import Image from "next/image";
import { FileText, Trash2 } from "lucide-react";

type Attachment = {
  id: string;
  url: string;
  contentType: string | null;
  kind: string;
  label: string | null;
  createdAt: Date;
};

type Props =
  | { attachment: Attachment; scope: "application"; applicationId: string }
  | { attachment: Attachment; scope: "commoner"; applicationId?: never };

export default function AttachmentThumb(props: Props) {
  const { attachment } = props;

  const ct = attachment.contentType ?? "";
  const isImg = ct.startsWith("image/");
  const isPdf = ct === "application/pdf";

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-xl border bg-white hover:shadow-sm"
      title={attachment.label ?? attachment.kind}>
      <div className="aspect-4/3 bg-slate-50">
        {isImg ? (
          <Image
            src={attachment.url}
            alt={attachment.label ?? attachment.kind}
            width={640}
            height={480}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-500">
            <FileText className="h-7 w-7" />
            <span className="mt-2 text-xs">{isPdf ? "PDF" : "FILE"}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-slate-900">
            {(attachment.label ?? attachment.kind).replaceAll("_", " ")}
          </div>
          <div className="text-[11px] text-slate-500">
            {new Date(attachment.createdAt).toLocaleString()}
          </div>
        </div>

        {/* (Optional) You can keep delete buttons elsewhere; leaving icon here as visual */}
        <Trash2 className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
      </div>
    </a>
  );
}
