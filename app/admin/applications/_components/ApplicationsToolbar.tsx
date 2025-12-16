// app/admin/applications/_components/ApplicationsToolbar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const STATUSES = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export default function ApplicationsToolbar() {
  const router = useRouter();
  const sp = useSearchParams();

  const initialQ = sp.get("q") ?? "";
  const initialStatus = sp.get("status") ?? "ALL";

  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);

  const urlParams = useMemo(() => new URLSearchParams(sp.toString()), [sp]);

  function apply() {
    const next = new URLSearchParams(urlParams);

    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");

    if (status && status !== "ALL") next.set("status", status);
    else next.delete("status");

    next.delete("page"); // reset pagination on filter change
    router.push(`/admin/applications?${next.toString()}`);
  }

  function clear() {
    router.push("/admin/applications");
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-700">Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, purpose…"
          className="h-10 w-64 rounded-xl border px-3 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-xl border bg-white px-3 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={apply}
        className="h-10 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-700">
        Apply
      </button>

      <button
        onClick={clear}
        className="h-10 rounded-xl border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Clear
      </button>
    </div>
  );
}
