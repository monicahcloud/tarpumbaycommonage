"use client";
import React from "react";

export function RoleBadge({ role }: { role: string }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase";

  // Map specific roles to color themes
  const map: Record<string, string> = {
    Chairperson: "bg-emerald-100 text-emerald-700",
    "Vice Chairperson": "bg-emerald-100 text-emerald-700",
    Secretary: "bg-sky-100 text-sky-700",
    "Assistant Secretary": "bg-sky-100 text-sky-700",
    Treasurer: "bg-amber-100 text-amber-700",
    "Assistant Treasurer": "bg-amber-100 text-amber-700",
    Trustee: "bg-purple-100 text-purple-700",
    Chaplain: "bg-rose-100 text-rose-700",
    "Assistant Chaplain": "bg-rose-100 text-rose-700",
    Chaplaincy: "bg-rose-100 text-rose-700", // covers group header or department display
  };

  return (
    <span className={`${base} ${map[role] ?? "bg-gray-100 text-gray-700"}`}>
      {role}
    </span>
  );
}
