"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import church from "@/app/assets/tarpum-bay-hero.png";
import { Hero } from "@/components/commonage/Hero";
import { MissionVision } from "@/components/commonage/MissionVision";
import { LeadershipGrid } from "@/components/commonage/LeadershipGrid";
import { Trustees } from "@/components/commonage/Trustees";
import { Chaplain } from "@/components/commonage/Chaplain";
import { WhatWeDo } from "@/components/commonage/WhatWeDo";
import { ProcessSteps } from "@/components/commonage/ProcessSteps";
import { HistoryTimeline } from "@/components/commonage/HistoryTimeline";
import { BOARD, TRUSTEES, CHAPLAINS } from "@/data/commonageMembers";

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <main className="relative min-h-screen bg-[#FDFDFD] text-slate-900 overflow-x-hidden">
      {/* 1. Modern Reading Progress Bar */}
      <motion.div
        className="fixed top-[80px] left-0 right-0 h-1 bg-emerald-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* 2. Hero Section - With parallax hint */}
      <Hero image={church} alt="Tarpum Bay landscape" />

      {/* 3. Main Content Container */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        {/* Section Wrapper with subtle Fade-In animations */}
        <SectionWrapper>
          <MissionVision />
        </SectionWrapper>

        <SectionWrapper className="bg-slate-50/50 rounded-[3rem] p-8 md:p-16 border border-slate-100">
          <LeadershipGrid people={BOARD} />
        </SectionWrapper>

        <SectionWrapper>
          <Trustees people={TRUSTEES} />
        </SectionWrapper>

        <SectionWrapper className="bg-teal-900 text-white rounded-[3rem] p-8 md:p-16 my-20">
          <Chaplain people={CHAPLAINS} />
        </SectionWrapper>

        <SectionWrapper>
          <WhatWeDo />
        </SectionWrapper>

        <SectionWrapper className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-full bg-slate-200 -z-10 hidden md:block" />
          <ProcessSteps />
        </SectionWrapper>

        <SectionWrapper>
          <HistoryTimeline />
        </SectionWrapper>
      </div>

      <div className="h-24" />
    </main>
  );
}

/**
 * A reusable wrapper to stagger animations as the user scrolls
 */
function SectionWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`py-12 md:py-20 ${className}`}>
      {children}
    </motion.section>
  );
}
