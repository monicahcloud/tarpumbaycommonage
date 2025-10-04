/* eslint-disable @typescript-eslint/no-explicit-any */
// components/MobileNav.tsx — tiny, pretty client menu with active state
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FolderOpenDot,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";

export default function MobileNav({ uploadsHref }: { uploadsHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const Item = ({
    href,
    children,
    icon: Icon,
  }: {
    href: string;
    children: React.ReactNode;
    icon: any;
  }) => {
    const active =
      pathname === href || (href !== "/portal" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-2 rounded-md px-3 py-2 ${
          active ? "bg-slate-900 text-white" : "hover:bg-slate-100"
        }`}>
        <Icon className="h-4 w-4" /> {children}
      </Link>
    );
  };

  return (
    <div className="md:hidden">
      <button
        aria-label="Toggle navigation"
        className="rounded-md p-2 hover:bg-slate-100"
        onClick={() => setOpen((v) => !v)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b bg-white/95 backdrop-blur">
          <nav className="mx-auto flex max-w-8xl flex-col gap-1 p-3 text-sm">
            <Item href="/portal" icon={LayoutDashboard}>
              Dashboard
            </Item>
            <Item href="/portal/application" icon={FolderOpenDot}>
              My Application
            </Item>
            <Item href={uploadsHref} icon={UploadCloud}>
              Manage Uploads
            </Item>
          </nav>
        </div>
      )}
    </div>
  );
}
