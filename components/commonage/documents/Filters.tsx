"use client";
import { useMemo, useState } from "react";
import type { DocumentItem } from "@/data/documents";

export type FilterState = {
  q: string;
  category: string; // "" means all
};

export function useDocumentFilter(docs: DocumentItem[]) {
  const [state, setState] = useState<FilterState>({ q: "", category: "" });

  const categories = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => set.add(d.category));
    return ["", ...Array.from(set)]; // "" => All
  }, [docs]);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (state.category && d.category !== state.category) return false;
      if (state.q) {
        const q = state.q.toLowerCase();
        const hay = `${d.title} ${d.description ?? ""} ${
          d.tags?.join(" ") ?? ""
        }`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [docs, state]);

  return { state, setState, categories, filtered };
}

export function Filters({
  state,
  setState,
  categories,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <input
        value={state.q}
        onChange={(e) => setState({ ...state, q: e.target.value })}
        placeholder="Search documents…"
        className="w-full md:w-1/2 rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
      <select
        value={state.category}
        onChange={(e) => setState({ ...state, category: e.target.value })}
        className="w-full md:w-auto rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30">
        {categories.map((c) => (
          <option key={c} value={c}>
            {c ? c : "All Categories"}
          </option>
        ))}
      </select>
    </div>
  );
}
