"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

const DEBOUNCE_MS = 100

interface VisasSearchFormProps {
  countries: { id: string; name: string }[]
  className?: string
}

export function VisasSearchForm({ countries, className }: VisasSearchFormProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status") ?? ""
  const country = searchParams.get("country") ?? ""

  const [searchValue, setSearchValue] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastPushedSearchRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastPushedSearchRef.current !== null && lastPushedSearchRef.current === search) {
      lastPushedSearchRef.current = null
      return
    }
    setSearchValue(search)
  }, [search])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            params.set(key, value)
          } else {
            params.delete(key)
          }
        })
        params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = searchValue.trim()
      if (trimmed !== search) {
        lastPushedSearchRef.current = trimmed
        updateParams({ search: trimmed })
      }
      debounceRef.current = undefined
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, search, updateParams])

  const handleClear = () => {
    setSearchValue("")
    updateParams({ search: "", status: "", country: "" })
  }

  const hasFilters = search.trim() !== "" || (status && status !== "all") || country !== ""

  return (
    <div
      className={cn(
        "grid w-full min-w-0 grid-cols-1 gap-2 items-center font-medium sm:w-fit sm:grid-cols-2 lg:gap-3",
        hasFilters ? "lg:grid-cols-[auto_auto_auto_auto]" : "lg:grid-cols-[auto_auto_auto]",
        className
      )}
    >
      <div className="relative min-w-0 w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search visa name..."
          aria-label="Search visas"
          className="h-10 w-full pl-9 rounded-lg"
        />
      </div>

      <div className="min-w-[300px]">
        <CountryDropdown
          values={[{ id: "", name: "All countries" }, ...countries]}
          value={country}
          onValueChange={(v) => updateParams({ country: v })}
          placeholder="All countries"
          aria-label="Filter by country"
          className="h-9 min-h-10 w-full rounded-lg border-border-default px-3 py-2 text-sm"
        />
      </div>

      <div className="min-w-[200px]">
        <Select
          value={status || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full rounded-lg px-3 text-sm shadow-none",
              (status || "all") === "all" && "text-secondary-copy"
            )}
            size="sm"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem className="font-medium" value="all">All statuses</SelectItem>
              <SelectItem className="font-medium" value="active">Active only</SelectItem>
              <SelectItem className="font-medium" value="disabled">Disabled only</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="min-w-0 lg:justify-self-end">
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
        </div>
      )}
    </div>
  )
}
