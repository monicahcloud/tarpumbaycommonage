"use client";

import { useMemo, useState } from "react";
import AddAttachmentForm, {
  AttachmentKind,
  AttachmentTarget,
} from "./AddAttachmentForm";

const COMMONER_REQUIRED: AttachmentKind[] = [
  "ID_PASSPORT",
  "BIRTH_CERT",
  "PROOF_OF_LINEAGE",
  "PROOF_OF_ADDRESS",
];

const APPLICATION_REQUIRED: AttachmentKind[] = ["DRAWINGS", "BUSINESS_PLAN"];

function labelFor(kind: AttachmentKind) {
  return kind.replaceAll("_", " ");
}

export default function AttachmentsChecklist({
  applicationId,
  commonerId,
  alreadyHasLand,
  commonerKinds,
  applicationKinds,
}: {
  applicationId: string;
  commonerId: string | null;
  alreadyHasLand: boolean;
  commonerKinds: string[];
  applicationKinds: string[];
}) {
  // Example rule: require payment proof if already has land (tweak if you want)
  const commonerRequired = useMemo(() => {
    const base = new Set(COMMONER_REQUIRED);
    if (alreadyHasLand) base.add("PROOF_OF_PAYMENT");
    return Array.from(base);
  }, [alreadyHasLand]);

  const applicationRequired = APPLICATION_REQUIRED;

  const haveCommoner = useMemo(() => new Set(commonerKinds), [commonerKinds]);
  const haveApp = useMemo(() => new Set(applicationKinds), [applicationKinds]);

  const [preset, setPreset] = useState<{
    target: AttachmentTarget;
    kind: AttachmentKind;
    seed: number;
  } | null>(null);

  function presetUpload(target: AttachmentTarget, kind: AttachmentKind) {
    setPreset({ target, kind, seed: Date.now() });
    // scroll to form area nicely
    document
      .getElementById("upload-form-anchor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Checklist</h3>
        <p className="text-xs text-slate-600">
          Click “Upload” to pre-select target & kind.
        </p>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Commoner Registration
          </div>

          <ul className="space-y-2">
            {commonerRequired.map((k) => {
              const ok = haveCommoner.has(k);
              return (
                <li
                  key={k}
                  className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        ok ? "text-emerald-700" : "text-rose-700"
                      }`}>
                      {ok ? "✓" : "•"}
                    </span>
                    <span className="text-sm text-slate-800">
                      {labelFor(k)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        ok ? "text-emerald-700" : "text-rose-700"
                      }`}>
                      {ok ? "Uploaded" : "Missing"}
                    </span>
                    <button
                      type="button"
                      onClick={() => presetUpload("COMMONER", k)}
                      disabled={!commonerId}
                      className="rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">
                      Upload
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Application
          </div>

          <ul className="space-y-2">
            {applicationRequired.map((k) => {
              const ok = haveApp.has(k);
              return (
                <li
                  key={k}
                  className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        ok ? "text-emerald-700" : "text-rose-700"
                      }`}>
                      {ok ? "✓" : "•"}
                    </span>
                    <span className="text-sm text-slate-800">
                      {labelFor(k)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        ok ? "text-emerald-700" : "text-rose-700"
                      }`}>
                      {ok ? "Uploaded" : "Missing"}
                    </span>
                    <button
                      type="button"
                      onClick={() => presetUpload("APPLICATION", k)}
                      className="rounded-lg border px-2 py-1 text-xs font-semibold hover:bg-slate-50">
                      Upload
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div id="upload-form-anchor" className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold text-slate-900">
          Upload missing document
        </h4>
        <p className="mt-1 text-sm text-slate-600">
          This will attach to the correct record based on your selection.
        </p>

        <div className="mt-3">
          <AddAttachmentForm
            applicationId={applicationId}
            commonerId={commonerId}
            defaultTarget={preset?.target ?? "APPLICATION"}
            defaultKind={preset?.kind ?? "OTHER"}
            keySeed={preset?.seed ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
