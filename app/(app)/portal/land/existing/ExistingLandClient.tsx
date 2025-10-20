/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";

type Props = { existingLotNumber?: string | null; notes?: string | null };

export default function ExistingLandClient({
  existingLotNumber,
  notes,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      existingLotNumber: existingLotNumber || "",
      existingPropertyNotes: notes || "",
      hasExistingProperty: true,
    },
  });

  async function onSubmit(v: any) {
    setSubmitting(true);
    const res = await fetch("/api/commoner/existing-land", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setSubmitting(false);
    if (!res.ok) return alert("Failed to save.");
    location.href = "/portal/commoner";
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border bg-white/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">I already have land</h2>
      <div>
        <label className="mb-1 block text-sm font-medium">Lot Number</label>
        <input
          className="w-full rounded-xl border px-3 py-2"
          {...register("existingLotNumber")}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          className="w-full rounded-xl border px-3 py-2"
          rows={3}
          {...register("existingPropertyNotes")}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("hasExistingProperty")} /> I confirm
        I already own a lot.
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
        {submitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
