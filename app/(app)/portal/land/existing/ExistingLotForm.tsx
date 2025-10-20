// app/portal/land/existing/ExistingLotForm.tsx
"use client";
import { useState } from "react";

export default function ExistingLotForm({
  applicationId,
  lotNumber,
}: {
  applicationId: string;
  lotNumber: string;
}) {
  const [lot, setLot] = useState(lotNumber);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lotNumber: lot,
        alreadyHasLand: true,
        // (optional) purpose: "Existing land holder confirmation",
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const text = await res.text();
      return alert(`Save failed: ${res.status} ${text}`);
    }
    // success — go to the unified application shell
    location.href = "/portal/application";
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white/80 p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Add Your Existing Lot</h1>
      <p className="mt-2 text-sm text-slate-600">
        Provide your assigned lot number and any supporting uploads on the next
        page.
      </p>

      <label className="mt-6 block text-sm font-medium">Lot Number</label>
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2"
        value={lot}
        onChange={(e) => setLot(e.target.value)}
        placeholder="e.g., #42"
      />

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
