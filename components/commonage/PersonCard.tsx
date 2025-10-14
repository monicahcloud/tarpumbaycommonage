"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";
import { Person } from "./types";
import { RoleBadge } from "./RoleBadge";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border bg-white p-6 shadow-sm transition">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/10">
          {person.photoUrl ? (
            <Image
              src={person.photoUrl}
              alt={person.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-bold text-gray-600">
              {initialsFromName(person.name).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-semibold">{person.name}</h4>
            <RoleBadge role={person.role} />
          </div>
          {person.email ? (
            <div className="mt-1 truncate text-sm text-muted-foreground">
              {person.email}
            </div>
          ) : null}
        </div>
      </div>
      {person.bio ? (
        <p className="mt-4 text-sm text-muted-foreground">{person.bio}</p>
      ) : null}
    </motion.div>
  );
}
