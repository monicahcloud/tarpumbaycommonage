// components/NewsAnnouncements.tsx — Beautiful member-facing News & Announcements UI
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Megaphone,
  Search,
  Tag,
  Clock,
  Filter,
  Pin,
  Sparkles,
} from "lucide-react";

// -------- Types --------
export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  bodyMd?: string | null;
  category: "ANNOUNCEMENT" | "UPDATE" | "EVENT" | "GENERAL";
  tags?: string[] | null;
  coverImageUrl?: string | null;
  publishedAt: string | Date;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  pinned?: boolean | null;
  author?: string | null;
};

export type NewsAnnouncementsProps = {
  api?: string; // e.g. "/api/news" — expects { items: NewsItem[] }
  initialItems?: NewsItem[];
  isAdmin?: boolean; // optional — show tiny admin badges
};

// -------- Helpers --------
const fmtDate = (d: string | Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    typeof d === "string" ? new Date(d) : d
  );

const categoryLabel: Record<NewsItem["category"], string> = {
  ANNOUNCEMENT: "Announcements",
  UPDATE: "Updates",
  EVENT: "Events",
  GENERAL: "General",
};

const badgeCls: Record<NewsItem["category"], string> = {
  ANNOUNCEMENT: "bg-blue-50 text-blue-700 ring-blue-200",
  UPDATE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  EVENT: "bg-violet-50 text-violet-700 ring-violet-200",
  GENERAL: "bg-slate-100 text-slate-700 ring-slate-200",
};

// -------- Component --------
export default function NewsAnnouncements({
  api = "/api/news",
  initialItems = [],
  isAdmin = false,
}: NewsAnnouncementsProps) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<NewsItem["category"] | "ALL">("ALL");
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    if (initialItems.length) return; // already provided
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
    fetch(url.toString())
      .then((r) => r.json())
      .then((data: { items: NewsItem[] }) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [api, q, cat, tag, initialItems.length]);

  const tags = useMemo(() => {
    const t = new Set<string>();
    for (const it of items) (it.tags ?? []).forEach((x) => t.add(x));
    return [...t].sort();
  }, [items]);

  const featured = useMemo(
    () => items.find((i) => i.pinned) ?? items[0],
    [items]
  );
  const list = useMemo(
    () => items.filter((i) => i.id !== featured?.id),
    [items, featured?.id]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),rgba(124,58,237,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                News & Announcements
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Stay up to date on community updates, events, and important
                announcements.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
              <Megaphone className="h-4 w-4 text-slate-500" />
              <span className="text-xs text-slate-600">
                {items.length} posts
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
                placeholder="Search news…"
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
              {(Object.keys(categoryLabel) as Array<NewsItem["category"]>).map(
                (c) => (
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
                )
              )}
            </div>

            <div className="ml-auto hidden items-center gap-2 sm:flex text-slate-500">
              <Filter className="h-4 w-4" />
              <span className="text-xs">Filter by category or tag</span>
            </div>
          </div>

          {/* Featured */}
          {featured ? (
            <FeaturedCard item={featured} isAdmin={isAdmin} />
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
                <NewsCard key={it.id} item={it} isAdmin={isAdmin} />
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
              Official updates and announcements from Tarpum Bay Commonage. For
              urgent notices, check your email.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ---------- Subcomponents ---------- */
function CategoryBadge({ c }: { c: NewsItem["category"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ring-1 ${badgeCls[c]}`}>
      {c === "ANNOUNCEMENT" && <Megaphone className="h-3.5 w-3.5" />}
      {c === "EVENT" && <CalendarDays className="h-3.5 w-3.5" />}
      {categoryLabel[c]}
    </span>
  );
}

function FeaturedCard({ item, isAdmin }: { item: NewsItem; isAdmin: boolean }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border bg-white/80 p-5 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <CategoryBadge c={item.category} />
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">
          <Pin className="h-3.5 w-3.5" /> Pinned
        </span>
      </div>

      <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight">
        <Link href={`/news/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h2>

      {item.summary ? (
        <p className="mt-2 text-sm text-slate-700 line-clamp-3">
          {item.summary}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {fmtDate(item.publishedAt)}
        </span>
        {item.author ? <span>• By {item.author}</span> : null}
        {isAdmin && item.status !== "PUBLISHED" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 ring-1 ring-rose-200">
            Draft
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/news/${item.slug}`}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
          Read more <Sparkles className="h-4 w-4" />
        </Link>
        <Link
          href={`/news`}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50">
          All posts
        </Link>
      </div>
    </article>
  );
}

function NewsCard({ item, isAdmin }: { item: NewsItem; isAdmin: boolean }) {
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
        <Link href={`/news/${item.slug}`} className="hover:underline">
          {item.title}
        </Link>
      </h3>

      {item.summary ? (
        <p className="mt-2 line-clamp-3 text-sm text-slate-700">
          {item.summary}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {fmtDate(item.publishedAt)}
        </span>
        {item.author ? <span>• By {item.author}</span> : null}
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
        <Link
          href={`/news/${item.slug}`}
          className="text-sm text-blue-700 hover:underline">
          Read more
        </Link>
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
      <Megaphone className="mx-auto h-6 w-6 text-slate-400" />
      <p className="mt-2 text-sm">No posts yet. Check back soon!</p>
    </div>
  );
}
