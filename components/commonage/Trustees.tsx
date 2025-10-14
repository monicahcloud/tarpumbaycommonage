"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { ShieldCheck } from "lucide-react";
import { PersonCard } from "./PersonCard";
import { Person } from "./types";

export function Trustees({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        {...fadeUp}
        className="flex items-center justify-center gap-2 text-center">
        <ShieldCheck className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Trustees</h2>
      </motion.div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Legal custodians of commonage property, documents, and long-term
        stewardship.
      </p>

      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </motion.div>
    </section>
  );
}
