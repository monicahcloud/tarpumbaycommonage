// components/ApplyFormClient.tsx
"use client";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    errorMap: () => ({
      message: "You must confirm you read and agree to the rules.",
    }),
  }),
  agree18Months: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to begin work within 18 months.",
    }),
  }),
  acknowledgeReissue: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge the re-issue policy." }),
  }),
  signature: z.string().min(2, "Type your name as signature"),
  signDate: z.string().optional(),
});

export type ApplyFormData = z.infer<typeof schema>;

// -------------------- Component --------------------
export default function ApplyFormClient() {
  // const router = useRouter();
  // const { isSignedIn } = useAuth();
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
    const v = watchAll; // already reactive
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
    // go to next step, or to Preview when leaving step 3
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
    // map to minimal API we created earlier
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
      <div className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-[3fr_2fr]">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Application Submitted</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your submission. Your application ID is:
          </p>
          <p className="mt-1 font-mono text-sm">{applicationId}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90"
              href={`/api/applications/${applicationId}/pdf`}>
              Download PDF
            </a>
            <Link
              href="/"
              className="inline-flex items-center rounded border px-4 py-2 hover:bg-muted">
              Go Home
            </Link>
          </div>
        </div>
        <AsidePanel />
      </div>
    );
  }

  // ------------- Form -------------
  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[3fr_2fr]">
      {/* Main Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {/* Stepper / Breadcrumb */}
        <ol className="mb-6 flex items-center gap-4 text-sm">
          <StepDot active={step >= 1} text="Applicant Info" />
          <div className="h-px flex-1 bg-border" />
          <StepDot active={step >= 2} text="Heritage & Purpose" />
          <div className="h-px flex-1 bg-border" />
          <StepDot active={step >= 3} text="Consent" />
          <div className="h-px flex-1 bg-border" />
          <StepDot active={step >= 4} text="Preview" />
        </ol>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Applicant Information</h2>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="First Name" error={errors.firstName?.message}>
                  <input
                    className="w-full rounded border p-2"
                    {...register("firstName")}
                  />
                </Field>
                <Field
                  label="Middle Name (optional)"
                  error={errors.middleName?.message}>
                  <input
                    className="w-full rounded border p-2"
                    {...register("middleName")}
                  />
                </Field>
                <Field label="Surname" error={errors.lastName?.message}>
                  <input
                    className="w-full rounded border p-2"
                    {...register("lastName")}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Date of Birth">
                  <input
                    type="date"
                    className="w-full rounded border p-2"
                    {...register("dob")}
                  />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input
                    type="email"
                    className="w-full rounded border p-2"
                    {...register("email")}
                  />
                </Field>
              </div>

              {/* Mailing Address — two lines */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Mailing Address (Line 1)"
                  error={errors.addressLine1?.message}>
                  <input
                    className="w-full rounded border p-2"
                    {...register("addressLine1")}
                  />
                </Field>
                <Field label="Mailing Address (Line 2)">
                  <input
                    className="w-full rounded border p-2"
                    {...register("addressLine2")}
                  />
                </Field>
              </div>

              {/* Phone with type selector */}
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Phone Number" error={errors.phone?.message}>
                  <input
                    className="w-full rounded border p-2"
                    {...register("phone")}
                  />
                </Field>
                <Field label="Phone Type">
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="home"
                        {...register("phoneType")}
                      />
                      Home
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="cell"
                        {...register("phoneType")}
                      />
                      Cell
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="work"
                        {...register("phoneType")}
                      />
                      Work
                    </label>
                  </div>
                </Field>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                Ancestors with Tarpum Bay Heritage
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Parent Name">
                  <input
                    className="w-full rounded border p-2"
                    {...register("parentName")}
                  />
                </Field>
                <Field label="Parent Birthdate">
                  <input
                    type="date"
                    className="w-full rounded border p-2"
                    {...register("parentBirthdate")}
                  />
                </Field>

                <Field label="Grandparent Name">
                  <input
                    className="w-full rounded border p-2"
                    {...register("grandparentName")}
                  />
                </Field>
                <Field label="Grandparent Birthdate">
                  <input
                    type="date"
                    className="w-full rounded border p-2"
                    {...register("grandparentBirthdate")}
                  />
                </Field>

                <Field label="Great-Grandparent Name">
                  <input
                    className="w-full rounded border p-2"
                    {...register("greatGrandparentName")}
                  />
                </Field>
                <Field label="Great-Grandparent Birthdate">
                  <input
                    type="date"
                    className="w-full rounded border p-2"
                    {...register("greatGrandparentBirthdate")}
                  />
                </Field>
              </div>

              <h2 className="text-lg font-semibold pt-2">Purpose for Land</h2>
              <Field
                label="Describe your intended use"
                error={errors.purpose?.message}>
                <textarea
                  className="w-full rounded border p-2"
                  rows={4}
                  {...register("purpose")}
                />
              </Field>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Consent & Sign</h2>
              <div className="space-y-2 rounded-md border p-3 text-sm">
                <ConsentItem
                  id="agreeRules"
                  register={register}
                  label={
                    <>
                      I have received and read the rules that set out the
                      management, development, and uses of Tarpum Bay Commonage
                      land and agree to abide by them.
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
                      maintained after eighteen (18) months, it will be returned
                      to the pool and reissued when I confirm I’m prepared to
                      proceed.
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
                    className="w-full rounded border p-2"
                    {...register("signature")}
                    placeholder="Your full name"
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    className="w-full rounded border p-2"
                    {...register("signDate")}
                  />
                </Field>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="rounded-md border p-4 text-sm space-y-2">
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
              <p className="text-xs text-muted-foreground">
                Please review carefully. Submitting will save this application
                and generate a PDF.
              </p>
            </section>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="rounded border px-4 py-2 text-sm disabled:opacity-50">
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90">
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right column */}
      <AsidePanel />
    </div>
  );
}

/* -------------------- small UI helpers -------------------- */

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
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function StepDot({ active, text }: { active: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={[
          "inline-block h-5 w-5 rounded-full border",
          active ? "bg-blue-600 border-blue-600" : "bg-muted",
        ].join(" ")}
      />
      <span className={active ? "font-medium" : "text-muted-foreground"}>
        {text}
      </span>
    </li>
  );
}

function ConsentItem({
  id,
  register,
  label,
  error,
}: {
  id: keyof ApplyFormData;
  register: ReturnType<typeof useForm>["register"];
  label: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input type="checkbox" className="mt-1" {...register(id)} />
      <div>
        <label className="text-sm leading-5">{label}</label>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
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
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Fees</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>
            Registration Fee: <strong>$25 (non-refundable)</strong>
          </li>
          <li>
            Lot Processing Fee: <strong>$100 (non-refundable)</strong>
          </li>
          <li>
            Residential Lot Fee: <strong>$1,500</strong>
          </li>
          <li>
            Commercial Lot Fee: <strong>To be advised based on lot size</strong>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Payments: Tarpum Bay Commonage No. 10419388, Acct # 1350006680 — Bank
          of the Bahamas, Rock Sound (Branch # 03153).
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Required Documentation</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
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

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold">Need help?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Email:{" "}
          <a href="mailto:tbaycommonagecontact@gmail.com" className="underline">
            tbaycommonagecontact@gmail.com
          </a>
        </p>
      </div>
    </aside>
  );
}
