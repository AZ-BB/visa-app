"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Menu, X, LogOut, ChevronDown, User, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "radix-ui";
import { logout } from "@/actions/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser";
import { useTranslations } from "next-intl";

const NAV_LINKS = [
  { labelKey: "testimonials", href: "#testimonials" },
  { labelKey: "howItWorks", href: "#how-it-works" },
  { labelKey: "featured", href: "#featured" },
  { labelKey: "faqs", href: "#faqs" },
];

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "";
}

export type AuthUser = {
  user_metadata?: { first_name?: string; last_name?: string };
  email?: string;
};

type NavbarClientProps = {
  user: AuthUser | null;
};

export function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex font-bold items-center gap-1 text-[32px] text-gray-800"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span>logo</span>
          <span className="text-orange-500">.</span>
        </Link>

        {/* Desktop nav */}
        {isHomePath(pathname) && (
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-secondary-copy transition hover:text-gray-900"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        )}
        {/* Desktop: Sign Up + Contact us / Avatar dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="rounded-2xl pl-3 pr-2 py-2 focus:outline-none flex items-center gap-2 border-2 border-gray-200/50 hover:border-primary/75 transition-colors duration-200"
                  aria-label="User menu"
                >
                  <User className="size-4" />

                  <span className="text-base font-semibold text-gray-900">
                    {user.user_metadata?.first_name}
                  </span>

                  <ChevronDown className="size-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="min-w-[180px] rounded-xl border border-gray-100 bg-white p-1 shadow-lg z-50"
                >
                  <DropdownMenu.Item asChild>
                    <Link href="/applications" className="focus:outline-none">
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <FileText className="size-4" />
                        {t("myApplications")}
                      </button>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link href="/account" className="focus:outline-none">
                      <button
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none hover:bg-gray-100 focus:bg-gray-100"
                      >
                        <User className="size-4" />
                        {t("myAccount")}
                      </button>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <button
                      onClick={async () => {
                        const supabase = createSupabaseBrowserClient();
                        await supabase.auth.signOut();
                        router.refresh();
                      }}
                      className="flex w-full text-red-600 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 focus:bg-gray-100"
                    >
                      <LogOut className="size-4" />
                      {t("logout")}
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <>
              <Link href="/contact-us">
                <Button variant="outline" className="rounded-lg px-5 py-2.5 text-sm">
                  {t("contactUs")}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="default" className="rounded-lg px-5 py-2.5 text-sm border-2 border-primary/60 hover:border-primary/75">
                  {t("login")}
                </Button>
              </Link>
            </>
          )}
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
          menuOpen ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {isHomePath(pathname) && (
            <div className="mb-2 pb-2 border-b border-gray-100 flex flex-col">
              {
                NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-base font-semibold text-primary-copy hover:text-gray-600"
                  >
                    {t(link.labelKey)}
                  </a>
                ))
              }
            </div>
          )}

          <div className="flex flex-col gap-2">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 py-2 text-lg font-semibold text-gray-900">
                  <div className="size-8 flex items-center justify-center rounded-full bg-gray-100">
                    <User className="size-5 text-gray-500" />
                  </div>
                  {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                </div>
                <Link
                  href="/applications"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="size-4" />
                  {t("myApplications")}
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <User className="size-4" />
                  {t("myAccount")}
                </Link>
                <form action={logout} className="w-full">
                  <button
                    type="submit"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    {t("logout")}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full rounded-lg px-5 py-2.5 text-sm"
                  asChild
                >
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    {t("login")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-lg px-5 py-2.5 text-sm"
                  asChild
                >
                  <Link href="/contact-us" onClick={() => setMenuOpen(false)}>
                    {t("contactUs")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
