"use client";

import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "../app/assets/swing.png";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-[95vh] w-full flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background with subtle zoom effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Tarpum Bay"
          fill
          priority
          className="object-cover object-center opacity-60"
        />
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-900/40 via-slate-900/20 to-slate-900/80" />
      </motion.div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
            Eleuthera, Bahamas
          </span>
        </motion.div>

        {/* Title with Split Effect */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tight">
          Tarpum Bay <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-cyan-200">
            Commonage Committee
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Securing land rights and preserving ancestral heritage for the Tarpum
          Bay community through transparent, digital-first governance.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-10 py-7 text-lg transition-all hover:scale-105 active:scale-95">
            <Link href="/portal">
              Apply for Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 px-10 py-7 text-lg backdrop-blur-sm border border-white/20">
            <Link href="/about">Our History</Link>
          </Button>
        </motion.div>
      </div>

      {/* Modern Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 flex flex-col items-center gap-2">
        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
          Explore
        </span>
        <div className="w-px h-12 bg-linear-to-b from-emerald-400 to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
