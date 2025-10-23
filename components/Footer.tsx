// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo + About */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {/* Replace /logo.png with your logo file inside /public */}
              <Image
                src="/logo.png"
                alt="Tarpum Bay Commonage Committee Logo"
                width={400}
                height={200}
                className="h-10 w-100 object-contain"
              />
              <span className="font-bold"></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Serving the Tarpum Bay community with transparent governance and
              fair land management since our establishment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  About Us
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/docs"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  Bylaws &amp; Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  News &amp; Announcements
                </Link>
              </li> */}
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/portal"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  Land Allocation Application
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  className="transition-colors hover:text-foreground text-muted-foreground">
                  Member Portal
                </Link>
              </li>
              {/* <li>
                <span className="text-muted-foreground">
                  Community Meetings
                </span>
              </li> */}
              {/* <li>
                <span className="text-muted-foreground">Document Services</span>
              </li> */}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Contact Information</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Tarpum Bay, Eleuthera, Bahamas</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <a
                  href="mailto:tbaycommonagecontact@gmail.com"
                  className="transition-colors hover:text-foreground">
                  tbaycommonagecontact@gmail.com
                </a>
              </div>
              {/* <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>+1 (242) 555-0123</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {year} Tarpum Bay Commonage Committee. All rights reserved.{" "}
            {" | "}
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            {" | "}
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </p>
          <p className="mt-1">
            Website designed and developed by{" "}
            <a
              href="https://vitanovadesigns.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-gray-800 hover:text-black">
              VitaVova Designs
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
