"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { PersonCard } from "./PersonCard";
import { Person } from "./types";
import { Gavel } from "lucide-react";

export function LeadershipGrid({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-6">
      {/* Main Heading */}
      <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
        Leadership
      </motion.h2>{" "}
      {/* Subheading */}
      <motion.div
        {...fadeUp}
        className="flex items-center justify-center gap-2 mt-8 text-center">
        <Gavel className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">
          Executive Team {new Date().getFullYear()}
        </h2>
      </motion.div>{" "}
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Legal custodians of commonage property, documents, and long-term
        stewardship.
      </p>
      {/* Members Grid */}
      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </motion.div>
      {/* Legend */}
      {/* <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2">
          <Gavel className="h-4 w-4" /> Executive Officers
        </span>
        <span className="inline-flex items-center gap-2">
          <UserIcon className="h-4 w-4" /> Functional Officers
        </span>
      </div> */}
    </section>
  );
}
