// // app/files/upload/page.tsx
// "use client";
// import { upload, type PutBlobResult } from "@vercel/blob/client";
// import { useRef, useState } from "react";

// export default function UploadPage() {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [blob, setBlob] = useState<PutBlobResult | null>(null);

//   return (
//     <form
//       onSubmit={async (e) => {
//         e.preventDefault();
//         const file = inputRef.current?.files?.[0];
//         if (!file) throw new Error("No file selected");

//         const newBlob = await upload(file.name, file, {
//           access: "public",
//           handleUploadUrl: "/api/files/upload", // our token+webhook route
//         });
//         setBlob(newBlob);
//       }}>
//       <input ref={inputRef} type="file" required />
//       <button>Upload</button>
//       {blob && (
//         <p>
//           URL: <a href={blob.url}>{blob.url}</a>
//         </p>
//       )}
//     </form>
//   );
// }

"use client";

import { upload, type PutBlobResult } from "@vercel/blob/client";
import { useRef, useState } from "react";

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const file = inputRef.current?.files?.[0];
        if (!file) return;

        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/files/upload", // your token route
          // clientPayload: JSON.stringify({ applicationId: '...' }), // optional
        });
        setBlob(newBlob);
      }}>
      <input ref={inputRef} type="file" required />
      <button type="submit">Upload</button>

      {blob && (
        <p>
          Uploaded: <a href={blob.url}>{blob.url}</a>
        </p>
      )}
    </form>
  );
}
