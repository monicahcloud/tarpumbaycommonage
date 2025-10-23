"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Required"),
  dob: z.string().optional(),
  email: z.string().email("Invalid email"),
  address: z.string().min(3, "Required"),
  phone: z.string().optional(),
  ancestry: z.string().optional(),
  agreeRules: z.boolean().refine((v) => v === true, { message: "Required" }),
  signature: z.string().min(2, "Required"),
  signDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CommonerFormClient({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // uploads held in component state; back end can accept them after create
  const [feeReceipt, setFeeReceipt] = useState<File | null>(null);
  const [passport, setPassport] = useState<File | null>(null);
  const [birthCert, setBirthCert] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    getValues,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: userEmail ?? "",
      signDate: new Date().toISOString().slice(0, 10),
      agreeRules: false,
    },
  });

  const watchAll = watch();

  // ---- stepper control ----
  const next = async () => {
    // Validate fields per step before moving on
    const fieldsByStep: Record<number, (keyof FormData)[]> = {
      1: [
        "firstName",
        "middleName",
        "lastName",
        "dob",
        "email",
        "address",
        "phone",
        "ancestry",
      ],
      2: [], // uploads validated below
      3: ["agreeRules", "signature", "signDate"],
    };

    // Special validation for step 2 uploads
    if (step === 2) {
      if (!feeReceipt || !passport || !birthCert) {
        alert(
          "Please upload: fee receipt, passport copy, and birth certificate copy."
        );
        return;
      }
    } else {
      const ok = await trigger(fieldsByStep[step], { shouldFocus: true });
      if (!ok) return;
    }

    if (step < 3) setStep((s) => (s + 1) as typeof step);
    else setStep(4);
  };

  const prev = () => {
    if (step === 1) return;
    if (step === 4) setStep(3);
    else setStep((s) => (s - 1) as typeof step);
  };

  // Gate any accidental submit before step 4
  const onSubmitGate: React.FormEventHandler<HTMLFormElement> = (e) => {
    if (step !== 4) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Prevent Enter (except inside textarea) from submitting early
  const onKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
    if (e.key === "Enter") {
      const tag = (e.target as HTMLElement).tagName;
      if (tag !== "TEXTAREA") e.preventDefault();
    }
  };

  // ---- submit handler ----
  async function onSubmit(v: FormData) {
    if (step !== 4) return; // extra guard

    setSubmitting(true);

    // 1) Create registration (JSON)
    const res = await fetch("/api/commoner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });

    if (!res.ok) {
      setSubmitting(false);
      alert("Failed to submit registration.");
      return;
    }

    // expect { id } back
    const { id } = await res.json().catch(() => ({ id: null }));

    // 2) Upload files (multipart) — adjust endpoint to your API
    if (id && feeReceipt && passport && birthCert) {
      const fd = new FormData();
      fd.append("feeReceipt", feeReceipt);
      fd.append("passport", passport);
      fd.append("birthCert", birthCert);

      const up = await fetch(`/api/commoner/${id}/uploads`, {
        method: "POST",
        body: fd,
      });

      if (!up.ok) {
        // not fatal; registration already created. Let the user know.
        alert(
          "Registration created, but file upload failed. You can upload from the portal."
        );
      }
    }

    setSubmitting(false);
    location.href = "/portal/commoner";
  }

  // Build preview lines
  const fullName = useMemo(
    () =>
      `${getValues("firstName")} ${getValues("middleName") || ""} ${getValues(
        "lastName"
      )}`
        .replace(/\s+/g, " ")
        .trim(),
    [watchAll]
  );

  return (
    <div className="space-y-4 rounded-2xl border bg-white/80 p-5 shadow-sm">
      <Stepper
        step={step}
        labels={["Details", "Uploads", "Rules & Sign", "Preview"]}
      />

      <form
        onSubmitCapture={onSubmitGate}
        onKeyDown={onKeyDown}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6">
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Your Details</h2>

            <Field label="First Name" error={errors.firstName?.message}>
              <input
                className="w-full rounded-xl border px-3 py-2"
                {...register("firstName")}
              />
            </Field>

            <Field label="Middle Name (optional)">
              <input
                className="w-full rounded-xl border px-3 py-2"
                {...register("middleName")}
              />
            </Field>

            <Field label="Last Name" error={errors.lastName?.message}>
              <input
                className="w-full rounded-xl border px-3 py-2"
                {...register("lastName")}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Date of Birth">
                <input
                  type="date"
                  className="w-full rounded-xl border px-3 py-2"
                  {...register("dob")}
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  className="w-full rounded-xl border px-3 py-2"
                  {...register("email")}
                />
              </Field>
            </div>

            <Field label="Mailing Address" error={errors.address?.message}>
              <input
                className="w-full rounded-xl border px-3 py-2"
                {...register("address")}
              />
            </Field>

            <Field label="Phone">
              <input
                className="w-full rounded-xl border px-3 py-2"
                {...register("phone")}
              />
            </Field>

            <Field label="Ancestry (optional)">
              <textarea
                rows={3}
                className="w-full rounded-xl border px-3 py-2"
                {...register("ancestry")}
              />
            </Field>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Required Uploads</h2>
            <p className="text-sm text-slate-600">
              These are required to complete registration.
            </p>

            <Field label="Fee Receipt (PDF or image)">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFeeReceipt(e.target.files?.[0] ?? null)}
              />
            </Field>
            <Field label="Passport Copy (PDF or image)">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
              />
            </Field>
            <Field label="Birth Certificate Copy (PDF or image)">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setBirthCert(e.target.files?.[0] ?? null)}
              />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Rules & Sign</h2>

            <div className="rounded-xl border bg-white p-3 text-sm">
              <p className="mb-2">Please review before signing:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <a
                    className="underline"
                    href="/documents/CommitteRules.pdf"
                    target="_blank"
                    rel="noreferrer">
                    Commonage Committee Rules
                  </a>
                </li>
                <li>
                  <a
                    className="underline"
                    href="/documents/commonageAct.pdf"
                    target="_blank"
                    rel="noreferrer">
                    Commonage Act
                  </a>
                </li>
              </ul>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" {...register("agreeRules")} />
              <span>I have received and agree to the Commonage rules.</span>
            </label>
            {errors.agreeRules?.message && (
              <p className="text-xs text-rose-600">
                {errors.agreeRules.message}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Type your name as signature"
                error={errors.signature?.message}>
                <input
                  className="w-full rounded-xl border px-3 py-2"
                  {...register("signature")}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className="w-full rounded-xl border px-3 py-2"
                  {...register("signDate")}
                />
              </Field>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="space-y-2 rounded-2xl border bg-white p-4 text-sm">
              <Row label="Name" value={fullName} />
              <Row label="Email" value={getValues("email")} />
              <Row label="DOB" value={getValues("dob") || "—"} />
              <Row label="Address" value={getValues("address")} />
              <Row label="Phone" value={getValues("phone") || "—"} />
              <Row label="Ancestry" value={getValues("ancestry") || "—"} />
              <hr className="my-2" />
              <Row
                label="Signature"
                value={`${getValues("signature")} (${
                  getValues("signDate") || "—"
                })`}
              />
              <hr className="my-2" />
              <Row label="Fee Receipt" value={feeReceipt?.name || "—"} />
              <Row label="Passport" value={passport?.name || "—"} />
              <Row label="Birth Certificate" value={birthCert?.name || "—"} />
            </div>
            <p className="text-xs text-slate-600">
              Please review carefully. Submitting will save your registration
              and upload your documents.
            </p>
          </section>
        )}

        {/* nav buttons */}
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ------- tiny helpers ------- */
function Stepper({ step, labels }: { step: 1 | 2 | 3 | 4; labels: string[] }) {
  const pct = ((step - 1) / (labels.length - 1)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
        {labels.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3 | 4;
          return (
            <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${
                  n <= step
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white"
                }`}>
                {n}
              </span>
              <span
                className={`truncate ${
                  n <= step ? "font-medium" : "text-slate-500"
                }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="flex gap-2">
      <span className="min-w-44 font-medium">{label}:</span>
      <span className="flex-1">{value || "—"}</span>
    </p>
  );
}
