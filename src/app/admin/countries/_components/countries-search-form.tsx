"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CountriesSearchFormProps {
  defaultValue?: string
  defaultStatus?: string
  className?: string
}

export function CountriesSearchForm({
  defaultValue = "",
  defaultStatus = "all",
  className,
}: CountriesSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [status, setStatus] = useState(defaultStatus)
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (searchVal: string, statusVal: string) => {
      const params = new URLSearchParams()
      if (searchVal.trim()) {
        params.set("search", searchVal.trim())
      }
      if (statusVal && statusVal !== "all") {
        params.set("status", statusVal)
      }
      const pageSize = searchParams.get("pageSize")
      if (pageSize) {
        params.set("pageSize", pageSize)
      }
      const queryString = params.toString()
      startTransition(() => {
        router.push(queryString ? `/admin/countries?${queryString}` : "/admin/countries")
      })
    },
    [router, searchParams]
  )

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    navigate(value, newStatus)
  }

  const handleClear = () => {
    setValue("")
    setStatus("all")
    navigate("", "all")
  }

  const hasFilters = value.trim() !== "" || status !== "all"

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate(value, status)
      }}
    >
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search countries..."
          aria-label="Search countries"
          className="h-9 rounded-lg border-border-default bg-white pl-9 text-sm shadow-none transition focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </div>

      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        aria-label="Filter by status"
        className="h-9 rounded-lg border border-border-default bg-white px-3 text-sm text-primary-copy focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      >
        <option value="all">All statuses</option>
        <option value="active">Active only</option>
        <option value="disabled">Disabled only</option>
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
