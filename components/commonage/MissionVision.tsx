"use client";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";
import { Target, Eye } from "lucide-react";

export function MissionVision() {
  return (
    <section className="mx-auto max-w-7xl px-6 ">
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          {...fadeUp}
          className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
          </div>
          <p className="leading-relaxed text-slate-600 text-lg">
            To manage and protect the Tarpum Bay Commonage lands with
            transparency, accountability, and integrity—ensuring equitable
            access and sustainable use for current and future generations.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="group relative overflow-hidden rounded-[2.5rem] bg-teal-700 p-10 shadow-xl shadow-slate-900/20 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-white/10 text-blue-300 group-hover:bg-blue-400 group-hover:text-slate-900 transition-colors">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
          </div>
          <p className="leading-relaxed text-slate-300 text-lg">
            A united Tarpum Bay community, rooted in tradition, working together
            to build a prosperous, inclusive, and environmentally responsible
            future through fair stewardship of our shared land.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
