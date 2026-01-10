"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { PersonCard } from "./PersonCard";
import { Person } from "./types";
import { Gavel } from "lucide-react";

export function LeadershipGrid({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 ">
      <div className="text-center mb-16">
        <motion.div
          {...fadeUp}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
          <Gavel className="h-4 w-4" />
          Executive Administration
        </motion.div>
        <motion.h2
          {...fadeUp}
          className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Board of Directors {new Date().getFullYear()}
        </motion.h2>
        <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
          The elected leadership responsible for the strategic governance and
          daily administration of the Tarpum Bay Commonage.
        </p>
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </motion.div>
    </section>
  );
}
