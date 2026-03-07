"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaRequiredToggle } from "../../_components/visa-required-toggle"
import { SupportedToggle } from "../../_components/supported-toggle"
import { Input } from "@/components/ui/input"
import { fetchProductStatsByVisaRuleIds } from "@/actions/products"
import {
  ArrowRight,
  Eye,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SearchIcon,
  Loader2,
} from "lucide-react"

interface CountryDetails {
  id: string
  name: string
  is_disabled: boolean
  created_at: string
  updated_at: string
}

interface VisaRule {
  id: number
  nationality: string
  destination_country: string
  is_supported: boolean
  is_visa_required: boolean
  created_at: string
  updated_at: string
  nationality_country_data: CountryDetails | null
  destination_country_data: CountryDetails | null
}

type SortKey =
  | "nationality"
  | "destination"
  | "visa_req"
  | "supported"
  | "visa_types"

type SortOrder = "asc" | "desc"

interface VisaRulesTableProps {
  rules: VisaRule[]
  countryId: string
  resolvedView: "destination" | "nationality"
}

export function VisaRulesTable({
  rules: allRules,
  countryId,
  resolvedView,
}: VisaRulesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [productCounts, setProductCounts] = useState<Record<number, number>>({})
  const [visaTypeCounts, setVisaTypeCounts] = useState<Record<number, number>>({})
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    const ruleIds = allRules.map((r) => r.id)
    if (ruleIds.length === 0) {
      setStatsLoaded(true)
      return
    }
    fetchProductStatsByVisaRuleIds(ruleIds).then((res) => {
      if (res.data) {
        setProductCounts(res.data.productCounts)
        setVisaTypeCounts(res.data.visaTypeCounts)
      }
      setStatsLoaded(true)
    })
  }, [allRules])

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
    let result = allRules

    if (term) {
      result = result.filter((rule) => {
        const natName =
          rule.nationality_country_data?.name?.toLowerCase() ?? ""
        const destName =
          rule.destination_country_data?.name?.toLowerCase() ?? ""
        const natCode = rule.nationality.toLowerCase()
        const destCode = rule.destination_country.toLowerCase()
        return (
          natName.includes(term) ||
          destName.includes(term) ||
          natCode.includes(term) ||
          destCode.includes(term)
        )
      })
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let cmp = 0
        switch (sortKey) {
          case "nationality":
            cmp = (
              a.nationality_country_data?.name ?? a.nationality
            ).localeCompare(
              b.nationality_country_data?.name ?? b.nationality
            )
            break
          case "destination":
            cmp = (
              a.destination_country_data?.name ?? a.destination_country
            ).localeCompare(
              b.destination_country_data?.name ?? b.destination_country
            )
            break
          case "visa_req":
            cmp = Number(a.is_visa_required) - Number(b.is_visa_required)
            break
          case "supported":
            cmp = Number(a.is_supported) - Number(b.is_supported)
            break
          case "visa_types":
            cmp =
              (visaTypeCounts[a.id] ?? 0) - (visaTypeCounts[b.id] ?? 0)
            break
        }
        return sortOrder === "desc" ? -cmp : cmp
      })
    }

    return result
  }, [allRules, searchTerm, sortKey, sortOrder, visaTypeCounts])

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
              placeholder="Search by name or code..."
              aria-label="Search visa rules"
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
            ? `${filteredAndSorted.length} of ${allRules.length} rules`
            : `${allRules.length} ${allRules.length === 1 ? "rule" : "rules"}`}
        </p>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/20 text-secondary-copy">
            <SearchIcon className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary-copy">
            {hasSearch ? "No matching rules" : "No visa rules found"}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-secondary-copy">
            {hasSearch
              ? "Try adjusting your search term to find what you\u2019re looking for."
              : "There are no visa rules configured for this view yet."}
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
                  label="Nationality"
                  column="nationality"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[130px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <th className="w-10 min-w-10 px-0 text-center text-xs text-secondary-copy/50" />
                <SortableHeader
                  label="Destination"
                  column="destination"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[130px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Visa Req."
                  column="visa_req"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[180px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Supported"
                  column="supported"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="min-w-[90px] py-3 pl-2 pr-3 sm:pr-2"
                />
                <SortableHeader
                  label="Visas"
                  column="visa_types"
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                  className="min-w-[80px] py-3 pl-2 pr-4 sm:pr-5"
                />
              </tr>
            </thead>

            <tbody className="divide-y divide-border-default/60">
              {filteredAndSorted.map((rule, index) => {
                const nationalityCountry = rule.nationality_country_data
                const destinationCountry = rule.destination_country_data
                const otherId =
                  resolvedView === "destination"
                    ? rule.nationality
                    : rule.destination_country

                const isCurrentNationality = rule.nationality === countryId
                const isCurrentDestination =
                  rule.destination_country === countryId

                return (
                  <tr
                    key={rule.id}
                    className="group transition-colors hover:bg-primary/2"
                  >
                    <td className="w-12 min-w-12 py-3.5 pl-4 sm:pl-5 pr-3 sm:pr-2 text-xs tabular-nums text-secondary-copy">
                      {index + 1}
                    </td>

                    <td className="min-w-[130px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <CountryFlag
                          code={rule.nationality}
                          className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                          round={false}
                        />
                        <span
                          className={`min-w-0 truncate ${isCurrentNationality ? "font-semibold text-primary-copy" : "font-medium text-primary-copy"}`}
                        >
                          {nationalityCountry?.name ?? rule.nationality}
                        </span>
                        {isCurrentNationality && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="w-10 min-w-10 px-0 text-center">
                      <ArrowRight className="mx-auto size-3.5 text-secondary-copy/40" />
                    </td>

                    <td className="min-w-[130px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <CountryFlag
                          code={rule.destination_country}
                          className="size-6 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                          round={false}
                        />
                        <span
                          className={`min-w-0 truncate ${isCurrentDestination ? "font-semibold text-primary-copy" : "font-medium text-primary-copy"}`}
                        >
                          {destinationCountry?.name ??
                            rule.destination_country}
                        </span>
                        {isCurrentDestination && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="min-w-[180px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <VisaRequiredToggle
                        ruleId={rule.id}
                        isVisaRequired={rule.is_visa_required}
                        activeProductCount={productCounts[rule.id] ?? 0}
                        nationalityName={
                          nationalityCountry?.name ?? rule.nationality
                        }
                        destinationName={
                          destinationCountry?.name ??
                          rule.destination_country
                        }
                      />
                    </td>

                    <td className="min-w-[90px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <SupportedToggle
                        ruleId={rule.id}
                        isSupported={rule.is_supported}
                        activeProductCount={productCounts[rule.id] ?? 0}
                        nationalityName={
                          nationalityCountry?.name ?? rule.nationality
                        }
                        destinationName={
                          destinationCountry?.name ??
                          rule.destination_country
                        }
                      />
                    </td>

                    <td className="min-w-[80px] py-3.5 pl-2 pr-4 sm:pr-5 text-right">
                      <Link
                        href={`/admin/countries/${countryId}/nationality/${otherId}?view_as=${resolvedView}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30 whitespace-nowrap"
                      >
                        <Eye className="size-3.5" />
                        Visas
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-light-grey px-1.5 text-[10px] font-semibold tabular-nums text-secondary-copy">
                          {statsLoaded ? (
                            visaTypeCounts[rule.id] ?? 0
                          ) : (
                            <Loader2 className="size-3 animate-spin" />
                          )}
                        </span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
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
