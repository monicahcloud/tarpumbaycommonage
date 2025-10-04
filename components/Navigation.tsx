// app/components/navigation.tsx (or wherever this lives)
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/public/logo.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

function navLinkClass(isActive: boolean) {
  return [
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "text-primary bg-muted"
      : "text-muted-foreground hover:text-primary hover:bg-muted/60",
  ].join(" ");
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setIsMenuOpen(false);

  const signedInLinks = [
    { href: "/docs", label: "Bylaws & Documents" },
    { href: "/news", label: "News & Announcements" },
    { href: "/events", label: "Upcoming Events/Meetings" },
  ];

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

          {/* Desktop nav + actions */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Show these links only when signed in */}
            <SignedIn>
              <div className="mr-2 flex items-center space-x-1">
                {signedInLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(pathname === item.href)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </SignedIn>

            {/* Signed-out actions */}
            <SignedOut>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/portal"
                fallbackRedirectUrl="/portal">
                <Button variant="outline" size="sm">
                  Member Portal
                </Button>
              </SignInButton>

              <Button asChild className="btn-hero" size="sm">
                <Link href="/portal">Apply Now</Link>
              </Button>
            </SignedOut>

            {/* Signed-in user menu */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}>
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
              {/* Signed-in: show the member-only links */}
              <SignedIn>
                {signedInLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={[
                        "block w-full rounded-md px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-muted text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-primary",
                      ].join(" ")}>
                      {item.label}
                    </Link>
                  );
                })}

                <div className="flex justify-center pt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>

              {/* Signed-out: sign in + apply */}
              <SignedOut>
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/portal"
                  fallbackRedirectUrl="/portal">
                  <Button className="w-full" size="sm" onClick={closeMenu}>
                    Sign In
                  </Button>
                </SignInButton>

                <Button
                  asChild
                  className="btn-hero w-full"
                  size="sm"
                  onClick={closeMenu}>
                  <Link href="/portal">Apply Now</Link>
                </Button>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
