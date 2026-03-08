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
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

const DEBOUNCE_MS = 100

interface CountriesSearchFormProps {
  className?: string
}

export function CountriesSearchForm({ className }: CountriesSearchFormProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status") ?? ""

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
    updateParams({ search: "", status: "" })
  }

  const hasFilters = search.trim() !== "" || (status && status !== "all")

  return (
    <div
      className={cn(
        "grid w-full min-w-0 grid-cols-1 gap-2 items-center font-medium sm:w-fit sm:grid-cols-2 lg:gap-3",
        hasFilters ? "sm:grid-cols-2 lg:grid-cols-[auto_auto_auto]" : "sm:grid-cols-[auto_auto]",
        className
      )}
    >
      <div className="relative min-w-0 w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search countries..."
          aria-label="Search countries"
          className="h-10 w-full pl-9 rounded-lg"
        />
      </div>

      <div className="min-w-[180px]">
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
          <SelectContent align="start" isContentMenuFullWidth={false}>
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
