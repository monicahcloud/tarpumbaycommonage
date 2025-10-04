/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(admin)/admin/events/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminEventsList() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`/api/admin/events?status=${status}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, [status, q]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-2 py-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}>
          <option>ALL</option>
          <option>DRAFT</option>
          <option>PUBLISHED</option>
          <option>ARCHIVED</option>
        </select>
        <Link
          href="/admin/events/new"
          className="ml-auto underline text-blue-600">
          + New Event
        </Link>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Starts</th>
            <th className="p-2 text-left">Ends</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Virtual</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((ev) => (
            <tr key={ev.id} className="border-t">
              <td className="p-2">{ev.title}</td>
              <td className="p-2">{new Date(ev.startsAt).toLocaleString()}</td>
              <td className="p-2">{new Date(ev.endsAt).toLocaleString()}</td>
              <td className="p-2">{ev.status}</td>
              <td className="p-2">{ev.isVirtual ? "✅" : "—"}</td>
              <td className="p-2">
                <Link
                  href={`/admin/events/${ev.id}`}
                  className="text-blue-600 underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="p-4 text-center text-slate-500" colSpan={6}>
                No events.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
