/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "./motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export function Hero({ image, alt }: { image: any; alt: string }) {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 px-6 py-10 md:py-20 items-center">
        <motion.div {...fadeUp}>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
            Stewarding Shared Land for a Shared Future
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-prose">
            We protect, manage, and responsibly allocate the Commonage lands of
            Tarpum Bay, Eleuthera—balancing heritage with sustainable
            development for all rightful descendants.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/portal/apply"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white font-semibold shadow-sm hover:bg-primary/90 transition">
              Apply for Land <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transparent
              process
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
              Community-led decisions
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Heritage
              focused
            </span>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative order-first md:order-last">
          <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl">
            <Image
              src={image}
              alt={alt}
              className="h-[360px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
