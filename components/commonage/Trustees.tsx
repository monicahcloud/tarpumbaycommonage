"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { ShieldCheck } from "lucide-react";
import { PersonCard } from "./PersonCard";
import { Person } from "./types";

export function Trustees({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 ">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="text-left">
          <motion.div
            {...fadeUp}
            className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
            <ShieldCheck className="h-4 w-4" />
            Legal Custodians
          </motion.div>
          <motion.h2
            {...fadeUp}
            className="text-3xl md:text-4xl font-black text-slate-900">
            The Trustees
          </motion.h2>
        </div>
        <p className="max-w-md text-slate-500 text-sm md:text-base italic border-l-2 border-blue-100 pl-4">
          &quot;Responsible for the long-term protection of commonage documents
          and communal property rights.&quot;
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
