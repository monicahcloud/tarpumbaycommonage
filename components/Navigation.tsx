"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={logoImage}
              alt="Tarpum Bay Commonage Committee logo"
              width={250}
              height={56}
              className="rounded-md"
              priority
            />
          </Link>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <SignedOut>
              <SignInButton
                mode="modal"
                afterSignInUrl="/portal"
                afterSignUpUrl="/portal">
                <Button variant="outline" size="sm">
                  Member Portal
                </Button>
              </SignInButton>
              <Button asChild className="btn-hero" size="sm">
                <Link href="/portal/apply">Apply Now</Link>
              </Button>
            </SignedOut>

            {/* Signed in: only show the user menu */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50"
            aria-label="Toggle menu">
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-2">
              <SignedOut>
                <SignInButton
                  mode="modal"
                  afterSignInUrl="/portal"
                  afterSignUpUrl="/portal">
                  <Button className="w-full" size="sm" onClick={closeMenu}>
                    Sign In
                  </Button>
                </SignInButton>
                <Button
                  asChild
                  className="btn-hero w-full"
                  size="sm"
                  onClick={closeMenu}>
                  <Link href="/portal/apply">Apply Now</Link>
                </Button>
              </SignedOut>

              {/* Signed in: only the user menu */}
              <SignedIn>
                <div className="flex justify-center pt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
