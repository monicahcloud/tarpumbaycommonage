"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const signedInLinks = [{ href: "/documents", label: "Documents & Minutes" }];

  return (
    <nav
      className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand - Scaled for impact */}
          <Link
            href="/"
            className="relative z-10 hover:opacity-80 transition-opacity">
            <Image
              src={logoImage}
              alt="Logo"
              width={220}
              height={50}
              className="h-auto w-auto max-h-[45px] object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <SignedIn>
              <div className="flex items-center gap-2 mr-4">
                {signedInLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                      pathname === item.href
                        ? "bg-emerald-500 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </SignedIn>

            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/portal">
                  <button className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors px-4">
                    Member Login
                  </button>
                </SignInButton>

                <Button
                  asChild
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 group">
                  <Link href="/portal">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Portal
                  </span>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox:
                          "h-9 w-9 ring-2 ring-emerald-500/20",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <SignedIn>
                {signedInLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="block text-lg font-bold text-slate-900">
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Account Settings
                  </span>
                  <UserButton />
                </div>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full rounded-full py-6 font-bold"
                    onClick={closeMenu}>
                    Member Login
                  </Button>
                </SignInButton>
                <Button
                  asChild
                  className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-6 font-bold"
                  onClick={closeMenu}>
                  <Link href="/portal">Apply Now</Link>
                </Button>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
