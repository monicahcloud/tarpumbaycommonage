"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

/* -------------------- validation -------------------- */
const schema = z.object({
  // Step 1 — Applicant
  firstName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Required"),
  dob: z.string().optional(),
  email: z.string().email("Invalid email"),
  address: z.string().min(3, "Required"),
  phone: z.string().optional(),

  // Step 2 — Heritage (all optional)
  parentName: z.string().optional(),
  parentBirthdate: z.string().optional(),
  grandparentName: z.string().optional(),
  grandparentBirthdate: z.string().optional(),
  greatGrandparentName: z.string().optional(),
  greatGrandparentBirthdate: z.string().optional(),

  // Step 3 — Consent
  agreeRules: z.boolean().refine((v) => v === true, { message: "Required" }),
  signature: z.string().min(2, "Type your name as signature"),
  signDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

/* -------------------- component -------------------- */
export default function CommonerRegisterClient({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

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

  // Build ancestry preview string for server + UI
  const ancestry = useMemo(() => {
    const v = watchAll;
    return [
      v.parentName && `Parent: ${v.parentName} (${v.parentBirthdate || "—"})`,
      v.grandparentName &&
        `Grandparent: ${v.grandparentName} (${v.grandparentBirthdate || "—"})`,
      v.greatGrandparentName &&
        `Great-Grandparent: ${v.greatGrandparentName} (${
          v.greatGrandparentBirthdate || "—"
        })`,
    ]
      .filter(Boolean)
      .join(" | ");
  }, [watchAll]);

  /* -------- stepper navigation (with per-step validation) -------- */
  const next = async () => {
    const fieldsByStep: Record<number, (keyof FormData)[]> = {
      1: [
        "firstName",
        "middleName",
        "lastName",
        "dob",
        "email",
        "address",
        "phone",
      ],
      2: [
        "parentName",
        "parentBirthdate",
        "grandparentName",
        "grandparentBirthdate",
        "greatGrandparentName",
        "greatGrandparentBirthdate",
      ],
      3: ["agreeRules", "signature", "signDate"],
      4: [],
    };
    const ok = await trigger(fieldsByStep[step], { shouldFocus: true });
    if (!ok) return;
    if (step < 4) setStep((s) => (s + 1) as typeof step);
  };

  const prev = () => {
    if (step === 1) return;
    setStep((s) => (s - 1) as typeof step);
  };

  /* ---------- hard gate: never submit unless on step 4 ---------- */
  // const onSubmitGate: React.FormEventHandler<HTMLFormElement> = (e) => {
  //   if (step !== 4) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  // };

  /* ---------- block Enter key from accidentally submitting ---------- */
  // const onKeyDown: React.KeyboardEventHandler<HTMLFormElement> = (e) => {
  //   if (e.key === "Enter") {
  //     const tag = (e.target as HTMLElement).tagName;
  //     if (tag !== "TEXTAREA") e.preventDefault();
  //   }
  // };

  /* -------------------- submit -------------------- */
  async function onSubmit(v: FormData) {
    if (step !== 4) return; // extra guard

    setSubmitting(true);

    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone || undefined,
      dob: v.dob || undefined,
      address: v.address,
      ancestry: ancestry || undefined,
      agreeRules: v.agreeRules,
      signature: v.signature,
      signDate: v.signDate || undefined,
    };

    const res = await fetch("/api/commoner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      alert(`Registration failed (${res.status}). ${text}`);
      return;
    }

    // after successful create, go straight to uploads page for commoner docs
    // (adjust this path if your uploads page lives elsewhere)
    location.href = "/portal/commoner/uploads";
  }

  /* -------------------- UI -------------------- */
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Register as a Commoner
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Read the rules, sign, and submit. You’ll upload documents on the
            next page.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-[3fr_2fr]">
        {/* main card */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
          <Stepper
            step={step}
            labels={["Applicant Info", "Heritage", "Consent", "Preview"]}
          />

          {/* <form
            onSubmitCapture={onSubmitGate}
            onKeyDown={onKeyDown}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-6"> */}
          <form
            // BLOCK native submit always
            onSubmit={(e) => e.preventDefault()}
            // also keep Enter from submitting
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const tag = (e.target as HTMLElement).tagName;
                if (tag !== "TEXTAREA") e.preventDefault();
              }
            }}
            className="mt-6 space-y-6"
            noValidate>
            {/* Step 1 */}
            {step === 1 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<User className="h-4 w-4" />}
                  title="Applicant Information"
                />
                <div className="grid gap-4 md:grid-cols-3">
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
                  <Field label="Surname" error={errors.lastName?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("lastName")}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Date of Birth">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("dob")}
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        className="w-full rounded-xl border px-9 py-2"
                        {...register("email")}
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Mailing Address" error={errors.address?.message}>
                  <input
                    className="w-full rounded-xl border px-3 py-2"
                    {...register("address")}
                  />
                </Field>

                <Field label="Phone">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      className="w-full rounded-xl border px-9 py-2"
                      {...register("phone")}
                    />
                  </div>
                </Field>
              </section>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Ancestors with Tarpum Bay Heritage"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Parent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("parentName")}
                    />
                  </Field>
                  <Field label="Parent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("parentBirthdate")}
                    />
                  </Field>

                  <Field label="Grandparent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("grandparentName")}
                    />
                  </Field>
                  <Field label="Grandparent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("grandparentBirthdate")}
                    />
                  </Field>

                  <Field label="Great-Grandparent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("greatGrandparentName")}
                    />
                  </Field>
                  <Field label="Great-Grandparent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("greatGrandparentBirthdate")}
                    />
                  </Field>
                </div>
              </section>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<Check className="h-4 w-4" />}
                  title="Read Rules & Sign"
                />

                <div className="rounded-2xl border bg-white p-3 text-sm">
                  <p className="mb-2">Please review before signing:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <a
                        className="underline"
                        href="/documents/CommitteRules.pdf"
                        target="_blank"
                        rel="noreferrer">
                        Commonage Committee Rules (PDF)
                      </a>
                    </li>
                    <li>
                      <a
                        className="underline"
                        href="/documents/commonageAct.pdf"
                        target="_blank"
                        rel="noreferrer">
                        Commonage Act (PDF)
                      </a>
                    </li>
                  </ul>
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" {...register("agreeRules")} />
                  <span>I have read and agree to the Rules and the Act.</span>
                </label>
                {errors.agreeRules?.message ? (
                  <p className="text-xs text-rose-600">
                    {errors.agreeRules.message}
                  </p>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Type your name as signature"
                    error={errors.signature?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      {...register("signature")}
                      placeholder="Your full name"
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

            {/* Step 4 */}
            {step === 4 && (
              <section className="space-y-4">
                <SectionTitle title="Preview" />
                <div className="space-y-2 rounded-2xl border bg-white p-4 text-sm">
                  <Row label="Name" value={fullName} />
                  <Row label="Email" value={getValues("email")} />
                  <Row label="DOB" value={getValues("dob") || "—"} />
                  <Row label="Address" value={getValues("address")} />
                  <Row label="Phone" value={getValues("phone") || "—"} />
                  <hr className="my-2" />
                  <Row label="Ancestry" value={ancestry || "—"} />
                  <hr className="my-2" />
                  <Row
                    label="Signature"
                    value={`${getValues("signature")} (${
                      getValues("signDate") || "—"
                    })`}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Submitting will create your Commoner registration. You’ll
                  upload supporting documents on the next page.
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
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  // IMPORTANT: not a submit button; we call RHF manually
                  type="button"
                  onClick={() => handleSubmit(onSubmit)()}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* aside */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">
              Documents Required (next page)
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Passport (photo page)</li>
              <li>Birth Certificate</li>
              <li>Proof of Lineage</li>
              <li>Proof of Address</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">Fees</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>
                Commoner Registration: <strong>$25 (non-refundable)</strong>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
            <h3 className="text-base font-semibold">Rules</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>
                <a
                  className="underline"
                  href="/documents/CommitteRules.pdf"
                  target="_blank"
                  rel="noreferrer">
                  Committee Rules (PDF)
                </a>
              </li>
              <li>
                <a
                  className="underline"
                  href="/documents/commonageAct.pdf"
                  target="_blank"
                  rel="noreferrer">
                  Commonage Act (PDF)
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------- small UI helpers -------------------- */
function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon ? (
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 p-2 ring-1 ring-border">
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-semibold">{title}</h2>
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
