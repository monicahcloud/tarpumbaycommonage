// components/ApplyFormClient.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { UseFormRegister, FieldPath } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileDown,
  Home,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

// -------------------- Validation --------------------
const schema = z.object({
  // Step 1 — Applicant
  firstName: z.string().min(1, "Required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Required"),
  dob: z.string().optional(), // YYYY-MM-DD
  email: z.string().email("Invalid email"),

  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().optional(),

  phone: z.string().min(3, "Enter a phone"),
  phoneType: z.enum(["home", "cell", "work"]),

  // Step 2 — Heritage & Purpose
  parentName: z.string().optional(),
  parentBirthdate: z.string().optional(),
  grandparentName: z.string().optional(),
  grandparentBirthdate: z.string().optional(),
  greatGrandparentName: z.string().optional(),
  greatGrandparentBirthdate: z.string().optional(),
  purpose: z.string().min(3, "Tell us your intended use"),

  // Step 3 — Consents
  agreeRules: z.literal(true, {
    message: "You must confirm you read and agree to the rules.",
  }),
  agree18Months: z.literal(true, {
    message: "You must agree to begin work within 18 months.",
  }),
  acknowledgeReissue: z.literal(true, {
    message: "You must acknowledge the re-issue policy.",
  }),

  signature: z.string().min(2, "Type your name as signature"),
  signDate: z.string().optional(),
});

export type ApplyFormData = z.infer<typeof schema>;

// -------------------- Component --------------------
export default function ApplyFormClient() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Preview
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    getValues,
    watch,
  } = useForm<ApplyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneType: "cell",
      signDate: new Date().toISOString().slice(0, 10),
    },
  });

  // live values for preview
  const watchAll = watch();

  // Build ancestry combined field for API + PDF
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

  // ------------- Step navigation -------------
  const next = async () => {
    const fieldsByStep: Record<number, (keyof ApplyFormData)[]> = {
      1: [
        "firstName",
        "middleName",
        "lastName",
        "dob",
        "email",
        "addressLine1",
        "addressLine2",
        "phone",
        "phoneType",
      ],
      2: [
        "parentName",
        "parentBirthdate",
        "grandparentName",
        "grandparentBirthdate",
        "greatGrandparentName",
        "greatGrandparentBirthdate",
        "purpose",
      ],
      3: [
        "agreeRules",
        "agree18Months",
        "acknowledgeReissue",
        "signature",
        "signDate",
      ],
    };
    const ok = await trigger(fieldsByStep[step], { shouldFocus: true });
    if (!ok) return;
    if (step < 3) setStep((s) => (s + 1) as typeof step);
    else setStep(4);
  };

  const prev = () => {
    if (step === 1) return;
    if (step === 4) setStep(3);
    else setStep((s) => (s - 1) as typeof step);
  };

  // ------------- Submit -------------
  async function onSubmit(data: ApplyFormData) {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: `${data.phone} (${data.phoneType})`,
      dob: data.dob || undefined,
      address: `${data.addressLine1}${
        data.addressLine2 ? `, ${data.addressLine2}` : ""
      }`,
      ancestry: ancestry || undefined,
      purpose: data.purpose,
      signature: data.signature,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`Submission failed. (${res.status}). ${text}`);
      return;
    }
    const { id } = await res.json();
    setApplicationId(id);
  }

  // ------------- Success -------------
  if (applicationId) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-[3fr_2fr]">
          <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />
            <h1 className="text-2xl font-bold tracking-tight">
              Application Submitted
            </h1>
            <p className="mt-2 text-slate-600">
              Thank you for your submission. Your application ID is:
            </p>
            <p className="mt-1 font-mono text-sm">{applicationId}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                href={`/api/applications/${applicationId}/pdf`}>
                <FileDown className="h-4 w-4" /> Download PDF
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50">
                <Home className="h-4 w-4" /> Go Home
              </Link>
            </div>
          </div>
          <AsidePanel />
        </div>
      </div>
    );
  }

  // ------------- Form -------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.08),rgba(6,182,212,0.08)_40%,transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Apply for Land
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Please complete all steps. You can review everything before
            submitting.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-[3fr_2fr]">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-70" />

          {/* Stepper */}
          <Stepper step={step} />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {step === 1 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<User className="h-4 w-4" />}
                  title="Applicant Information"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="First Name" error={errors.firstName?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("firstName")}
                    />
                  </Field>
                  <Field
                    label="Middle Name (optional)"
                    error={errors.middleName?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("middleName")}
                    />
                  </Field>
                  <Field label="Surname" error={errors.lastName?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("lastName")}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Date of Birth">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("dob")}
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        className="w-full rounded-xl border px-9 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        {...register("email")}
                      />
                    </div>
                  </Field>
                </div>

                {/* Mailing Address — two lines */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Mailing Address (Line 1)"
                    error={errors.addressLine1?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("addressLine1")}
                    />
                  </Field>
                  <Field label="Mailing Address (Line 2)">
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("addressLine2")}
                    />
                  </Field>
                </div>

                {/* Phone with type selector */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Phone Number" error={errors.phone?.message}>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        className="w-full rounded-xl border px-9 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        {...register("phone")}
                      />
                    </div>
                  </Field>
                  <Field label="Phone Type">
                    <div className="flex items-center gap-4">
                      {(["home", "cell", "work"] as const).map((pt) => (
                        <label
                          key={pt}
                          className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            value={pt}
                            {...register("phoneType")}
                          />
                          {pt[0].toUpperCase() + pt.slice(1)}
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Ancestors with Tarpum Bay Heritage"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Parent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("parentName")}
                    />
                  </Field>
                  <Field label="Parent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("parentBirthdate")}
                    />
                  </Field>
                  <Field label="Grandparent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("grandparentName")}
                    />
                  </Field>
                  <Field label="Grandparent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("grandparentBirthdate")}
                    />
                  </Field>
                  <Field label="Great-Grandparent Name">
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("greatGrandparentName")}
                    />
                  </Field>
                  <Field label="Great-Grandparent Birthdate">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("greatGrandparentBirthdate")}
                    />
                  </Field>
                </div>

                <SectionTitle title="Purpose for Land" />
                <Field
                  label="Describe your intended use"
                  error={errors.purpose?.message}>
                  <textarea
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    {...register("purpose")}
                  />
                </Field>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <SectionTitle
                  icon={<Check className="h-4 w-4" />}
                  title="Consent & Sign"
                />

                <div className="space-y-2 rounded-2xl border bg-white p-3 text-sm">
                  <ConsentItem
                    id="agreeRules"
                    register={register}
                    label={
                      <>
                        I have received and read the rules that set out the
                        management, development, and uses of Tarpum Bay
                        Commonage land and agree to abide by them.
                      </>
                    }
                    error={errors.agreeRules?.message}
                  />

                  <ConsentItem
                    id="agree18Months"
                    register={register}
                    label={
                      <>
                        I agree to commence building/lot clearing/preparation
                        within the next eighteen (18) months.
                      </>
                    }
                    error={errors.agree18Months?.message}
                  />

                  <ConsentItem
                    id="acknowledgeReissue"
                    register={register}
                    label={
                      <>
                        I understand that if my lot remains undeveloped and not
                        maintained after eighteen (18) months, it will be
                        returned to the pool and reissued when I confirm I’m
                        prepared to proceed.
                      </>
                    }
                    error={errors.acknowledgeReissue?.message}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Type your name as signature"
                    error={errors.signature?.message}>
                    <input
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("signature")}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Date">
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      {...register("signDate")}
                    />
                  </Field>
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-4">
                <SectionTitle title="Preview" />
                <div className="space-y-2 rounded-2xl border bg-white p-4 text-sm">
                  <Row
                    label="Name"
                    value={`${getValues("firstName")} ${
                      getValues("middleName") || ""
                    } ${getValues("lastName")}`
                      .replace(/\s+/g, " ")
                      .trim()}
                  />
                  <Row label="Email" value={getValues("email")} />
                  <Row label="DOB" value={getValues("dob") || "—"} />
                  <Row
                    label="Address"
                    value={`${getValues("addressLine1")}${
                      getValues("addressLine2")
                        ? `, ${getValues("addressLine2")}`
                        : ""
                    }`}
                  />
                  <Row
                    label="Phone"
                    value={`${getValues("phone")} (${getValues("phoneType")})`}
                  />
                  <hr className="my-2" />
                  <Row
                    label="Parent"
                    value={`${getValues("parentName") || "—"} (${
                      getValues("parentBirthdate") || "—"
                    })`}
                  />
                  <Row
                    label="Grandparent"
                    value={`${getValues("grandparentName") || "—"} (${
                      getValues("grandparentBirthdate") || "—"
                    })`}
                  />
                  <Row
                    label="Great-Grandparent"
                    value={`${getValues("greatGrandparentName") || "—"} (${
                      getValues("greatGrandparentBirthdate") || "—"
                    })`}
                  />
                  <hr className="my-2" />
                  <Row label="Purpose" value={getValues("purpose")} />
                  <hr className="my-2" />
                  <Row
                    label="Signature"
                    value={`${getValues("signature")} (${
                      getValues("signDate") || "—"
                    })`}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Please review carefully. Submitting will save this application
                  and generate a PDF.
                </p>
              </section>
            )}

            {/* Nav buttons */}
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
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right column */}
        <AsidePanel />
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

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: "Applicant Info" },
    { n: 2, label: "Heritage & Purpose" },
    { n: 3, label: "Consent" },
    { n: 4, label: "Preview" },
  ];
  const pct = ((step - 1) / (steps.length - 1)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
        {steps.map((s) => (
          <div key={s.n} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${
                s.n <= step
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white"
              }`}>
              {s.n}
            </span>
            <span
              className={`truncate ${
                s.n <= step ? "font-medium" : "text-slate-500"
              }`}>
              {s.label}
            </span>
          </div>
        ))}
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

function ConsentItem({
  id,
  register,
  label,
  error,
}: {
  id: FieldPath<ApplyFormData>;
  register: UseFormRegister<ApplyFormData>;
  label: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-2">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        {...register(id)}
      />
      <div>
        <label className="text-sm leading-5">{label}</label>
        {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
      </div>
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

function AsidePanel() {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold">Fees</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Annual Registration Fee: <strong>$25 (non-refundable)</strong>
          </li>
          <li>
            Lot Processing Fee: <strong>$100 (non-refundable)</strong>
          </li>
          <li>
            Residential Lot Fee: <strong>TBD</strong>
          </li>
          <li>
            Commercial Lot Fee: <strong>To be advised based on lot size</strong>
          </li>
        </ul>
        <p className="mt-3 text-xs text-slate-600">
          Payments: Tarpum Bay Commonage No. 10419388,
          <br />
          Acct # 1350006680 — Bank of the Bahamas, Rock Sound (Branch # 03153).
        </p>
      </div>

      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold">Required Documentation</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            <strong>Registration only:</strong> fee receipt, passport copy,
            birth certificate copy
          </li>
          <li>
            <strong>Residential lot:</strong> processing + residential fees,
            preliminary building drawings
          </li>
          <li>
            <strong>Commercial lot:</strong> business plan, preliminary building
            drawings
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold">Need help?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Email:{" "}
          <a href="mailto:tbaycommonagecontact@gmail.com" className="underline">
            tbaycommonagecontact@gmail.com
          </a>
        </p>
      </div>
    </aside>
  );
}
