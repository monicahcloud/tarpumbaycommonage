"use client";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/commonage/motion";
import type { DocumentItem } from "@/data/documents";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DocTypeIcon } from "./DocumentIcons";

export function DocumentCard({ doc }: { doc: DocumentItem }) {
  const isExternal = doc.type === "link" || doc.url.startsWith("http");
  const actionLabel = isExternal ? "Open" : "Open Document";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <DocTypeIcon type={doc.type} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold">
            <Link href={`/documents/${doc.slug}`} className="hover:underline">
              {doc.title}
            </Link>
          </h3>

          {doc.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {doc.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span className="rounded-full bg-gray-100 px-2 py-0.5">
              {doc.category}
            </span>
            <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
            {doc.tags?.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-gray-50 px-2 py-0.5">
                #{t}
              </span>
            ))}
          </div>

          {/* 🧭 Always open in a new tab */}
          <div className="mt-4">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium hover:bg-gray-50">
              {actionLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
