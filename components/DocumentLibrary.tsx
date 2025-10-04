/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DocumentsLibrary.tsx — Beautiful member-facing Bylaws & Documents UI
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Search,
  Tag,
  Filter,
  Clock,
  Paperclip,
  Scale,
  FolderOpen,
  Pin,
} from "lucide-react";

// -------- Types --------
export type DocCategory =
  | "BYLAWS"
  | "POLICY"
  | "FORM"
  | "MEETING_MINUTES"
  | "GUIDE"
  | "OTHER";

export type DocItem = {
  id: string;
  title: string;
  slug: string; // optional in your backend; used for deep links
  description?: string | null;
  category: DocCategory;
  tags?: string[] | null;
  fileUrl: string; // blob/s3/etc
  contentType?: string | null; // e.g. application/pdf, image/png
  size?: number | null; // bytes
  updatedAt: string | Date; // last published/updated
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  pinned?: boolean | null;
};

export type DocumentsLibraryProps = {
  api?: string; // e.g. "/api/documents" — expects { items: DocItem[] }
  initialItems?: DocItem[];
  isAdmin?: boolean; // show small draft badge for admins
};

// -------- Helpers --------
const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    typeof d === "string" ? new Date(d) : d
  );

function fmtSize(bytes?: number | null) {
  if (!bytes && bytes !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  const p = n < 10 && i > 0 ? 1 : 0;
  return `${n.toFixed(p)} ${u[i]}`;
}

const categoryLabel: Record<DocCategory, string> = {
  BYLAWS: "Bylaws",
  POLICY: "Policies",
  FORM: "Forms",
  MEETING_MINUTES: "Meeting Minutes",
  GUIDE: "Guides",
  OTHER: "Other",
};

const badgeCls: Record<DocCategory, string> = {
  BYLAWS: "bg-slate-900 text-white ring-slate-900",
  POLICY: "bg-blue-50 text-blue-700 ring-blue-200",
  FORM: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEETING_MINUTES: "bg-violet-50 text-violet-700 ring-violet-200",
  GUIDE: "bg-amber-50 text-amber-800 ring-amber-200",
  OTHER: "bg-slate-100 text-slate-700 ring-slate-200",
};

// function getIcon(ct?: string | null) {
//   if (!ct) return FileText;
//   if (ct.includes("pdf")) return FileText;
//   if (ct.startsWith("image/")) return Paperclip;
//   return FileText;
// }

// function fileNameFromUrl(url: string) {
//   try {
//     return new URL(url).pathname.split("/").pop() ?? url;
//   } catch {
//     return url;
//   }
// }

// -------- Component --------
export default function DocumentsLibrary({
  api = "/api/documents",
  initialItems = [],
  isAdmin = false,
}: DocumentsLibraryProps) {
  const [items, setItems] = useState<DocItem[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<DocCategory | "ALL">("ALL");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"RECENT" | "A_Z">("RECENT");

  useEffect(() => {
    if (initialItems.length) return;
    setLoading(true);
    const url = new URL(
      api,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );
    if (q) url.searchParams.set("q", q);
    if (cat !== "ALL") url.searchParams.set("category", cat);
    if (tag) url.searchParams.set("tag", tag);
    if (sort) url.searchParams.set("sort", sort);
    fetch(url.toString())
      .then((r) => r.json())
      .then((data: { items: DocItem[] }) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [api, q, cat, tag, sort, initialItems.length]);

  const tags = useMemo(() => {
    const t = new Set<string>();
    for (const it of items) (it.tags ?? []).forEach((x) => t.add(x));
    return [...t].sort();
  }, [items]);

  const byPinned = useMemo(() => {
    const f = [...items];
    f.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    if (sort === "A_Z") f.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "RECENT")
      f.sort(
        (a, b) => +new Date(b.updatedAt as any) - +new Date(a.updatedAt as any)
      );
    return f;
  }, [items, sort]);

  const featured = byPinned.find((i) => i.pinned) ?? byPinned[0];
  const list = byPinned.filter((i) => i.id !== featured?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(2,6,23,0.06),rgba(37,99,235,0.06)_40%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Bylaws & Documents
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Download official bylaws, policies, forms, and meeting minutes.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
              <FolderOpen className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-600">
                {items.length} files
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-16 md:grid-cols-[1fr_280px]">
        {/* Left: list */}
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white/80 p-3 shadow-sm">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search documents…"
                className="w-full rounded-xl border bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCat("ALL")}
                className={`rounded-xl px-3 py-1.5 text-sm ring-1 ${
                  cat === "ALL"
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white ring-slate-200 hover:bg-slate-50"
                }`}>
                All
              </button>
              {(Object.keys(categoryLabel) as Array<DocCategory>).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-xl px-3 py-1.5 text-sm ring-1 ${
                    cat === c
                      ? "bg-slate-900 text-white ring-slate-900"
                      : "bg-white ring-slate-200 hover:bg-slate-50"
                  }`}>
                  {categoryLabel[c]}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="text-xs text-slate-500">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="rounded-xl border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="RECENT">Most recent</option>
                <option value="A_Z">A → Z</option>
              </select>
              <div className="hidden items-center gap-2 sm:flex text-slate-500">
                <Filter className="h-4 w-4" />
                <span className="text-xs">Filter by category or tag</span>
              </div>
            </div>
          </div>

          {/* Featured */}
          {featured ? (
            <FeaturedDoc item={featured} isAdmin={isAdmin} />
          ) : loading ? (
            <SkeletonFeatured />
          ) : (
            <EmptyState />
          )}

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {loading && !items.length ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              list.map((it) => (
                <DocCard key={it.id} item={it} isAdmin={isAdmin} />
              ))
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
            <h3 className="text-base font-semibold">Tags</h3>
            {tags.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag((cur) => (cur === t ? null : t))}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ring-1 ${
                      tag === t
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white ring-slate-200 hover:bg-slate-50"
                    }`}>
                    <Tag className="h-3 w-3" /> {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No tags yet.</p>
            )}
          </div>

          <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
            <h3 className="text-base font-semibold">About</h3>
            <p className="mt-2 text-sm text-slate-600">
              Central library for official bylaws, policies, forms, guides, and
              meeting minutes.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ---------- Subcomponents ---------- */
function CategoryBadge({ c }: { c: DocCategory }) {
  const Icon =
    c === "BYLAWS"
      ? Scale
      : c === "FORM"
      ? Paperclip
      : c === "MEETING_MINUTES"
      ? Clock
      : FileText;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ring-1 ${badgeCls[c]}`}>
      <Icon className="h-3.5 w-3.5" /> {categoryLabel[c]}
    </span>
  );
}

function FeaturedDoc({ item, isAdmin }: { item: DocItem; isAdmin: boolean }) {
  //   const Icon = getIcon(item.contentType);
  return (
    <article className="relative overflow-hidden rounded-2xl border bg-white/80 p-5 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-900 via-blue-500 to-cyan-500 opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <CategoryBadge c={item.category} />
        {item.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            <Pin className="h-3.5 w-3.5" /> Pinned
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight">
        <Link href={`/documents/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h2>

      {item.description ? (
        <p className="mt-2 text-sm text-slate-700 line-clamp-3">
          {item.description}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {fmtDate(item.updatedAt)}
        </span>
        {item.size ? <span>• {fmtSize(item.size)}</span> : null}
        {isAdmin && item.status !== "PUBLISHED" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 ring-1 ring-rose-200">
            Draft
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={item.fileUrl}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
          <Download className="h-4 w-4" /> Download
        </a>
        <Link
          href={`/documents`}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
          All documents
        </Link>
      </div>
    </article>
  );
}

function DocCard({ item, isAdmin }: { item: DocItem; isAdmin: boolean }) {
  //   const Icon = getIcon(item.contentType);
  return (
    <article className="rounded-2xl border bg-white/80 p-4 shadow-sm transition hover:shadow md:h-full">
      <div className="flex items-start justify-between gap-3">
        <CategoryBadge c={item.category} />
        {item.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
            <Pin className="h-3.5 w-3.5" /> Pinned
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 line-clamp-2 text-base font-semibold tracking-tight">
        <Link href={`/documents/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h3>

      {item.description ? (
        <p className="mt-2 line-clamp-3 text-sm text-slate-700">
          {item.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {fmtDate(item.updatedAt)}
        </span>
        {item.size ? <span>• {fmtSize(item.size)}</span> : null}
        {isAdmin && item.status !== "PUBLISHED" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 ring-1 ring-rose-200">
            Draft
          </span>
        ) : null}
      </div>

      {item.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] ring-1 ring-slate-200">
              <Tag className="h-3 w-3 text-slate-500" /> {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <a
          href={item.fileUrl}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
          <Download className="h-4 w-4" /> Download
        </a>
      </div>
    </article>
  );
}

function SkeletonFeatured() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white/70 p-5 shadow-sm">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded bg-slate-200" />
      <div className="mt-1 h-4 w-5/6 rounded bg-slate-200" />
      <div className="mt-5 h-8 w-32 rounded bg-slate-200" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border bg-white/70 p-4 shadow-sm">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-20 rounded bg-slate-200" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border bg-white/80 p-8 text-center text-slate-600">
      <FolderOpen className="mx-auto h-6 w-6 text-slate-400" />
      <p className="mt-2 text-sm">No documents yet. Check back soon!</p>
    </div>
  );
}
