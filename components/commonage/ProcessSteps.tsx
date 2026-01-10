"use client";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";

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
    <section className="mx-auto max-w-7xl px-6 ">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900">
          The Allocation Journey
        </h2>
        <p className="text-slate-500 mt-4">
          A transparent, four-step process to secure your rights.
        </p>
      </div>

      <ol className="grid gap-12 md:grid-cols-4">
        {steps.map((s, i) => (
          <motion.li
            key={i}
            {...fadeUp}
            className="relative p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-6xl font-black text-slate-100 absolute top-4 left-4 -z-10 group-hover:text-blue-50 transition-colors">
              0{i + 1}
            </span>
            <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-6 shadow-lg shadow-blue-200">
              {i + 1}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{s.t}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{s.d}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
