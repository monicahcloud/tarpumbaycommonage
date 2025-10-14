// app/(site)/about/page.tsx
"use client";

import church from "@/app/assets/tarpum-bay-hero.png";
import { Hero } from "@/components/commonage/Hero";
import { MissionVision } from "@/components/commonage/MissionVision";
import { LeadershipGrid } from "@/components/commonage/LeadershipGrid";
import { Trustees } from "@/components/commonage/Trustees";
import { Chaplain } from "@/components/commonage/Chaplain";
import { WhatWeDo } from "@/components/commonage/WhatWeDo";
import { ProcessSteps } from "@/components/commonage/ProcessSteps";
import { HistoryTimeline } from "@/components/commonage/HistoryTimeline";
import { BOARD, TRUSTEES, CHAPLAINS } from "@/data/commonageMembers"; // <-- note CHAPLAINS

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[rgba(243,244,246,0.6)] to-white text-gray-900">
      <Hero image={church} alt="Tarpum Bay landscape" />
      <MissionVision />
      <LeadershipGrid people={BOARD} />
      <Trustees people={TRUSTEES} />
      <Chaplain people={CHAPLAINS} /> {/* <-- pass array */}
      <WhatWeDo />
      <ProcessSteps />
      <HistoryTimeline />
      <div className="h-8" />
    </main>
  );
}
