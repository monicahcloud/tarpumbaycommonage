"use client";
import { motion } from "framer-motion";

export function HistoryTimeline() {
  const items = [
    {
      year: "1800s",
      title: "The Commonage Act",
      text: "Establishment of communal land rights to ensure Tarpum Bay descendants had permanent access to agricultural and residential land.",
    },
    {
      year: "1900s",
      title: "Generational Stewardship",
      text: "The formalization of the Committee structure to manage documentation and resolve land use disputes through community-led governance.",
    },
    {
      year: "2026",
      title: "Digital Transformation",
      text: "Modernizing our records and application processes to ensure transparency and equitable access in the digital age.",
    },
  ];

  return (
    <section className=" bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Our Legacy
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {items.map((e, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="relative pl-8 border-l-2 border-slate-100 hover:border-blue-500 transition-colors">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.2)]" />
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">
                {e.year}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                {e.title}
              </h3>
              <p className="mt-4 text-slate-500 leading-relaxed text-sm">
                {e.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
