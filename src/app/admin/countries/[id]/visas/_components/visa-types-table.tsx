"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { VisaStatusToggle } from "@/app/admin/visas/_components/visa-status-toggle"
import { CountryVisasActions } from "./country-visas-actions"
import { Input } from "@/components/ui/input"
import { fetchActiveProductCountsByVisaTypeIds } from "@/actions/products"
import {
  Eye,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SearchIcon,
  CalendarDays,
  DoorOpen,
  Clock,
  Loader2,
  Users,
} from "lucide-react"

interface VisaCountry {
  id: string
  name: string
  is_disabled: boolean
}

interface VisaType {
  id: number
  name: string
  destination_country: string
  is_disabled: boolean
  max_stay: number
  number_of_entries: number
  valid_for: string
  processing_fee: number
  gov_fee: number
  created_at: string
  updated_at: string
  destination_country_data: VisaCountry | null
}

type SortKey = "name" | "valid_for" | "entries" | "status" | "countries"
type SortOrder = "asc" | "desc"

interface VisaTypesTableProps {
  visas: VisaType[]
  countryId: string
}

export function VisaTypesTable({ visas: allVisas, countryId }: VisaTypesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [countryCounts, setCountryCounts] = useState<Record<number, number>>({})
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    const ids = allVisas.map((v) => v.id)
    if (ids.length === 0) {
      setStatsLoaded(true)
      return
    }
    fetchActiveProductCountsByVisaTypeIds(ids).then((res) => {
      if (res.data) setCountryCounts(res.data)
      setStatsLoaded(true)
    })
  }, [allVisas])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let result = allVisas

    if (term) {
      result = result.filter((visa) => visa.name.toLowerCase().includes(term))
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        switch (sortKey) {
          case "name":
            cmp = a.name.localeCompare(b.name)
            break
          case "valid_for":
            cmp = a.valid_for.localeCompare(b.valid_for)
            break
          case "entries":
            cmp = a.number_of_entries - b.number_of_entries
            break
          case "status":
            cmp = Number(a.is_disabled) - Number(b.is_disabled)
            break
          case "countries":
            cmp = (countryCounts[a.id] ?? 0) - (countryCounts[b.id] ?? 0)
            break
        }
        return sortOrder === "desc" ? -cmp : cmp
      })
    }

    return result
  }, [allVisas, searchTerm, sortKey, sortOrder, countryCounts])

  const hasSearch = searchTerm.trim().length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border-default px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:min-w-[300px] sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary-copy" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search visa types..."
              aria-label="Search visa types"
              className="h-9 rounded-lg border-border-default bg-white pl-9 pr-9 text-sm shadow-none transition focus-visible:border-primary focus-visible:ring-primary/20"
            />
          </div>
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-secondary-copy transition-colors hover:bg-bg-light-grey hover:text-primary-copy"
            >
              <X className="size-3.5" />
              Clear
            </button>
          )}
        </div>
        <p className="shrink-0 text-sm font-medium text-secondary-copy">
          {hasSearch
            ? `${filteredAndSorted.length} of ${allVisas.length} visas`
            : `${allVisas.length} ${allVisas.length === 1 ? "visa" : "visas"}`}
        </p>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/20 text-secondary-copy">
            <SearchIcon className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary-copy">
            {hasSearch ? "No matching visas" : "No visas found"}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-secondary-copy">
            {hasSearch
              ? "Try adjusting your search term to find what you\u2019re looking for."
              : "There are no visa types configured yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border-default bg-bg-light-grey/80">
                <th className="w-12 min-w-12 py-3 pl-4 sm:pl-5 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  #
                </th>
                <SortableHeader
                  label="Visa type"
                  column="name"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[140px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Valid for"
                  column="valid_for"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[100px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Entries / Max stay"
                  column="entries"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[140px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Status"
                  column="status"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[90px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Countries"
                  column="countries"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[90px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <th className="min-w-[72px] py-3 pl-2 pr-4 sm:pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy" />
              </tr>
            </thead>

            <tbody className="divide-y divide-border-default/60">
              {filteredAndSorted.map((visa, index) => (
                <tr
                  key={visa.id}
                  className="group transition-colors hover:bg-primary/[0.02]"
                >
                  <td className="w-12 min-w-12 py-3.5 pl-4 sm:pl-5 pr-3 sm:pr-2 text-xs tabular-nums text-secondary-copy">
                    {index + 1}
                  </td>

                  <td className="min-w-[140px] py-3.5 pl-2 pr-3 sm:pr-2">
                    <Link
                      href={`/admin/visas/${visa.id}`}
                      className="font-medium text-primary-copy transition-colors hover:text-primary block min-w-0 truncate"
                    >
                      {visa.name}
                    </Link>
                  </td>

                  <td className="min-w-[100px] py-3.5 pl-2 pr-3 sm:pr-2">
                    <div className="flex items-center gap-1.5 text-secondary-copy">
                      <CalendarDays className="size-3.5 shrink-0 opacity-50" />
                      <span className="truncate">{visa.valid_for}</span>
                    </div>
                  </td>

                  <td className="min-w-[140px] py-3.5 pl-2 pr-3 sm:pr-2">
                    <div className="flex items-center gap-3 text-secondary-copy whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <DoorOpen className="size-3.5 shrink-0 opacity-50" />
                        {visa.number_of_entries === -1
                          ? "Multiple"
                          : visa.number_of_entries}
                      </span>
                      <span className="text-border-default">/</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0 opacity-50" />
                        {visa.max_stay} days
                      </span>
                    </div>
                  </td>

                  <td className="min-w-[90px] py-3.5 pl-2 pr-3 sm:pr-2">
                    <VisaStatusToggle
                      visaId={visa.id}
                      visaName={visa.name}
                      isDisabled={visa.is_disabled}
                    />
                  </td>

                  <td className="min-w-[90px] py-3.5 pl-2 pr-3 sm:pr-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-primary-copy">
                      <Users className="size-3.5 text-secondary-copy/60" />
                      {statsLoaded ? (
                        countryCounts[visa.id] ?? 0
                      ) : (
                        <Loader2 className="size-3.5 animate-spin text-secondary-copy" />
                      )}
                    </span>
                  </td>

                  <td className="min-w-[72px] py-3.5 pl-2 pr-4 sm:pr-5 text-right">
                    <CountryVisasActions visa={visa} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SortableHeader({
  label,
  column,
  sortKey,
  sortOrder,
  onSort,
  align = "left",
  className,
}: {
  label: string
  column: SortKey
  sortKey: SortKey | null
  sortOrder: SortOrder
  onSort: (key: SortKey) => void
  align?: "left" | "right"
  className?: string
}) {
  const isActive = sortKey === column

  return (
    <th
      className={`py-3 text-xs font-semibold uppercase tracking-wider text-secondary-copy ${align === "right" ? "text-right" : "text-left"} ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-primary-copy ${isActive ? "text-primary-copy" : ""}`}
      >
        {label}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </button>
    </th>
  )
}
