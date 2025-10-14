"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./motion";
import { RoleBadge } from "./RoleBadge";
import { HeartHandshake } from "lucide-react";
import { Person } from "./types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

export function Chaplain({ people }: { people: Person[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <motion.div
        {...fadeUp}
        className="flex items-center justify-center gap-2 text-center">
        <HeartHandshake className="h-6 w-6 text-rose-600" />
        <h2 className="text-xl font-bold">Chaplaincy</h2>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-6 grid gap-6 sm:grid-cols-2">
        {people.map((person) => (
          <motion.div
            key={person.id}
            variants={fadeUp}
            className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
              <div>
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-rose-200">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-rose-50 text-sm font-bold text-rose-700">
                      {initialsFromName(person.name).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{person.name}</h3>
                  <RoleBadge role={person.role} />
                </div>
                {person.bio ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {person.bio}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
