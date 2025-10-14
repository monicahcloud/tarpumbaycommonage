"use client";
import { motion } from "framer-motion";
import { stagger } from "@/components/commonage/motion";
import { DocumentCard } from "./DocumentCard";
import type { DocumentItem } from "@/data/documents";

export function DocumentGrid({ docs }: { docs: DocumentItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
    </motion.div>
  );
}
