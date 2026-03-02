"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState, useTransition } from "react"
import { Search, X, Loader2, ChevronsUpDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CountryFlag } from "@/components/ui/country-flag"
import { cn } from "@/lib/utils"

interface VisasSearchFormProps {
  defaultSearch?: string
  defaultStatus?: string
  defaultCountry?: string
  countries: { id: string; name: string }[]
  className?: string
}

export function VisasSearchForm({
  defaultSearch = "",
  defaultStatus = "all",
  defaultCountry = "",
  countries,
  className,
}: VisasSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(defaultSearch)
  const [status, setStatus] = useState(defaultStatus)
  const [country, setCountry] = useState(defaultCountry)
  const [isPending, startTransition] = useTransition()
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  const selectedCountry = countries.find((c) => c.id === country)

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase().trim()
    if (!q) return countries
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    )
  }, [countrySearch, countries])

  const navigate = useCallback(
    (searchVal: string, statusVal: string, countryVal: string) => {
      const params = new URLSearchParams()
      if (searchVal.trim()) params.set("search", searchVal.trim())
      if (statusVal && statusVal !== "all") params.set("status", statusVal)
      if (countryVal) params.set("country", countryVal)
      const pageSize = searchParams.get("pageSize")
      if (pageSize) params.set("pageSize", pageSize)
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `/admin/visas?${qs}` : "/admin/visas")
      })
    },
    [router, searchParams]
  )

  const handleStatusChange = (val: string) => {
    setStatus(val)
    navigate(search, val, country)
  }

  const handleCountrySelect = (val: string) => {
    const next = val === country ? "" : val
    setCountry(next)
    setCountryOpen(false)
    setCountrySearch("")
    navigate(search, status, next)
  }

  const handleClear = () => {
    setSearch("")
    setStatus("all")
    setCountry("")
    setCountrySearch("")
    navigate("", "all", "")
  }

  const hasFilters = search.trim() !== "" || status !== "all" || country !== ""

  return (
    <form
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate(search, status, country)
      }}
    >
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search visa name..."
          aria-label="Search visas"
          className="h-9 rounded-lg border-border-default bg-white pl-9 text-sm shadow-none transition focus-visible:border-primary focus-visible:ring-primary/20"
        />
      </div>

      {/* Country dropdown */}
      <Popover open={countryOpen} onOpenChange={setCountryOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={countryOpen}
            aria-label="Filter by country"
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border border-border-default bg-white px-3 text-sm outline-none transition-colors hover:border-primary/40",
              "focus:border-primary focus:ring-1 focus:ring-primary/30",
              selectedCountry ? "text-primary-copy" : "text-secondary-copy"
            )}
          >
            {selectedCountry ? (
              <>
                <CountryFlag
                  code={selectedCountry.id}
                  className="size-4 shrink-0 rounded-sm shadow-sm ring-1 ring-black/5"
                  round={false}
                />
                <span className="max-w-[120px] truncate">{selectedCountry.name}</span>
              </>
            ) : (
              <span>All countries</span>
            )}
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[60] w-64 border-border-default bg-white p-0 shadow-lg"
        >
          <div className="border-b border-border-default p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-secondary-copy/60" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className="h-8 w-full rounded-md border border-border-default bg-bg-light-grey pl-8 pr-3 text-sm text-primary-copy placeholder:text-secondary-copy/50 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => handleCountrySelect("")}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                !country
                  ? "bg-primary/5 font-medium text-primary"
                  : "text-primary-copy hover:bg-bg-light-grey"
              )}
            >
              <span className="flex size-5 items-center justify-center">
                {!country && <Check className="size-3.5 text-primary" />}
              </span>
              All countries
            </button>
            {filteredCountries.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCountrySelect(c.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                  country === c.id
                    ? "bg-primary/5 font-medium text-primary"
                    : "text-primary-copy hover:bg-bg-light-grey"
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {country === c.id && <Check className="size-3.5 text-primary" />}
                </span>
                <CountryFlag
                  code={c.id}
                  className="size-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/5"
                  round={false}
                />
                <span className="flex-1 truncate text-left">{c.name}</span>
                <span className="text-xs text-secondary-copy">{c.id}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="py-4 text-center text-sm text-secondary-copy">
                No countries found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        aria-label="Filter by status"
        className="h-9 rounded-lg border border-border-default bg-white px-3 text-sm text-primary-copy outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
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
