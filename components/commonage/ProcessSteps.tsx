"use client";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";
import { FileCheck2 } from "lucide-react";

export function ProcessSteps() {
  const steps = [
    {
      t: "Check eligibility",
      d: "Confirm descendant status and required documentation.",
    },
    {
      t: "Submit application",
      d: "Complete the online form and upload supporting docs.",
    },
    {
      t: "Committee review",
      d: "Applications are reviewed against guidelines & bylaws.",
    },
    {
      t: "Decision & next steps",
      d: "Receive outcome, conditions, and guidance on use.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
        How Allocation Works
      </motion.h2>
      <ol className="mx-auto mt-8 grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.li
            key={i}
            {...fadeUp}
            className="relative rounded-2xl border bg-white p-6 shadow-sm">
            <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow">
              {i + 1}
            </div>
            <h3 className="mt-3 font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </motion.li>
        ))}
      </ol>
      <div className="mt-8 text-center">
        <a
          href="/portal/apply"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white font-semibold shadow hover:bg-primary/90">
          Start Application <FileCheck2 className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
