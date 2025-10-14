"use client";
import { FileText, FileSpreadsheet, FileSignature, Link2 } from "lucide-react";
import type { DocType } from "@/data/documents";
import { JSX } from "react";

export function DocTypeIcon({
  type,
  className,
}: {
  type: DocType;
  className?: string;
}) {
  const map: Record<DocType, JSX.Element> = {
    pdf: <FileText className={className} />,
    docx: <FileSignature className={className} />,
    sheet: <FileSpreadsheet className={className} />,
    link: <Link2 className={className} />,
  };
  return map[type];
}
