"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { ApplicationStatus } from "@/enums"
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge"

const DEBOUNCE_MS = 100

interface AdminOption {
  id: string
  first_name: string
  last_name: string
}

interface CountryOption {
  id: string
  name: string
}

interface ApplicationsFiltersProps {
  admins: AdminOption[]
  countries: CountryOption[]
  refunded?: string
}

export default function ApplicationsFilters({ admins, countries, refunded = "" }: ApplicationsFiltersProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status") ?? ""
  const assignedTo = searchParams.get("assigned_to_id") ?? ""
  const destination = searchParams.get("destination") ?? ""
  const nationality = searchParams.get("nationality") ?? ""
  const refundedParam = searchParams.get("refunded") || refunded || ""

  const [searchValue, setSearchValue] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
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
        updateParams({ search: trimmed })
      }
      debounceRef.current = undefined
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, search, updateParams])

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[50fr_30fr_30fr_30fr_30fr_30fr] items-center gap-3 font-medium">
      <div className="relative min-w-0">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search client, travellers, visa, email..."
          aria-label="Search applications"
          className="h-10 w-full pl-9 rounded-lg"
        />
      </div>

      <div className="min-w-0">
        <Select
          value={status || "all"}
          onValueChange={(v) => updateParams({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full rounded-lg px-3 text-base shadow-none",
              (status || "all") === "all" && "text-secondary-copy"
            )}
            size="sm"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem className="font-medium" value="all">All Statuses</SelectItem>
              <SelectItem className="font-medium" value={ApplicationStatus.NOT_STARTED}><ApplicationStatusBadge status={ApplicationStatus.NOT_STARTED} /></SelectItem>
              <SelectItem className="font-medium" value={ApplicationStatus.IN_PROGRESS}><ApplicationStatusBadge status={ApplicationStatus.IN_PROGRESS} /></SelectItem>
              <SelectItem className="font-medium" value={ApplicationStatus.COMPLETED}><ApplicationStatusBadge status={ApplicationStatus.COMPLETED} /></SelectItem>
              <SelectItem className="font-medium" value={ApplicationStatus.REJECTED}><ApplicationStatusBadge status={ApplicationStatus.REJECTED} /></SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0">
        <Select
          value={assignedTo || "all"}
          onValueChange={(v) => updateParams({ assigned_to_id: v === "all" ? "" : v })}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full rounded-lg px-3 text-base shadow-none",
              (assignedTo || "all") === "all" && "text-secondary-copy"
            )}
            size="sm"
          >
            <SelectValue placeholder="Assigned to" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem className="font-medium" value="all">All Admins</SelectItem>
              <SelectItem className="font-medium" value="__unassigned__">Unassigned</SelectItem>
              {admins.map((a) => (
                <SelectItem key={a.id} className="font-medium" value={a.id}>
                  {a.first_name} {a.last_name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0">
        <CountryDropdown
          values={[{ id: "", name: "All Destinations" }, ...countries]}
          value={destination || ""}
          onValueChange={(v) => updateParams({ destination: v })}
          placeholder="All Destinations"
          aria-label="Filter by destination"
          className="h-9 min-h-10 w-full rounded-lg border-border-default px-3 py-2 text-base"
        />
      </div>

      <div className="min-w-0">
        <CountryDropdown
          values={[{ id: "", name: "All Nationalities" }, ...countries]}
          value={nationality || ""}
          onValueChange={(v) => updateParams({ nationality: v })}
          placeholder="All Nationalities"
          aria-label="Filter by nationality"
          className="h-9 min-h-10 w-full rounded-lg border-border-default px-3 py-2 text-base"
        />
      </div>

      <div className="min-w-0">
        <Select
          value={refundedParam || "all"}
          onValueChange={(v) => updateParams({ refunded: v === "all" ? "" : v })}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full rounded-lg px-3 text-base shadow-none",
              (refundedParam || "all") === "all" && "text-secondary-copy"
            )}
            size="sm"
          >
            <SelectValue placeholder="Refunded" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem className="font-medium" value="all">All</SelectItem>
              <SelectItem className="font-medium" value="refunded_only">Refunded only</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
