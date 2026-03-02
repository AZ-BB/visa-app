import Link from "next/link"
import { fetchVisas } from "@/actions/visas"
import { fetchAllCountriesList } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaStatusToggle } from "./_components/visa-status-toggle"
import { VisasSearchForm } from "./_components/visas-search-form"
import {
  Eye,
  Search as SearchIcon,
  CalendarDays,
  DoorOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

export default async function VisasPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    country?: string
    status?: string
    page?: string
    pageSize?: string
  }>
}) {
  const params = await searchParams
  const parsedPage = Number(params.page)
  const parsedPageSize = Number(params.pageSize)
  const statusFilter =
    params.status === "active" || params.status === "disabled"
      ? params.status
      : "all"

  const [visasResponse, countriesResponse] = await Promise.all([
    fetchVisas({
      search: params.search,
      page: Number.isFinite(parsedPage) ? parsedPage : undefined,
      pageSize: Number.isFinite(parsedPageSize) ? parsedPageSize : undefined,
      status: statusFilter,
      country: params.country,
    }),
    fetchAllCountriesList(),
  ])

  if (visasResponse.error || !visasResponse.data) {
    throw new Error(visasResponse.error ?? "Failed to fetch visas")
  }

  const {
    visas,
    total,
    page: currentPage,
    totalPages,
    pageSize: currentPageSize,
  } = visasResponse.data

  const allCountries = countriesResponse.data ?? []
  const fromItem = visas.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1
  const toItem = visas.length === 0 ? 0 : fromItem + visas.length - 1

  const getPageHref = (targetPage: number) => {
    const p = new URLSearchParams()
    if (params.search?.trim()) p.set("search", params.search.trim())
    if (statusFilter !== "all") p.set("status", statusFilter)
    if (params.country?.trim()) p.set("country", params.country.trim())
    if (currentPageSize !== 20) p.set("pageSize", String(currentPageSize))
    if (targetPage > 1) p.set("page", String(targetPage))
    const qs = p.toString()
    return qs ? `/admin/visas?${qs}` : "/admin/visas"
  }

  const getVisiblePages = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-copy">Visa types</h1>
        <p className="mt-0.5 text-sm text-secondary-copy">
          Manage all visa types across destinations
        </p>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-border-default px-5 py-3">
          <VisasSearchForm
            key={`${params.search ?? ""}-${statusFilter}-${params.country ?? ""}`}
            defaultSearch={params.search ?? ""}
            defaultStatus={statusFilter}
            defaultCountry={params.country ?? ""}
            countries={allCountries}
          />
        </div>

        {/* Table */}
        {visas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
              <SearchIcon className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-primary-copy">
              No visas found
            </h3>
            <p className="mt-1 max-w-xs text-sm text-secondary-copy">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-light-grey/80">
                  <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    #
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Visa type
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Destination
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Valid for
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Entries / Max stay
                  </th>
                  <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Status
                  </th>
                  <th className="w-24 py-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/60">
                {visas.map((visa, index) => (
                  <tr
                    key={visa.id}
                    className="group transition-colors hover:bg-primary/[0.02]"
                  >
                    <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                      {fromItem + index}
                    </td>

                    <td className="py-3.5 pr-2">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="font-medium text-primary-copy transition-colors hover:text-primary"
                      >
                        {visa.name}
                      </Link>
                    </td>

                    <td className="py-3.5 pr-2">
                      <Link
                        href={`/admin/countries/${visa.destination_country}`}
                        className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                      >
                        <CountryFlag
                          code={visa.destination_country}
                          className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                          round={false}
                        />
                        <span className="text-primary-copy">
                          {visa.destination_country_data?.name ?? visa.destination_country}
                        </span>
                      </Link>
                    </td>

                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-1.5 text-secondary-copy">
                        <CalendarDays className="size-3.5 shrink-0 opacity-50" />
                        {visa.valid_for}
                      </div>
                    </td>

                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-3 text-secondary-copy">
                        <span className="inline-flex items-center gap-1.5">
                          <DoorOpen className="size-3.5 shrink-0 opacity-50" />
                          {visa.number_of_entries}
                        </span>
                        <span className="text-border-default">/</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0 opacity-50" />
                          {visa.max_stay} days
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2">
                      <VisaStatusToggle
                        visaId={visa.id}
                        visaName={visa.name}
                        isDisabled={visa.is_disabled}
                      />
                    </td>

                    <td className="w-24 py-3.5 pr-5 text-right">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30"
                      >
                        <Eye className="size-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {visas.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border-default bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-secondary-copy">
              Showing{" "}
              <span className="font-medium text-primary-copy">
                {fromItem}&ndash;{toItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-primary-copy">{total}</span>{" "}
              visas
            </p>
            <div className="flex items-center gap-1">
              {currentPage > 2 && (
                <PaginationLink href={getPageHref(1)} disabled={false}>
                  <ChevronsLeft className="size-4" />
                </PaginationLink>
              )}
              <PaginationLink
                href={getPageHref(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="size-4" />
              </PaginationLink>

              {visiblePages[0] > 1 && (
                <span className="flex size-8 items-center justify-center text-xs text-secondary-copy">
                  ...
                </span>
              )}
              {visiblePages.map((p) => (
                <PaginationLink
                  key={p}
                  href={getPageHref(p)}
                  disabled={false}
                  active={p === currentPage}
                >
                  {p}
                </PaginationLink>
              ))}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <span className="flex size-8 items-center justify-center text-xs text-secondary-copy">
                  ...
                </span>
              )}

              <PaginationLink
                href={getPageHref(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="size-4" />
              </PaginationLink>
              {currentPage < totalPages - 1 && (
                <PaginationLink href={getPageHref(totalPages)} disabled={false}>
                  <ChevronsRight className="size-4" />
                </PaginationLink>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PaginationLink({
  href,
  disabled,
  active,
  children,
}: {
  href: string
  disabled: boolean
  active?: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className="flex size-8 items-center justify-center rounded-lg text-xs text-secondary-copy/40">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className={
        active
          ? "flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white shadow-sm"
          : "flex size-8 items-center justify-center rounded-lg border border-transparent text-xs font-medium text-primary-copy transition-colors hover:border-border-default hover:bg-bg-light-grey"
      }
    >
      {children}
    </Link>
  )
}
