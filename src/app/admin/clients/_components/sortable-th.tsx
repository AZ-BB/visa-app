"use client"

import Link from "next/link"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import type { ClientSortKey } from "@/actions/clients"
import { cn } from "@/lib/utils"

interface SortableThProps {
  column: ClientSortKey
  label: string
  currentSort: ClientSortKey
  currentSortDir: "asc" | "desc"
  baseParams: URLSearchParams
  className?: string
}

export function SortableTh({
  column,
  label,
  currentSort,
  currentSortDir,
  baseParams,
  className,
}: SortableThProps) {
  const isActive = currentSort === column
  const nextDir = isActive
    ? (currentSortDir === "asc" ? "desc" : "asc")
    : "asc"
  const nextSort = column

  const params = new URLSearchParams(baseParams.toString())
  params.set("page", "1")
  params.set("sort", nextSort)
  params.set("sort_dir", nextDir)
  const href = `/admin/clients?${params.toString()}`

  return (
    <th className={cn("py-3 pr-2 text-left", className)}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
          isActive ? "text-primary-copy" : "text-secondary-copy hover:text-primary-copy"
        )}
      >
        {label}
        {isActive ? (
          currentSortDir === "asc" ? (
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
