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
    <section className=" bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          {...fadeUp}
          className="text-4xl font-black text-slate-900 text-center mb-16">
          Our Responsibilities
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3">
          {cards.map(({ title, desc, Icon }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -10 }}
              className="group relative rounded-3xl bg-white p-10 shadow-sm border border-slate-100 transition-all hover:shadow-2xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
