/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  lotType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  purpose: z.string().min(3, "Tell us your intended use"),
  agree18Months: z.literal(true, {
    message: "You must agree to begin within 18 months.",
  }),
  acknowledgeReissue: z.literal(true, {
    message: "You must acknowledge the re-issue policy.",
  }),
  // uploads (optional at submit, can be enforced later)
  drawings: z.instanceof(File).optional(),
  businessPlan: z.instanceof(File).optional(),
  signature: z.string().min(2, "Type your name as signature"),
  signDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LandApplyClient() {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lotType: "RESIDENTIAL",
      signDate: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(v: FormData) {
    setSubmitting(true);
    // 1) Create application with minimal fields
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        purpose: v.purpose,
        signature: v.signature,
        signDate: v.signDate,
      }),
    });
    if (!res.ok) {
      setSubmitting(false);
      const t = await res.text();
      alert(`Failed to create application. ${t}`);
      return;
    }
    const { id } = await res.json();

    // 2) Upload files if provided
    const pairs: Array<[keyof FormData, "DRAWINGS" | "OTHER"]> = [
      ["drawings", "DRAWINGS"],
      ["businessPlan", "OTHER"],
    ];
    for (const [field, kind] of pairs) {
      const file = (v as any)[field] as File | undefined;
      if (!file) continue;
      const fd = new FormData();
      fd.set("applicationId", id);
      fd.set("kind", kind);
      fd.set("file", file);
      const up = await fetch("/api/application/upload", {
        method: "POST",
        body: fd,
      });
      if (!up.ok) {
        setSubmitting(false);
        const t = await up.text();
        alert(`Upload failed for ${String(field)}. ${t}`);
        return;
      }
    }

    location.href = "/portal/application";
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border bg-white/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Apply for Land</h2>

      <div>
        <label className="mb-1 block text-sm font-medium">Lot Type</label>
        <div className="flex items-center gap-4 text-sm">
          {(["RESIDENTIAL", "COMMERCIAL"] as const).map((t) => (
            <label key={t} className="inline-flex items-center gap-2">
              <input type="radio" value={t} {...register("lotType")} /> {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Intended Use</label>
        <textarea
          className="w-full rounded-xl border px-3 py-2"
          rows={4}
          {...register("purpose")}
        />
        {errors.purpose?.message && (
          <p className="mt-1 text-xs text-rose-600">{errors.purpose.message}</p>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-3 text-sm">
        <p className="mb-2">Confirm before signing:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Begin building/lot prep within 18 months.</li>
          <li>Undeveloped lots after 18 months may be reissued.</li>
        </ul>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" {...register("agree18Months")} />
        <span>I agree to commence within 18 months.</span>
      </label>
      {errors.agree18Months?.message && (
        <p className="text-xs text-rose-600">{errors.agree18Months.message}</p>
      )}

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" {...register("acknowledgeReissue")} />
        <span>I acknowledge the re-issue policy.</span>
      </label>
      {errors.acknowledgeReissue?.message && (
        <p className="text-xs text-rose-600">
          {errors.acknowledgeReissue.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Preliminary Drawings (optional)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setValue("drawings", e.target.files?.[0])}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Business Plan (for commercial)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setValue("businessPlan", e.target.files?.[0])}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Signature</label>
          <input
            className="w-full rounded-xl border px-3 py-2"
            {...register("signature")}
          />
          {errors.signature?.message && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.signature.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            className="w-full rounded-xl border px-3 py-2"
            {...register("signDate")}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
