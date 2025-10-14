// app/documents/page.tsx
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/components/commonage/motion";
import {
  Filters,
  useDocumentFilter,
} from "@/components/commonage/documents/Filters";
import { DocumentGrid } from "@/components/commonage/documents/DocumentGrid";
import { DOCUMENTS } from "@/data/documents";
import {
  FileStack,
  Sparkles,
  Filter as FilterIcon,
  ArrowDownWideNarrow,
} from "lucide-react";

/** Simple sort helpers (no data shape change) */
type SortKey = "newest" | "title";
function sortDocs<T extends { updatedAt: string; title: string }>(
  docs: T[],
  by: SortKey
) {
  if (by === "title") {
    return [...docs].sort((a, b) => a.title.localeCompare(b.title));
  }
  // newest
  return [...docs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export default function DocumentsPage() {
  const { state, setState, categories, filtered } =
    useDocumentFilter(DOCUMENTS);
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const sorted = useMemo(() => sortDocs(filtered, sortBy), [filtered, sortBy]);
  const docCount = DOCUMENTS.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[rgba(243,244,246,0.6)] to-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-10 md:pt-16">
          <motion.div
            {...fadeUp}
            className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Always up to date
            </div> */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Documents
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              Bylaws, applications, policies, and public notices — all in one
              place.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <FileStack className="h-4 w-4" />
              {docCount} total documents
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filters + Sort */}
      <section className="sticky top-14 z-30 border-y bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Filters (search + category) */}
            <div className="flex-1">
              <Filters
                state={state}
                setState={setState}
                categories={categories}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-slate-500 md:inline">
                Sort
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="rounded-xl border px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="newest">Newest first</option>
                  <option value="title">Title A–Z</option>
                </select>
                <ArrowDownWideNarrow className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <motion.div {...fadeUp} className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {sorted.length}
            </span>{" "}
            {sorted.length === 1 ? "document" : "documents"}
            {state.category ? (
              <>
                {" "}
                in{" "}
                <span className="rounded-full bg-gray-100 px-2 py-0.5">
                  {state.category}
                </span>
              </>
            ) : null}
            {state.q ? (
              <>
                {" "}
                matching “
                <span className="font-medium text-slate-700">{state.q}</span>”
              </>
            ) : null}
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
            <FilterIcon className="h-4 w-4" />
            Refine with search and category
          </div>
        </motion.div>

        {/* Grid */}
        <DocumentGrid docs={sorted} />

        {/* Empty state */}
        {sorted.length === 0 && (
          <motion.div
            {...fadeUp}
            className="mt-14 rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <FileStack className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try removing a filter or searching a different term.
            </p>
          </motion.div>
        )}
      </section>
    </main>
  );
}
