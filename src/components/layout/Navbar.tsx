"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Testimonials", href: "#testimonials" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Featured", href: "#featured" },
  { label: "FAQs", href: "#faqs" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="flex font-bold items-center gap-1 text-[32px] text-gray-800"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span>logo</span>
          <span className="text-orange-500">.</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-secondary-copy transition hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Contact us */}
        <div className="hidden md:block">
          <Link href="/contact-us">
            <Button variant="outline" className="rounded-lg px-5 py-2.5 text-sm">
              Contact us
            </Button>
          </Link>
        </div>

        {/* Mobile: hamburger / close button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          {menuOpen ? (
            <X className="size-6" aria-hidden />
          ) : (
            <Menu className="size-6" aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-b border-gray-100 bg-white",
          menuOpen ? "max-h-[350px]" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-base font-semibold text-primary-copy hover:text-gray-600"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full rounded-lg px-5 py-2.5 text-sm"
              asChild
            >
              <Link href="/contact-us" onClick={() => setMenuOpen(false)}>
                Contact us
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
