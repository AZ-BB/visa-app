"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ClientSortKey } from "@/actions/clients"

interface ClientsSearchFormProps {
  defaultSearch?: string
  defaultSort?: ClientSortKey
  defaultSortDir?: "asc" | "desc"
  defaultHasApplications?: "all" | "yes"
  className?: string
}

export function ClientsSearchForm({
  defaultSearch = "",
  defaultSort = "created_at",
  defaultSortDir = "desc",
  defaultHasApplications = "all",
  className,
}: ClientsSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(defaultSearch)
  const [hasApplications, setHasApplications] = useState<"all" | "yes">(defaultHasApplications)
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (searchVal: string, filterVal: "all" | "yes", preserveSort = true) => {
      const params = new URLSearchParams()
      if (searchVal.trim()) params.set("search", searchVal.trim())
      if (filterVal !== "all") params.set("has_applications", filterVal)
      if (preserveSort) {
        if (defaultSort !== "created_at") params.set("sort", defaultSort)
        if (defaultSortDir !== "desc") params.set("sort_dir", defaultSortDir)
      }
      params.set("page", "1")
      const pageSize = searchParams.get("page_size")
      if (pageSize) params.set("page_size", pageSize)
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `/admin/clients?${qs}` : "/admin/clients")
      })
    },
    [router, searchParams, defaultSort, defaultSortDir]
  )

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as "all" | "yes"
    setHasApplications(val)
    navigate(search, val)
  }

  const handleClear = () => {
    setSearch("")
    setHasApplications("all")
    navigate("", "all", false)
  }

  const hasFilters = search.trim() !== "" || hasApplications !== "all"

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate(search, hasApplications)
      }}
    >
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search clients"
          className="h-9 rounded-lg border-border-default bg-white pl-9 text-sm shadow-none transition focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </div>

      <select
        value={hasApplications}
        onChange={handleFilterChange}
        aria-label="Filter by applications"
        className="h-9 rounded-lg border border-border-default bg-white px-3 text-sm text-primary-copy outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
      >
        <option value="all">All clients</option>
        <option value="yes">Has applications</option>
      </select>

      <Button
        type="submit"
        size="sm"
        className="h-9 rounded-lg bg-primary px-4 text-white shadow-none transition hover:bg-primary/90"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : "Search"}
      </Button>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-lg px-3 text-secondary-copy hover:bg-muted/10 hover:text-primary-copy"
          onClick={handleClear}
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </form>
  )
}
