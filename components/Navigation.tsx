"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logoImage from "@/public/logo.png"; // ensure logo.png is in /public

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src={logoImage}
                alt="Tarpum Bay Commonage Committee logo"
                width={300}
                height={56}
                className="rounded-md"
                priority
              />
            </Link>
          </div>

          {/* CTA Buttons (desktop) */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link href="/portal">
              <Button variant="outline" size="sm">
                Member Portal
              </Button>
            </Link>
            <Link href="/apply">
              <Button className="btn-hero" size="sm">
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50">
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="pt-4 pb-2 space-y-2">
                <Link href="/portal" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Member Portal
                  </Button>
                </Link>
                <Link href="/apply" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-hero w-full" size="sm">
                    Apply Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
