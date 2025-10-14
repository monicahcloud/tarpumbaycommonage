// app/(admin)/admin/documents/page.tsx
"use client";

import { useState } from "react";
import type { DocStatus, DocCategory } from "@prisma/client";

export default function AdminDocumentsPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocCategory>("OTHER");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState<DocStatus>("PUBLISHED");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Choose a file");
    setBusy(true);

    const form = new FormData();
    form.set("title", title);
    form.set("slug", slug || title);
    form.set("description", description);
    form.set("category", category);
    form.set("tags", tags);
    form.set("pinned", String(pinned));
    form.set("status", status);
    form.set("file", file);

    const res = await fetch("/api/admin/documents", {
      method: "POST",
      body: form,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Failed: ${data.error || res.status}`);
      return;
    }
    alert("Saved!");
    setTitle("");
    setSlug("");
    setDescription("");
    setTags("");
    setFile(null);
    setPinned(false);
    setStatus("PUBLISHED");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Documents — Admin Upload</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug (optional)</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded border p-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            className="mt-1 w-full rounded border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value as DocCategory)}>
            <option>BYLAWS</option>
            <option>POLICY</option>
            <option>FORM</option>
            <option>MEETING_MINUTES</option>
            <option>GUIDE</option>
            <option>OTHER</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">
            Tags (comma-separated)
          </label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="fees,members,2025"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">File</label>
          <input
            type="file"
            className="mt-1 w-full rounded border p-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
            />
            <span>Pin to top</span>
          </label>
          <label className="text-sm">
            Status:
            <select
              className="ml-2 rounded border p-1"
              value={status}
              onChange={(e) => setStatus(e.target.value as DocStatus)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
        </div>
        <button
          disabled={busy}
          className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60">
          {busy ? "Uploading..." : "Save"}
        </button>
      </form>
    </main>
  );
}
