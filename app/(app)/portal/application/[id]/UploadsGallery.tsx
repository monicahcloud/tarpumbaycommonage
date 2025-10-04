// // app/(app)/portal/application/[id]/UploadsGallery.tsx
// "use client";

// import { useEffect, useState, useTransition } from "react";
// import Link from "next/link";

// type Item = {
//   id: string;
//   url: string;
//   contentType: string;
//   size: number;
//   createdAt: string;
// };

// function fmtSize(bytes: number) {
//   if (!bytes) return "—";
//   const units = ["B", "KB", "MB", "GB"];
//   let i = 0;
//   let v = bytes;
//   while (v >= 1024 && i < units.length - 1) {
//     v /= 1024;
//     i++;
//   }
//   return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
// }

// function isImage(t: string) {
//   return t?.startsWith("image/");
// }
// function isPdf(t: string) {
//   return t === "application/pdf";
// }

// export default function UploadsGallery({
//   applicationId,
// }: {
//   applicationId: string;
// }) {
//   const [items, setItems] = useState<Item[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isPending, startTransition] = useTransition();

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       setLoading(true);
//       const res = await fetch(`/api/uploads?applicationId=${applicationId}`, {
//         cache: "no-store",
//       });
//       const data = await res.json();
//       if (alive) {
//         setItems(data.items ?? []);
//         setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [applicationId]);

//   async function handleDelete(id: string) {
//     // optimistic UI
//     const prev = items;
//     setItems((s) => s.filter((x) => x.id !== id));
//     try {
//       const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Delete failed");
//     } catch (e) {
//       // revert on failure
//       setItems(prev);
//       alert("Failed to delete file.");
//     }
//   }

//   if (loading) {
//     return (
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
//         {Array.from({ length: 6 }).map((_, i) => (
//           <div
//             key={i}
//             className="h-40 animate-pulse rounded-lg border bg-slate-100"
//           />
//         ))}
//       </div>
//     );
//   }

//   if (!items.length) {
//     return (
//       <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-slate-600">
//         No uploads yet.
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
//       {items.map((it) => (
//         <div
//           key={it.id}
//           className="group relative overflow-hidden rounded-lg border bg-white">
//           {/* Preview area */}
//           <div className="flex h-40 items-center justify-center bg-slate-50">
//             {isImage(it.contentType) ? (
//               // Images
//               <img
//                 src={it.url}
//                 alt="upload"
//                 className="h-full w-full object-cover"
//                 loading="lazy"
//               />
//             ) : isPdf(it.contentType) ? (
//               // Tiny PDF preview (most browsers)
//               <iframe
//                 src={`${it.url}#view=FitH&toolbar=0`}
//                 className="h-full w-full"
//                 title="PDF preview"
//               />
//             ) : (
//               // Generic file
//               <div className="text-center text-xs text-slate-500">
//                 <div className="mb-2 text-5xl">📄</div>
//                 <div>{it.contentType || "File"}</div>
//               </div>
//             )}
//           </div>

//           {/* Footer meta */}
//           <div className="flex items-center justify-between gap-2 p-2">
//             <a
//               href={it.url}
//               target="_blank"
//               rel="noreferrer"
//               className="truncate text-xs text-blue-600 underline hover:opacity-80">
//               Open
//             </a>
//             <span className="shrink-0 text-[10px] text-slate-500">
//               {fmtSize(it.size)}
//             </span>
//           </div>

//           {/* Delete button (top-right) */}
//           <button
//             onClick={() => handleDelete(it.id)}
//             className="absolute right-2 top-2 hidden rounded-md bg-white/90 px-2 py-1 text-xs text-rose-600 shadow ring-1 ring-rose-200 hover:bg-white group-hover:block"
//             aria-label="Delete file"
//             title="Delete">
//             Delete
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }
