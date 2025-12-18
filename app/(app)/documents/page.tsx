// app/(app)/documents/page.tsx
import DocumentLibrary from "@/components/DocumentLibrary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DocumentsPage() {
  // DocumentsLibrary is a Client Component ("use client" at its top)
  // It can be imported and used directly in a Server Component page.
  return <DocumentLibrary api="/api/documents" isAdmin={false} />;
}
