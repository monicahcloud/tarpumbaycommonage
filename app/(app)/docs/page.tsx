// app/documents/page.tsx
import DocumentsLibrary, { type DocItem } from "@/components/DocumentLibrary";

const placeholders: DocItem[] = [
  {
    id: "doc-001",
    title: "Draft Tarpum Bay Commonage Land Committee Rules — Cover Letter",
    slug: "tbclc-rules-cover-letter-2024-12-06",
    description:
      "Submission letter to Hon. Clay Sweeting regarding the updated TBCLC Rules (for gazetting).",
    category: "OTHER",
    tags: ["submission", "minister", "gazette"],
    // Move your file into /public/docs/ and use that URL (or swap to Blob/S3 later)
    fileUrl: "/docs/Hon-Clay-Sweeting-Draft-TBCLC-Rules.pdf",
    contentType: "application/pdf",
    size: null,
    updatedAt: "2024-12-06T00:00:00Z",
    status: "PUBLISHED",
    pinned: true,
  },
  {
    id: "doc-002",
    title: "Tarpum Bay Commonage Rules, 2024 — Final Draft",
    slug: "tarpum-bay-commonage-rules-2024-final-draft",
    description:
      "Final draft rules arranged by sections (citation, interpretation, committee, register, eligibility, applications, grants, obligations, disputes, etc.).",
    category: "BYLAWS",
    tags: ["rules", "bylaws", "2024"],
    fileUrl:
      "/docs/Proposed-Tarpum-Bay-Rules-2024-Final-Draft-December-2024.docx",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: null,
    updatedAt: "2024-12-15T00:00:00Z", // adjust if you have the exact date
    status: "PUBLISHED",
  },
  {
    id: "doc-003",
    title: "Commonage Land Application Form (fillable) — Placeholder",
    slug: "application-form-fillable",
    description:
      "Placeholder form for members until the final fillable PDF is uploaded.",
    category: "FORM",
    tags: ["application", "fillable", "placeholder"],
    fileUrl: "/docs/PLACEHOLDER-Application-Form.pdf",
    contentType: "application/pdf",
    size: null,
    updatedAt: new Date().toISOString(),
    status: "PUBLISHED",
  },
];

export default function DocumentsPage() {
  const isAdmin = true; // swap to your auth-based check
  return <DocumentsLibrary initialItems={placeholders} isAdmin={isAdmin} />;
}
