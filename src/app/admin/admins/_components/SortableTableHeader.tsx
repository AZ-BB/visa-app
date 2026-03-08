"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SortKey = "first_name" | "role" | "created_at" | "updated_at"
type SortOrder = "asc" | "desc"

interface SortableTableHeaderProps {
  sortKey: SortKey
  currentSort: SortKey
  currentOrder: SortOrder
  params: Record<string, string | undefined>
  children: React.ReactNode
  className?: string
  align?: "left" | "right"
}

export function SortableTableHeader({
  sortKey,
  currentSort,
  currentOrder,
  params,
  children,
  className,
  align = "left",
}: SortableTableHeaderProps) {
  const pathname = usePathname()
  const isActive = currentSort === sortKey
  const nextOrder: SortOrder = isActive && currentOrder === "desc" ? "asc" : "desc"

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value)
    }
  })
  searchParams.set("sort", sortKey)
  searchParams.set("order", nextOrder)
  searchParams.set("page", "1")
  const href = `${pathname}?${searchParams.toString()}`

  return (
    <th
      className={cn(
        "py-3 pr-2 text-left",
        align === "right" && "pr-5 text-right",
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
          isActive ? "text-primary-copy" : "text-secondary-copy hover:text-primary-copy"
        )}
      >
        {children}
        {isActive ? (
          currentOrder === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </Link>
    </th>
  )
}
