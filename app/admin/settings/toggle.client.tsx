/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/settings/toggle.client.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function LandApplicationsToggle({
  initialOpen,
}: {
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [pending, startTransition] = useTransition();

  async function onToggle() {
    const next = !open;
    setOpen(next);

    startTransition(async () => {
      const t = toast.loading("Saving setting…");
      try {
        const res = await fetch("/api/admin/settings/land-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ open: next }),
        });

        if (!res.ok) {
          const msg = await res.text();
          setOpen(!next); // revert
          toast.error("Failed to save", { id: t, description: msg });
          return;
        }

        toast.success("Saved", { id: t });
      } catch (e: any) {
        setOpen(!next); // revert
        toast.error("Failed to save", {
          description: e?.message ?? "Unknown error",
        });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={`relative inline-flex h-10 w-20 items-center rounded-full border px-1 transition ${
        open
          ? "bg-emerald-600 border-emerald-600"
          : "bg-slate-200 border-slate-300"
      } ${pending ? "opacity-70" : ""}`}
      aria-pressed={open}>
      <span
        className={`inline-block h-8 w-8 rounded-full bg-white shadow transition ${
          open ? "translate-x-10" : "translate-x-0"
        }`}
      />
      <span className="sr-only">Toggle land applications</span>
    </button>
  );
}
