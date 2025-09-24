"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logoImage from "@/public/logo.png"; // ensure logo.png is in /public

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //const navItems = [
  // { name: "Home", href: "/", icon: Home },
  // { name: "About", href: "/about", icon: Info },
  // { name: "Bylaws & Docs", href: "/docs", icon: FileText },
  // { name: "News", href: "/news", icon: Users },
  // { name: "FAQ", href: "/faq", icon: FileText },
  // { name: "Contact", href: "/contact", icon: Phone },
  // ];

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
                width={300} // larger size
                height={56}
                className="rounded-md"
                priority
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          {/* <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div> */}

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Member Portal
            </Button>
            <Button className="btn-hero" size="sm">
              Apply Now
            </Button>
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
              {/* {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/50"
                  onClick={() => setIsMenuOpen(false)}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))} */}
              <div className="pt-4 pb-2 space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Member Portal
                </Button>
                <Button className="btn-hero w-full" size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
