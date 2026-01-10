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
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      }}
      className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm cursor-default">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-slate-50 transition-all group-hover:ring-blue-100">
          {person.photoUrl ? (
            <Image
              src={person.photoUrl}
              alt={person.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">
              {initialsFromName(person.name).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-col gap-1">
            <h4 className="truncate text-lg font-bold text-slate-900">
              {person.name}
            </h4>
            <div className="flex items-center gap-2">
              <RoleBadge role={person.role} />
            </div>
          </div>
        </div>
      </div>
      {person.bio && (
        <p className="mt-4 text-sm leading-relaxed text-slate-500 line-clamp-3">
          {person.bio}
        </p>
      )}
    </motion.div>
  );
}
