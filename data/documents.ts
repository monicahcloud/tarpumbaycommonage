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
    description:
      "An official legislative document outlining the establishment, governance, and legal framework of the Tarpum Bay Commonage. Serves as the primary reference for land management authority and community ownership rights.",
    category: "Policies",
    type: "pdf",
    url: "/documents/commonageAct.pdf",
    updatedAt: "2025-09-15",
    status: "ACTIVE",
    tags: ["governance", "policy", "legal"],
  },
  {
    id: "commonage-rules",
    title: "Proposed Tarpum Bay Commonage Land Committee Rules",
    slug: "commonage-rules",
    description:
      "A draft set of procedural and operational rules proposed for the Tarpum Bay Commonage Land Committee. Includes guidelines for meetings, decision-making, applications, and land stewardship in accordance with community standards.",
    category: "Policies",
    type: "pdf",
    url: "/documents/CommitteRules.pdf",
    updatedAt: "2025-08-28",
    status: "ACTIVE",
    tags: ["rules", "procedures", "committee"],
  },
  // {
  //   id: "transfer-certificate",
  //   title: "Certificate of Transfer (Template)",
  //   slug: "certificate-transfer-template",
  //   description:
  //     "An official form template used to authorize the lawful transfer of Commonage property rights or shares to another individual, with Committee approval.",
  //   category: "Transfers",
  //   type: "docx",
  //   url: "/documents/certificate-of-transfer.docx",
  //   updatedAt: "2025-08-30",
  //   status: "ACTIVE",
  //   tags: ["transfer", "template"],
  // },
  // {
  //   id: "minutes-sept-2025",
  //   title: "Meeting Minutes — Sept 2025",
  //   slug: "minutes-september-2025",
  //   description:
  //     "Official record of motions, discussions, and resolutions from the Committee’s September 2025 meeting. Documents attendance, decisions, and follow-up actions.",
  //   category: "Minutes",
  //   type: "pdf",
  //   url: "/documents/minutes-2025-09.pdf",
  //   updatedAt: "2025-09-25",
  //   status: "ACTIVE",
  //   tags: ["minutes", "meeting"],
  // },
  // {
  //   id: "fee-schedule",
  //   title: "Fee Schedule",
  //   slug: "fee-schedule",
  //   description:
  //     "A current list of fees for land applications, document requests, and transfer processing as approved by the Committee.",
  //   category: "Policies",
  //   type: "sheet",
  //   url: "/documents/fee-schedule.xlsx",
  //   updatedAt: "2025-09-10",
  //   status: "ACTIVE",
  //   tags: ["fees", "finance"],
  // },
  // {
  //   id: "faq-guide",
  //   title: "Applicant Guide & FAQ",
  //   slug: "applicant-guide-faq",
  //   description:
  //     "A step-by-step guide to the Commonage application process with answers to frequently asked questions about eligibility, documentation, and review timelines.",
  //   category: "Guides",
  //   type: "link",
  //   url: "https://example.com/applicant-guide",
  //   updatedAt: "2025-08-10",
  //   status: "ACTIVE",
  //   tags: ["guide", "how-to", "application"],
  // },
];
