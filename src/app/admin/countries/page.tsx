import Link from "next/link"
import {
  Globe,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search as SearchIcon,
} from "lucide-react"
import { fetchCountries } from "@/actions/countries"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountriesSearchForm } from "./_components/countries-search-form"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CountryFlag } from "@/components/ui/country-flag"
import { CountryStatusToggle } from "./_components/country-status-toggle"

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    page?: string
    pageSize?: string
    status?: string
  }>
}) {
  const { search, page, pageSize, status } = await searchParams
  const parsedPage = Number(page)
  const parsedPageSize = Number(pageSize)
  const statusFilter =
    status === "active" || status === "disabled" ? status : "all"

  const countriesResponse = await fetchCountries({
    search,
    page: Number.isFinite(parsedPage) ? parsedPage : undefined,
    pageSize: Number.isFinite(parsedPageSize) ? parsedPageSize : undefined,
    status: statusFilter,
  })

  if (countriesResponse.error || !countriesResponse.data) {
    throw new Error(countriesResponse.error ?? "Failed to fetch countries")
  }

  const {
    countries,
    total,
    page: currentPage,
    totalPages,
    pageSize: currentPageSize,
  } = countriesResponse.data

  const activeCount = countries.filter((c) => !c.is_disabled).length
  const disabledCount = countries.length - activeCount
  const fromItem =
    countries.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1
  const toItem =
    countries.length === 0 ? 0 : fromItem + countries.length - 1

  const getPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (search?.trim()) params.set("search", search.trim())
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (currentPageSize !== 20) params.set("pageSize", String(currentPageSize))
    if (targetPage > 1) params.set("page", String(targetPage))
    const qs = params.toString()
    return qs ? `/admin/countries?${qs}` : "/admin/countries"
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
      {/* Table card */}
      <Card className="overflow-hidden rounded-xl border-border-default bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border-default bg-white px-4 pb-5 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <CountriesSearchForm
            key={`${search ?? ""}-${statusFilter}`}
            defaultValue={search ?? ""}
            defaultStatus={statusFilter}
          />
        </div>

        <CardContent className="p-0">
          {countries.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/20 text-secondary-copy">
                <SearchIcon className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-primary-copy">
                No countries found
              </h3>
              <p className="mt-1 max-w-xs text-sm text-secondary-copy">
                Try adjusting your search term or filters to find what you&apos;re
                looking for.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-default bg-bg-light-grey/60 hover:bg-bg-light-grey/60">
                  <TableHead className="w-[50px] pl-4 text-[11px] font-semibold uppercase tracking-widest text-secondary-copy md:pl-5">
                    #
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-secondary-copy">
                    Country
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-secondary-copy">
                    Code
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-secondary-copy">
                    Status
                  </TableHead>
                  <TableHead className="hidden text-[11px] font-semibold uppercase tracking-widest text-secondary-copy lg:table-cell">
                    Last Updated
                  </TableHead>
                  <TableHead className="w-[100px] pr-4 text-right text-[11px] font-semibold uppercase tracking-widest text-secondary-copy md:pr-5">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country, index) => {
                  const rowNumber = fromItem + index
                  const updatedDate = country.updated_at
                    ? new Date(country.updated_at)
                    : null

                  return (
                    <TableRow
                      key={country.id}
                      className="group border-border-default/60 transition-colors hover:bg-primary/[0.02]"
                    >
                      <TableCell className="w-[50px] pl-4 text-xs tabular-nums text-secondary-copy md:pl-5">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="py-3">
                        <Link
                          href={`/admin/countries/${country.id}`}
                          className="group/link inline-flex items-center gap-3"
                        >
                          <CountryFlag
                            code={country.id}
                            className="size-7 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                            round={false}
                          />
                          <span className="font-medium text-primary-copy transition-colors group-hover/link:text-primary">
                            {country.name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-3">
                        <code className="rounded bg-bg-light-grey px-1.5 py-0.5 font-mono text-xs font-medium text-secondary-copy">
                          {country.id}
                        </code>
                      </TableCell>
                      <TableCell className="py-3">
                        <CountryStatusToggle
                          countryId={country.id}
                          countryName={country.name}
                          isDisabled={country.is_disabled}
                        />
                      </TableCell>
                      <TableCell className="hidden py-3 lg:table-cell">
                        {updatedDate ? (
                          <span
                            className="text-xs text-secondary-copy"
                            title={updatedDate.toISOString()}
                          >
                            {updatedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-secondary-copy/50">
                            &mdash;
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-right md:pr-5">
                        <Link
                          href={`/admin/countries/${country.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          <Eye className="size-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {countries.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border-default bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <p className="text-xs text-secondary-copy">
                Showing{" "}
                <span className="font-medium text-primary-copy">
                  {fromItem}&ndash;{toItem}
                </span>{" "}
                of{" "}
                <span className="font-medium text-primary-copy">{total}</span>{" "}
                countries
              </p>
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 2 && (
                  <PaginationLink href={getPageHref(1)} disabled={false}>
                    <ChevronsLeft className="size-4" />
                  </PaginationLink>
                )}
                {/* Prev */}
                <PaginationLink
                  href={getPageHref(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="size-4" />
                </PaginationLink>

                {/* Page numbers */}
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

                {/* Next */}
                <PaginationLink
                  href={getPageHref(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="size-4" />
                </PaginationLink>
                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <PaginationLink
                    href={getPageHref(totalPages)}
                    disabled={false}
                  >
                    <ChevronsRight className="size-4" />
                  </PaginationLink>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
