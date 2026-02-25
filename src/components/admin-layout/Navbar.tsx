"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/visas", label: "Visas" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/fees", label: "Fees" },
]

export default function AdminNavbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 border-b border-primary-dark/20 bg-primary-dark shadow-sm">
      <div className="mx-auto flex h-14 w-[100vw] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            Visa Admin
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            {links.map(({ href, label }) => {
              const isActive =
                pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
            A
          </span>
          <span className="hidden text-sm text-white/80 sm:inline">Admin</span>
        </div>
      </div>
    </nav>
  )
}
