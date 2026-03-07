"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Plane,
  Globe2,
  Users,
  ShieldCheck,
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Fragment, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth";
import { Separator } from "../ui/separator";

export type AdminNavbarUser = {
  first_name: string;
  last_name: string;
} | null;

const links = [
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/countries", label: "Countries", icon: Globe2 },
  { href: "/admin/visas", label: "Visas", icon: Plane },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.trim().charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.trim().charAt(0)?.toUpperCase() ?? "";
  return first + last || "A";
}

export default function AdminNavbar({ user }: { user: AdminNavbarUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));

  return (
    <nav className="sticky top-0 z-40 border-b border-primary-dark/20 bg-primary-dark/95 shadow-sm backdrop-blur w-full">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <LayoutDashboard className="h-5 w-5 text-white/90" />
            VisaPro
          </Link>
          <div className="hidden items-center gap-1.5 lg:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = isActiveLink(href);
              return (
                <Fragment key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                        : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                  {label === "Clients" && (
                    <div
                      className="h-6 w-px bg-white"
                    ></div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/90 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-primary-dark"
                aria-label="Admin menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  {getInitials(user?.first_name ?? "", user?.last_name ?? "")}
                </span>
                <span className="hidden text-sm text-white/80 sm:inline">
                  {user
                    ? `${user.first_name} ${user.last_name}`.trim() || "Admin"
                    : "Admin"}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-white/70 sm:inline" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="min-w-[160px] border-primary-dark/10 bg-white"
            >
              <form action={logout}>
                <DropdownMenuItem
                  asChild
                  variant="destructive"
                >
                  <button
                    type="submit"
                    className="flex w-full cursor-pointer items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div
        id="admin-mobile-nav"
        className={cn(
          "overflow-hidden border-t border-white/10 transition-[max-height] duration-300 lg:hidden",
          mobileOpen ? "max-h-[420px]" : "max-h-0",
        )}
      >
        <div className="space-y-1 px-4 py-3 sm:px-6">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = isActiveLink(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "inline-flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white ring-1 ring-white/20"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
