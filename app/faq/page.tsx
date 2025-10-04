// app/faq/page.tsx
"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// ---- utils ----
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type FAQ = {
  q: string;
  a: string | JSX.Element;
  category:
    | "Application"
    | "Eligibility"
    | "Allocation"
    | "Timelines"
    | "Fees"
    | "General";
};

const FAQS: FAQ[] = [
  {
    q: "How do I apply for a residential or commercial lot?",
    category: "Application",
    a: (
      <div className="space-y-2">
        <p>
          The application process has recently been updated. A new online form
          will be available shortly. Once published, you can submit your
          application and required documents digitally.
        </p>
        <ul className="list-disc pl-5">
          <li>Complete the online form (when released)</li>
          <li>Upload proof of identity</li>
          <li>Upload proof of descent from a registered Tarpum Bay commoner</li>
        </ul>
      </div>
    ),
  },
  {
    q: "What documents are required?",
    category: "Application",
    a: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Government-issued photo ID (passport, NIB card, or driver’s license)
        </li>
        <li>
          Proof of lineage (birth certificates, family tree, affidavit, or other
          supporting documentation)
        </li>
      </ul>
    ),
  },
  {
    q: "Who qualifies to apply for commonage land?",
    category: "Eligibility",
    a: "Only descendants of the original registered commoners of Tarpum Bay are eligible. Proof of lineage is required.",
  },
  {
    q: "I’m already registered as a commoner. Do I need to register again?",
    category: "Eligibility",
    a: "No. Once registered, you remain on record; however, you must complete the updated application form for any land request.",
  },
  {
    q: "Can siblings or family members request lots next to each other?",
    category: "Allocation",
    a: "Yes—note this preference in your application. While adjacency isn’t guaranteed, the Committee will make reasonable efforts when possible.",
  },
  {
    q: "How are lot locations determined?",
    category: "Allocation",
    a: "Lot assignment is based on availability, fairness, and long-term development planning approved by the Committee.",
  },
  {
    q: "How long does application review take?",
    category: "Timelines",
    a: "Processing times vary. Applicants are notified by email once a decision has been made.",
  },
  {
    q: "How will I be notified of the outcome?",
    category: "Timelines",
    a: "Official communication is sent via email; WhatsApp or phone may be used when needed.",
  },
  {
    q: "Is there a fee to apply?",
    category: "Fees",
    a: "There is no fee to submit an application at this time. Administrative fees may apply after allocation.",
  },
  {
    q: "What are my responsibilities if land is granted?",
    category: "General",
    a: "Recipients must follow development guidelines and maintain their lots. Additional obligations will be outlined in the approval letter.",
  },
  {
    q: "Who do I contact for help?",
    category: "General",
    a: (
      <p>
        Email:{" "}
        <Link
          href="mailto:tbaycommonagecontact@gmail.com"
          className="underline">
          tbaycommonagecontact@gmail.com
        </Link>
        . Updates will also be posted on the Committee’s website and shared via
        email announcements.
      </p>
    ),
  },
];

const CATEGORIES: Array<FAQ["category"]> = [
  "Application",
  "Eligibility",
  "Allocation",
  "Timelines",
  "Fees",
  "General",
];

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQ["category"] | "All">(
    "All"
  );
  // const [copiedId, setCopiedId] = useState<string | null>(null);

  // Smooth-scroll to hash on load (if deep-linked)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      const matchesText =
        !q ||
        item.q.toLowerCase().includes(q) ||
        (typeof item.a === "string" ? item.a.toLowerCase().includes(q) : false);
      const matchesCat =
        activeCategory === "All" || item.category === activeCategory;
      return matchesText && matchesCat;
    });
  }, [query, activeCategory]);

  // async function copyLink(id: string) {
  //   const url = `${window.location.origin}/faq#${id}`;
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     setCopiedId(id);
  //     setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 1800);
  //   } catch {
  //     // fallback
  //     prompt("Copy link:", url);
  //   }
  // }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className={clsx(
          "border-b relative",
          "bg-gradient-to-b from-indigo-50 via-white to-white"
        )}
        style={{
          backgroundImage:
            "radial-gradient(40rem 18rem at 20% -10%, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0) 60%), radial-gradient(36rem 16rem at 80% 0%, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0) 60%)",
        }}>
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-sm">
              <HelpCircle className="h-6 w-6 text-indigo-600" aria-hidden />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Answers about eligibility, applications, timelines, and lot
            allocation. Can&pos;t find it?{" "}
            <Link
              href="mailto:tbaycommonagecontact@gmail.com"
              className="underline underline-offset-2 decoration-indigo-500">
              Contact us
            </Link>
            .
          </p>

          {/* Search + Category */}
          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search the FAQs…"
                className="pl-9 h-11 bg-transparent border-none focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search FAQs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={activeCategory === "All" ? "default" : "outline"}
                className={clsx(
                  "cursor-pointer rounded-full px-3 py-1",
                  activeCategory === "All" &&
                    "ring-1 ring-indigo-200 bg-indigo-600 text-white"
                )}
                onClick={() => setActiveCategory("All")}>
                All
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className={clsx(
                    "cursor-pointer rounded-full px-3 py-1",
                    activeCategory === cat &&
                      "ring-1 ring-indigo-200 bg-indigo-600 text-white"
                  )}
                  onClick={() => setActiveCategory(cat)}>
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        {filtered.length === 0 ? (
          <p className="text-gray-600">
            No results. Try another search or choose a different category.
          </p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filtered.map((item) => {
              const id = slugify(item.q);
              // const isCopied = copiedId === id;
              return (
                <AccordionItem
                  key={id}
                  value={id}
                  id={id}
                  className="border-b last:border-b-0">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-lg leading-snug">
                          {item.q}
                        </span>
                        <div className="shrink-0 flex items-center gap-2">
                          <Badge variant="secondary" className="w-fit">
                            {item.category}
                          </Badge>
                          {/* <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(id);
                            }}
                            className={clsx(
                              "inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-medium ring-1 ring-black/10",
                              "bg-white hover:bg-gray-50 shadow-sm transition",
                              "text-gray-700"
                            )}
                            aria-label="Copy link to this question">
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-3.5 w-3.5" />
                                Copy link
                              </>
                            )}
                          </button> */}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Click to expand the answer
                      </p>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="text-gray-800 leading-relaxed">
                    <div className="prose prose-gray max-w-none dark:prose-invert [&_*]:scroll-mt-24">
                      {item.a}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {/* Footer hint */}
        <div className="mt-10 rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-5 text-sm text-gray-700 shadow-sm">
          Can&apos;t find your question? Email{" "}
          <Link
            href="mailto:tbaycommonagecontact@gmail.com"
            className="font-medium underline underline-offset-2 decoration-indigo-500">
            tbaycommonagecontact@gmail.com
          </Link>{" "}
          and we&apos;ll get back to you—and add it here if it helps others.
        </div>
      </section>
    </main>
  );
}
