// app/(admin)/admin/events/new/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEventPage() {
  const r = useRouter();
  const [form, setForm] = useState({
    title: "",
    descriptionMd: "",
    status: "DRAFT",
    startsAt: "",
    endsAt: "",
    allDay: false,
    location: "",
    isVirtual: false,
    zoomJoinUrl: "",
    zoomPasscode: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setSaving(true);
    setErr(null);
    const body = {
      ...form,
      location: form.location || undefined,
      zoomJoinUrl: form.zoomJoinUrl || undefined,
      zoomPasscode: form.zoomPasscode || undefined,
    };
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setErr(json?.error ?? "Save failed");
      setSaving(false);
      return;
    }
    r.push(`/admin/events/${json.item.id}`);
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">New Event</h1>
      {err && (
        <div className="bg-rose-50 text-rose-700 border border-rose-200 p-2 rounded">
          {String(err)}
        </div>
      )}

      <label className="text-sm font-medium">Title</label>
      <input
        className="border rounded px-2 py-1 w-full"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
      />

      <label className="text-sm font-medium">Description (Markdown)</label>
      <textarea
        className="border rounded p-2 w-full min-h-[160px]"
        value={form.descriptionMd}
        onChange={(e) => set("descriptionMd", e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Starts</label>
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={form.startsAt}
            onChange={(e) => set("startsAt", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ends</label>
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={form.endsAt}
            onChange={(e) => set("endsAt", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.allDay}
            onChange={(e) => set("allDay", e.target.checked)}
          />{" "}
          All day
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVirtual}
            onChange={(e) => set("isVirtual", e.target.checked)}
          />{" "}
          Virtual (Zoom)
        </label>
      </div>

      {!form.isVirtual && (
        <>
          <label className="text-sm font-medium">Location</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </>
      )}

      {form.isVirtual && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Zoom Join URL</label>
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="https://zoom.us/j/..."
              value={form.zoomJoinUrl}
              onChange={(e) => set("zoomJoinUrl", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Zoom Passcode (optional)
            </label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={form.zoomPasscode}
              onChange={(e) => set("zoomPasscode", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.status}
            onChange={(e) => set("status", e.target.value as any)}>
            <option>DRAFT</option>
            <option>PUBLISHED</option>
            <option>ARCHIVED</option>
          </select>
        </div>
      </div>

      <button
        disabled={saving}
        onClick={save}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {saving ? "Saving…" : "Create Event"}
      </button>
    </div>
  );
}
