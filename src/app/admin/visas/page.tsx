import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchVisas } from "@/actions/visas"
import { fetchAllCountriesList } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaStatusToggle } from "./_components/visa-status-toggle"
import { VisasSearchForm } from "./_components/visas-search-form"
import { SortableTableHeader } from "./_components/SortableTableHeader"
import Pagination from "@/components/Pagination"
import {
  Eye,
  Search as SearchIcon,
  CalendarDays,
  DoorOpen,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

export default async function VisasPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    country?: string
    status?: string
    page?: string
    page_size?: string
    sort?: "name" | "created_at" | "updated_at" | "status"
    order?: "asc" | "desc"
  }>
}) {
  const params = await searchParams
  const parsedPage = Number(params.page)
  const parsedPageSize = Number(params.page_size)
  const statusFilter =
    params.status === "active" || params.status === "disabled"
      ? params.status
      : "all"

  const SORT_OPTIONS = ["name", "created_at", "updated_at", "status"] as const
  const sort = params.sort && SORT_OPTIONS.includes(params.sort as (typeof SORT_OPTIONS)[number])
    ? (params.sort as "name" | "created_at" | "updated_at" | "status")
    : "name"
  const order = params.order === "asc" ? "asc" : "desc"

  if (Number.isFinite(parsedPage) && (parsedPage < 1 || !Number.isInteger(parsedPage))) {
    const p = new URLSearchParams()
    if (params.search?.trim()) p.set("search", params.search.trim())
    if (statusFilter !== "all") p.set("status", statusFilter)
    if (params.country?.trim()) p.set("country", params.country.trim())
    if (Number.isFinite(parsedPageSize) && parsedPageSize !== 20) p.set("page_size", String(parsedPageSize))
    if (sort !== "name") p.set("sort", sort)
    if (order !== "desc") p.set("order", order)
    const qs = p.toString()
    redirect(qs ? `/admin/visas?${qs}` : "/admin/visas")
  }

  const [visasResponse, countriesResponse] = await Promise.all([
    fetchVisas({
      search: params.search,
      page: Number.isFinite(parsedPage) ? parsedPage : undefined,
      pageSize: Number.isFinite(parsedPageSize) ? parsedPageSize : undefined,
      status: statusFilter,
      country: params.country,
      sort,
      order,
    }),
    fetchAllCountriesList(),
  ])

  const allCountries = countriesResponse.data ?? []

  if (visasResponse.error || !visasResponse.data) {
    return (
      <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
        <div>
          <h1 className="text-xl font-semibold text-primary-copy">Visa types</h1>
          <p className="mt-0.5 text-sm text-secondary-copy">
            Manage all visa types across destinations
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-primary-copy">
            Something went wrong
          </h3>
          <Link
            href="/admin/visas"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-border-default bg-white px-4 text-sm font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary"
          >
            <RefreshCw className="size-4" />
            Try again
          </Link>
        </div>
      </div>
    )
  }

  const {
    visas,
    total,
    page: currentPage,
    pageSize: currentPageSize,
    totalPages,
  } = visasResponse.data

  if (currentPage > totalPages && totalPages > 0) {
    const p = new URLSearchParams()
    if (params.search?.trim()) p.set("search", params.search.trim())
    if (statusFilter !== "all") p.set("status", statusFilter)
    if (params.country?.trim()) p.set("country", params.country.trim())
    if (currentPageSize !== 20) p.set("page_size", String(currentPageSize))
    if (sort !== "name") p.set("sort", sort)
    if (order !== "desc") p.set("order", order)
    p.set("page", String(totalPages))
    redirect(`/admin/visas?${p.toString()}`)
  }

  const fromItem = visas.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1

  const tableParams: Record<string, string | undefined> = {
    search: params.search,
    status: statusFilter !== "all" ? statusFilter : undefined,
    country: params.country,
    page_size: params.page_size,
  }

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-copy">Visa types</h1>
        <p className="mt-0.5 text-sm text-secondary-copy">
          Manage all visa types across destinations
        </p>
      </div>

      {/* Content */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-border-default px-5 py-3">
          <VisasSearchForm countries={allCountries} />
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
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-light-grey/80">
                  <th className="w-12 min-w-12 py-3 pl-4 sm:pl-5 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    #
                  </th>
                  <SortableTableHeader
                    sortKey="name"
                    currentSort={sort}
                    currentOrder={order}
                    params={tableParams}
                    className="min-w-[140px] pl-2"
                  >
                    Visa type
                  </SortableTableHeader>
                  <th className="min-w-[130px] py-3 pl-2 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Destination
                  </th>
                  <th className="min-w-[100px] py-3 pl-2 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Valid for
                  </th>
                  <th className="min-w-[140px] py-3 pl-2 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Entries / Max stay
                  </th>
                  <SortableTableHeader
                    sortKey="status"
                    currentSort={sort}
                    currentOrder={order}
                    params={tableParams}
                    className="min-w-[90px] pl-2"
                  >
                    Status
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="created_at"
                    currentSort={sort}
                    currentOrder={order}
                    params={tableParams}
                    className="min-w-[100px] pl-2"
                  >
                    Created
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="updated_at"
                    currentSort={sort}
                    currentOrder={order}
                    params={tableParams}
                    className="min-w-[130px] pl-2"
                  >
                    Updated
                  </SortableTableHeader>
                  <th className="w-24 min-w-[72px] py-3 pl-2 pr-4 sm:pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/60">
                {visas.map((visa, index) => (
                  <tr
                    key={visa.id}
                    className="group transition-colors hover:bg-primary/2"
                  >
                    <td className="w-12 min-w-12 py-3.5 pl-4 sm:pl-5 pr-3 sm:pr-2 text-xs tabular-nums text-secondary-copy">
                      {fromItem + index}
                    </td>

                    <td className="min-w-[140px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="font-medium text-primary-copy transition-colors hover:text-primary block min-w-0 truncate"
                      >
                        {visa.name}
                      </Link>
                    </td>

                    <td className="min-w-[130px] py-3.5 pl-2 pr-3 sm:pr-2">
                      <Link
                        href={`/admin/countries/${visa.destination_country}`}
                        className="inline-flex min-w-0 items-center gap-2 transition-colors hover:text-primary"
                      >
                        <CountryFlag
                          code={visa.destination_country}
                          className="size-5 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                          round={false}
                        />
                        <span className="truncate text-primary-copy">
                          {visa.destination_country_data?.name ?? visa.destination_country}
                        </span>
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

                    <td className="min-w-[100px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy">
                      {visa.created_at
                        ? `${new Date(visa.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })}`
                        : "—"}
                    </td>

                    <td className="min-w-[130px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy">
                      {visa.updated_at
                        ? `${new Date(visa.updated_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })}`
                        : "—"}
                    </td>

                    <td className="w-24 min-w-[72px] py-3.5 pl-2 pr-4 sm:pr-5 text-right">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-default bg-white px-3 text-xs font-medium text-primary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary group-hover:border-primary/30 whitespace-nowrap"
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
          <div className="border-t border-border-default px-5 py-3">
            <Pagination
              total={total}
              page={currentPage}
              pageSize={currentPageSize}
            />
          </div>
        )}
      </div>
    </div>
  )
}
