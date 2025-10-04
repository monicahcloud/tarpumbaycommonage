/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Video,
  Clock,
  Download,
  CalendarPlus,
  Filter,
  ArrowRight,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";

// --- Types ---
type EventItem = {
  id: string;
  slug: string;
  title: string;
  descriptionMd?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  startsAt: string; // ISO
  endsAt: string; // ISO
  allDay: boolean;
  isVirtual: boolean;
  location?: string | null;
  zoomJoinUrl?: string | null;
  zoomPasscode?: string | null;
  category?: string | null; // optional extension if you add categories later
};

// --- Helpers ---
function formatRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sameDay = s.toDateString() === e.toDateString();
  const date = s.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const t1 = s.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const t2 = e.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return sameDay
    ? `${date} • ${t1} – ${t2}`
    : `${date} ${t1} → ${e.toLocaleDateString()} ${t2}`;
}

function toGoogleCalendarLink(ev: EventItem) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const start = fmt(new Date(ev.startsAt));
  const end = fmt(new Date(ev.endsAt));
  const text = encodeURIComponent(ev.title);
  const details = encodeURIComponent(
    `${ev.descriptionMd ?? ""}${
      ev.zoomJoinUrl ? `\nJoin: ${ev.zoomJoinUrl}` : ""
    }${ev.zoomPasscode ? `\nPasscode: ${ev.zoomPasscode}` : ""}`
  );
  const location = encodeURIComponent(
    ev.isVirtual ? ev.zoomJoinUrl ?? "Online" : ev.location ?? ""
  );
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

// --- UI Bits ---
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-2 ring-1 ring-border">
        <Icon className="h-5 w-5 text-cyan-600" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: EventItem }) {
  const google = useMemo(() => toGoogleCalendarLink(ev), [ev]);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight">{ev.title}</h3>
          <div className="flex items-center gap-2">
            {ev.isVirtual ? (
              <Badge className="bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200">
                <Video className="h-3.5 w-3.5 mr-1" />
                Zoom
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                In-Person
              </Badge>
            )}
            {ev.category && (
              <Badge className="bg-slate-50 text-slate-700 ring-1 ring-slate-200">
                <Tag className="h-3.5 w-3.5 mr-1" />
                {ev.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>{formatRange(ev.startsAt, ev.endsAt)}</span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-slate-700 whitespace-pre-wrap">
          {ev.descriptionMd || ""}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {ev.isVirtual && ev.zoomJoinUrl && (
            <a
              href={ev.zoomJoinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
              <Video className="h-4 w-4" /> Join Zoom
            </a>
          )}

          <a
            href={`/api/events/${ev.slug}/ics`}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-slate-50">
            <Download className="h-4 w-4" /> .ics
          </a>

          <a
            href={google}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-slate-50">
            <CalendarPlus className="h-4 w-4" /> Add to Google
          </a>

          {!ev.isVirtual && ev.location && (
            <span className="ml-auto inline-flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              {ev.location}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}

// --- Page ---
export default function MembersEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [onlyVirtual, setOnlyVirtual] = useState(false);
  const [onlyThisMonth, setOnlyThisMonth] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        const url = new URL("/api/events/upcoming", window.location.origin);
        if (onlyThisMonth) {
          url.searchParams.set("from", start.toISOString());
          url.searchParams.set("to", end.toISOString());
        }
        const res = await fetch(url.toString(), { signal: controller.signal });
        const json = await res.json();
        setEvents(json.items as EventItem[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [onlyThisMonth]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((ev) => {
      if (onlyVirtual && !ev.isVirtual) return false;
      if (!needle) return true;
      return (
        ev.title.toLowerCase().includes(needle) ||
        (ev.descriptionMd ?? "").toLowerCase().includes(needle) ||
        (ev.location ?? "").toLowerCase().includes(needle)
      );
    });
  }, [events, q, onlyVirtual]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-8">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            <span>Members • Events & Meetings</span>
          </div>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">
            Upcoming Events
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Stay aligned with committee meetings, community gatherings, and
            special sessions. Join on-site or via Zoom.
          </p>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, details, or location…"
                className="pl-9 pr-3 py-2 rounded-xl border bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyVirtual}
                onChange={(e) => setOnlyVirtual(e.target.checked)}
              />
              Virtual only
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyThisMonth}
                onChange={(e) => setOnlyThisMonth(e.target.checked)}
              />
              This month
            </label>
            <Link
              href="#calendar"
              className="ml-auto inline-flex items-center gap-2 text-blue-700 hover:underline">
              Full calendar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
            No events match your filters.
          </div>
        ) : (
          <motion.ul
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </motion.ul>
        )}
      </section>

      {/* Simple Month Snapshot */}
      <section id="calendar" className="border-t bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <SectionHeading
            icon={CalendarDays}
            title="Month at a Glance"
            subtitle="Quick snapshot of what’s ahead."
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((col) => (
              <div
                key={col}
                className="rounded-2xl border p-4 bg-white/70 backdrop-blur">
                <ul className="space-y-3">
                  {events
                    .filter((_, i) => i % 2 === col)
                    .slice(0, 6)
                    .map((ev) => (
                      <li key={ev.id} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-slate-100 p-2">
                          <Clock className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium leading-tight">
                            {ev.title}
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatRange(ev.startsAt, ev.endsAt)}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
