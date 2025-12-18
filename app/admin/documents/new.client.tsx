"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useTransition } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "BYLAWS",
  "POLICY",
  "FORM",
  "MEETING_MINUTES",
  "GUIDE",
  "OTHER",
] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export default function NewDocumentForm() {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("BYLAWS");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("PUBLISHED");
  const [pinned, setPinned] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    if (!file) return toast.error("Pick a file");

    const t = toast.loading("Uploading…");

    try {
      // 1) upload to blob
      const up = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: fd,
      });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson?.error ?? "Upload failed");

      // 2) create document row
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          category,
          status,
          pinned,
          tags: tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),

          fileUrl: upJson.url,
          contentType: upJson.contentType ?? null,
          ...(typeof upJson.size === "number" ? { size: upJson.size } : {}),
          blobPath: upJson.pathname ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(
          json?.error ? JSON.stringify(json.error) : "Create failed"
        );

      toast.success("Published", { id: t });
      startTransition(() => window.location.reload());
    } catch (err: any) {
      toast.error("Failed", { id: t, description: err?.message ?? "Error" });
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">Title</label>
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">Slug</label>
          <input
            className="h-10 rounded-xl border px-3 text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. bylaws-2025"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">Category</label>
          <select
            className="h-10 rounded-xl border bg-white px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">Status</label>
          <select
            className="h-10 rounded-xl border bg-white px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          <span className="text-sm">Pinned</span>
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-slate-700">
          Description
        </label>
        <textarea
          className="min-h-[80px] rounded-xl border p-3 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-slate-700">
          Tags (comma-separated)
        </label>
        <input
          className="h-10 rounded-xl border px-3 text-sm"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="minutes, 2025, committee"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium text-slate-700">File</label>
        <input name="file" type="file" required className="text-sm" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Working…" : "Upload & Save"}
      </button>
    </form>
  );
}
