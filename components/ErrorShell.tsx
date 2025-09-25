"use client";

import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // if you have a cn helper; otherwise remove and inline classNames
import { ReactNode } from "react";

type Props = {
  badge?: string;
  title: string;
  message?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode; // optional extra content (e.g., details)
};

export default function ErrorShell({
  badge,
  title,
  message,
  actions,
  className,
  children,
}: Props) {
  return (
    <section className={cn("relative overflow-hidden px-6 py-24", className)}>
      {/* background: subtle grid + soft brand blobs */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-gradient blur-3xl opacity-40" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-brand-gradient blur-3xl opacity-30" />

      <div className="relative mx-auto max-w-3xl text-center">
        {badge ? (
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-[hsl(var(--primary))]/10 px-3 py-1 text-sm font-medium text-[hsl(var(--primary))]">
            {badge}
          </span>
        ) : null}

        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
          <span className="text-brand-gradient">{title}</span>
        </h1>

        {message ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {message}
          </p>
        ) : null}

        <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {actions}
        </div>

        {children ? (
          <div className="mx-auto mt-10 w-full max-w-2xl text-left">
            {children}
          </div>
        ) : null}

        <div className="mx-auto mt-12 h-px max-w-xl bg-gradient-to-r from-transparent via-[hsl(var(--primary))/0.35] to-transparent" />
        <div className="mt-6 text-sm text-muted-foreground">
          <Link
            href="/support"
            className="underline underline-offset-4 hover:text-primary">
            Need more help? Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
