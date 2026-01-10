"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";
import { HeartHandshake } from "lucide-react";
import { Person } from "./types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

export function Chaplain({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 bg-rose-50/30 rounded-[3rem] border border-rose-100/50">
      <div className="text-center mb-12">
        <motion.div
          {...fadeUp}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm mb-4">
          <HeartHandshake className="h-6 w-6" />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900">
          Spiritual Leadership
        </h2>
        <p className="text-slate-500 mt-2">
          Providing guidance and support to the Commonage family.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
        {people.map((person) => (
          <motion.div
            key={person.id}
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl bg-white p-8 shadow-sm border border-rose-100/50 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-inner bg-rose-50 flex items-center justify-center">
              {person.photoUrl ? (
                <Image
                  src={person.photoUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-rose-300">
                  {initialsFromName(person.name)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {person.name}
              </h3>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-tighter">
                Committee Chaplain
              </span>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                {person.bio}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
