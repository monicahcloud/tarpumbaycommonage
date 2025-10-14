"use client";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { LandPlot, UsersRound, Landmark } from "lucide-react";

export function WhatWeDo() {
  const cards = [
    {
      title: "Land Allocation",
      desc: "Review and approve applications for rightful land use and distribution.",
      Icon: LandPlot,
    },
    {
      title: "Community Engagement",
      desc: "Host meetings, publish updates, and ensure transparent decisions.",
      Icon: UsersRound,
    },
    {
      title: "Heritage Protection",
      desc: "Safeguard cultural and environmental legacies for future generations.",
      Icon: Landmark,
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 pb-6">
      <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
        What We Do
      </motion.h2>
      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="mt-10 grid gap-6 md:grid-cols-3">
        {cards.map(({ title, desc, Icon }, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="group rounded-2xl border bg-white p-7 shadow-sm transition">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
