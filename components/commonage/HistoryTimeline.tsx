"use client";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";

export function HistoryTimeline() {
  const items = [
    {
      year: "Origins",
      text: "Commonage established to preserve communal land for descendants of Tarpum Bay.",
    },
    {
      year: "Stewardship",
      text: "Committee formed to administer applications and protect shared resources.",
    },
    {
      year: "Today",
      text: "Modernized processes with public transparency and community participation.",
    },
  ];
  return (
    <section className="border-t bg-gray-50/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
          Our History
        </motion.h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {items.map((e, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              className="relative rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{e.year}</div>
              <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
