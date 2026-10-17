"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Scale, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === "/";

  const homeLinks = [
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Advocates", href: "#advocates" },
    { label: "About Us", href: "/about" },
  ];

  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "Find Advocates", href: "/advocates" },
    { label: "Legal Checker", href: "/legal-checker" },
    { label: "About Us", href: "/about" },
  ];

  const links = isHome ? homeLinks : publicLinks;

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center bg-slate-950 text-white">
            <Scale size={23} strokeWidth={2} />
          </div>

          <div>
            <div className="text-xl font-bold tracking-tight text-slate-950">
              LegalConnect
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Legal Platform
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = isActive(link.href);

            return link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${
                  active
                    ? "font-semibold text-slate-950"
                    : "font-medium text-slate-600 hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login"
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get Started
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
            <div className="flex flex-col">
              {links.map((link) => {
                const active = isActive(link.href);

                return link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="border-b border-slate-100 px-2 py-3.5 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className={`border-b border-slate-100 px-2 py-3.5 text-sm transition ${
                      active
                        ? "font-semibold text-slate-950"
                        : "font-medium text-slate-700 hover:text-slate-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="flex gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="flex-1 border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  onClick={closeMobile}
                  className="flex-1 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
