"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FolderOpenDot,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  pathname: string;
  onNavigate: () => void;
};

/**
 * Modern NavItem with hover and active states
 */
function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
  onNavigate,
}: NavItemProps) {
  const active =
    pathname === href || (href !== "/portal" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-slate-900 text-white shadow-md shadow-slate-200"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}>
      <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-500"}`} />
      <span>{label}</span>
    </Link>
  );
}

export default function MobileNav({
  uploadsHref,
  uploadsLabel,
  showUploads,
}: {
  uploadsHref: string;
  uploadsLabel: string;
  showUploads: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Auto-close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Handle click-outside and escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpen(false);
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Toggle Button - High z-index to stay above content */}
      <button
        type="button"
        aria-label="Toggle navigation"
        className="relative z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.div>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 1. Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[50] bg-slate-900/10 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* 2. Floating Navigation Panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed left-4 right-4 top-20 z-[60] overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5">
              <nav className="flex flex-col gap-1">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Main Navigation
                </div>

                <NavItem
                  href="/portal"
                  label="Dashboard"
                  icon={LayoutDashboard}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />

                <NavItem
                  href="/portal/commoner"
                  label="Commoner Registration"
                  icon={FolderOpenDot}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />

                {showUploads && (
                  <>
                    <div className="my-2 h-px bg-slate-100" />
                    <NavItem
                      href={uploadsHref}
                      label={uploadsLabel}
                      icon={UploadCloud}
                      pathname={pathname}
                      onNavigate={() => setOpen(false)}
                    />
                  </>
                )}
              </nav>

              {/* Decorative Footer inside Nav */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-[10px] text-slate-400">
                MaxWork Staffing Portal v0.1.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
