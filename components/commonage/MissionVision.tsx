"use client";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";

export function MissionVision() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          {...fadeUp}
          className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary">Our Mission</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            To manage and protect the Tarpum Bay Commonage lands with
            transparency, accountability, and integrity—ensuring equitable
            access and sustainable use for current and future generations.
          </p>
        </motion.div>
        <motion.div
          {...fadeUp}
          className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-primary">Our Vision</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            A united Tarpum Bay community, rooted in tradition, working together
            to build a prosperous, inclusive, and environmentally responsible
            future through fair stewardship of our shared land.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
