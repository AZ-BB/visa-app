"use client"

import Link from "next/link"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SortKey = "arrival_date" | "created_at" | "updated_at" | "status" | "client_name" | "total_fee"
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
  const href = `/admin/applications?${searchParams.toString()}`

  return (
    <th
      className={cn(
        "py-3 text-xs font-semibold uppercase tracking-wider text-secondary-copy",
        align === "right" ? "pr-5 text-right" : "pr-2 text-left",
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-primary-copy",
          isActive && "text-primary-copy"
        )}
      >
        {children}
        {isActive &&
          (currentOrder === "asc" ? (
            <ChevronUp className="size-4 shrink-0" />
          ) : (
            <ChevronDown className="size-4 shrink-0" />
          ))}
      </Link>
    </th>
  )
}
