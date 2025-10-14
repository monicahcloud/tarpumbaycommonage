// data/documents.ts
export type DocStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";
export type DocType = "pdf" | "docx" | "sheet" | "link";

export type DocumentItem = {
  id: string;
  title: string;
  slug: string; // for /documents/[slug]
  description?: string;
  category:
    | "Bylaws"
    | "Applications"
    | "Transfers"
    | "Minutes"
    | "Policies"
    | "Guides"
    | "Notices";
  type: DocType;
  url: string; // /documents/... or external link
  updatedAt: string; // ISO date
  status: DocStatus;
  tags?: string[];
};

export const DOCUMENTS: DocumentItem[] = [
  {
    id: "commonageAct",
    title: "Tarpum Bay Commonage Act",
    slug: "commonageAct",
    description: "Current governing bylaws adopted by the Committee.",
    category: "Bylaws",
    type: "pdf",
    url: "/documents/commonageAct.pdf",
    updatedAt: "2025-09-15",
    status: "ACTIVE",
    tags: ["governance"],
  },
  {
    id: "commonage-rules",
    title: "Proposed Tarpum Bay Commonage Land Committee Rules.",
    slug: "commonage-rules",
    description: "Complete this form and attach required documents for review.",
    category: "Policies",
    type: "pdf",
    url: "/documents/CommitteRules.pdf",
    updatedAt: "2025-08-28",
    status: "ACTIVE",
    tags: ["rules"],
  },
  //   {
  //     id: "transfer-certificate",
  //     title: "Certificate of Transfer (Template)",
  //     slug: "certificate-transfer-template",
  //     description: "Template authorizing transfer in the recipient’s name.",
  //     category: "Transfers",
  //     type: "docx",
  //     url: "/documents/certificate-of-transfer.docx",
  //     updatedAt: "2025-08-30",
  //     status: "ACTIVE",
  //     tags: ["transfer", "template"],
  //   },
  //   {
  //     id: "minutes-sept-2025",
  //     title: "Meeting Minutes — Sept 2025",
  //     slug: "minutes-september-2025",
  //     description: "Approved minutes of the September meeting.",
  //     category: "Minutes",
  //     type: "pdf",
  //     url: "/documents/minutes-2025-09.pdf",
  //     updatedAt: "2025-09-25",
  //     status: "ACTIVE",
  //     tags: ["minutes"],
  //   },
  //   {
  //     id: "fee-schedule",
  //     title: "Fee Schedule",
  //     slug: "fee-schedule",
  //     description: "Current fees for applications and transfers.",
  //     category: "Policies",
  //     type: "sheet",
  //     url: "/documents/fee-schedule.xlsx",
  //     updatedAt: "2025-09-10",
  //     status: "ACTIVE",
  //     tags: ["fees"],
  //   },
  //   {
  //     id: "faq-guide",
  //     title: "Applicant Guide & FAQ",
  //     slug: "applicant-guide-faq",
  //     description: "Step-by-step guide to the allocation process.",
  //     category: "Guides",
  //     type: "link",
  //     url: "https://example.com/applicant-guide",
  //     updatedAt: "2025-08-10",
  //     status: "ACTIVE",
  //     tags: ["guide", "how-to"],
  //   },
];
