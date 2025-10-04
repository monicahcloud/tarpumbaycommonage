"use client";

import Image from "next/image";
import church from "../assets/tarpum-bay-hero.png";
import {
  LandPlot,
  UsersRound,
  Landmark,
  ChevronRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";

// Reusable animation presets
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeOut },
};

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.12 } },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[rgba(243,244,246,0.6)] to-white text-gray-900">
      {/* Hero - split layout */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 px-6 py-10 md:py-20 items-center">
          {/* Left: Copy */}
          <motion.div {...fadeUp}>
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold leading-tight">
              Stewarding Shared Land for a Shared Future
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-prose">
              We protect, manage, and responsibly allocate the Commonage lands
              of Tarpum Bay, Eleuthera—balancing heritage with sustainable
              development for all rightful descendants.
            </p>

            {/* Quick actions */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
              <a
                href="/portal/apply"
                className="inline-flex items-center  gap-2 rounded-full bg-primary px-5 py-3 text-white font-semibold shadow-sm hover:bg-primary/90 transition">
                Apply for Land <ChevronRight className="h-4 w-4" />
              </a>
              {/* <a
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-gray-50 transition">
                View Bylaws & Docs
              </a> */}
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />{" "}
                Transparent process
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

          {/* Right: Image card */}
          <motion.div
            {...fadeUp}
            className="relative order-first md:order-last">
            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl">
              <Image
                src={church}
                alt="Tarpum Bay landscape"
                className="h-[360px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              {/* <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/80 backdrop-blur px-4 py-3 text-sm">
                <span className="font-medium">Commonage Lands • Eleuthera</span>
                <span className="text-gray-600">Est. 19xx</span>
              </div> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats band */}
      {/* <section className="border-y bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <motion.ul
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Applications processed", value: "1,200+" },
              { label: "Community meetings", value: "50+ /yr" },
              { label: "Acres under care", value: "—" },
              { label: "Descendant families", value: "Generations" },
            ].map((s, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                className="rounded-2xl border bg-white p-5 text-center shadow-sm">
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-xs tracking-wide text-gray-600 uppercase">
                  {s.label}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section> */}

      {/* Mission & Vision cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary">Our Mission</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              To manage and protect the Tarpum Bay Commonage lands with
              transparency, accountability, and integrity—ensuring equitable
              access and sustainable use for current and future generations.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-primary">Our Vision</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              A united Tarpum Bay community, rooted in tradition, working
              together to build a prosperous, inclusive, and environmentally
              responsible future through fair stewardship of our shared land.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What we do - icon cards */}
      <section className="mx-auto max-w-6xl px-6 pb-6">
        <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
          What We Do
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Land Allocation",
              desc: "Review and approve applications for rightful land use and distribution.",
              Icon: LandPlot,
            },
            {
              title: "Community Engagement",
              desc: "Host meetings, publish updates, and ensure transparent decisions.",
              Icon: UsersRound,
            },
            {
              title: "Heritage Protection",
              desc: "Safeguard cultural and environmental legacies for future generations.",
              Icon: Landmark,
            },
          ].map(({ title, desc, Icon }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border bg-white p-7 shadow-sm transition">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Process steps */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
          How Allocation Works
        </motion.h2>
        <ol className="mx-auto mt-8 grid gap-6 md:grid-cols-4">
          {[
            {
              t: "Check eligibility",
              d: "Confirm descendant status and required documentation.",
            },
            {
              t: "Submit application",
              d: "Complete the online form and upload supporting docs.",
            },
            {
              t: "Committee review",
              d: "Applications are reviewed against guidelines & bylaws.",
            },
            {
              t: "Decision & next steps",
              d: "Receive outcome, conditions, and guidance on use.",
            },
          ].map((s, i) => (
            <motion.li
              key={i}
              {...fadeUp}
              className="relative rounded-2xl border bg-white p-6 shadow-sm">
              <div className="absolute -top-3 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow">
                {i + 1}
              </div>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </motion.li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <a
            href="/portal/apply"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white font-semibold shadow hover:bg-primary/90">
            Start Application <FileCheck2 className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* History timeline */}
      <section className="border-t bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center">
            Our History
          </motion.h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                year: "Origins",
                text: "Commonage established to preserve communal land for descendants of Tarpum Bay.",
              },
              {
                year: "Stewardship",
                text: "Committee formed to administer applications and protect shared resources.",
              },
              {
                year: "Today",
                text: "Modernized processes with public transparency and community participation.",
              },
            ].map((e, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="relative rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-primary">
                  {e.year}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Panel */}
      {/* <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            {...fadeUp}
            className="md:col-span-2 rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">Get Involved</h2>
            <p className="mt-2 max-w-prose text-muted-foreground">
              Interested in contributing to the future of Tarpum Bay? Reach out
              to learn more about land use, applications, and community
              initiatives. Attend our next meeting or start your application
              online.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white font-semibold shadow hover:bg-primary/90">
                Apply for Land <FileCheck2 className="h-4 w-4" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold hover:bg-gray-50">
                Contact the Committee <Mail className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          <motion.aside
            {...fadeUp}
            className="rounded-3xl border bg-gradient-to-br from-primary/10 via-white to-white p-6 shadow-sm">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:underline"
                  href="/docs">
                  Bylaws & Documents <ChevronRight className="h-4 w-4" />
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:underline"
                  href="/news">
                  News & Notices <ChevronRight className="h-4 w-4" />
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:underline"
                  href="/faq">
                  FAQ <ChevronRight className="h-4 w-4" />
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:underline"
                  href="/portal">
                  Member Portal <ChevronRight className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </motion.aside>
        </div>
      </section> */}

      {/* Footer spacer */}
      <div className="h-8" />
    </main>
  );
}
