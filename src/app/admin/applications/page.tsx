import Link from "next/link"
import { getApplicationCount, getApplications } from "@/actions/applications"
import { getAdmins } from "@/actions/admins"
import { fetchAllCountriesList } from "@/actions/countries"
import { PageHeader } from "@/components/admin-layout/page-header"
import Pagination from "@/components/Pagination"
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge"
import { CountryFlag } from "@/components/ui/country-flag"
import { FileText, Eye, Clock, CheckCircle2, DollarSign } from "lucide-react"
import ApplicationsFilters from "./_components/ApplicationsFilters"
import { SortableTableHeader } from "./_components/SortableTableHeader"
import { TravellersCell } from "./_components/TravellersCell"
import { AssigneeDropdown } from "./_components/AssigneeDropdown"
import { ApplicationStatus } from "@/enums"
import { notFound } from "next/navigation"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const SORT_OPTIONS = ["arrival_date", "created_at", "updated_at", "status", "client_name", "total_fee"] as const
const STATUS_VALUES = Object.values(ApplicationStatus)

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    page_size?: string
    search?: string
    status?: string
    assigned_to_id?: string
    destination?: string
    nationality?: string
    refunded?: string
    sort?: string
    order?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const rawPageSize = parseInt(params.page_size ?? "10", 10) || 10
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? rawPageSize : 10
  const search = params.search?.trim() ?? undefined
  const status = STATUS_VALUES.includes(params.status as (typeof STATUS_VALUES)[number])
    ? (params.status as ApplicationStatus)
    : undefined
  const assignedToId = params.assigned_to_id?.trim() || undefined
  const destination = params.destination?.trim() || undefined
  const nationality = params.nationality?.trim() || undefined
  const sort = SORT_OPTIONS.includes(params.sort as (typeof SORT_OPTIONS)[number])
    ? (params.sort as "arrival_date" | "created_at" | "updated_at" | "status" | "client_name" | "total_fee")
    : "created_at"
  const order = params.order === "asc" ? "asc" : "desc"
  const refundedFilter = params.refunded === "refunded_only" ? "refunded_only" as const : "all" as const

  const [res, adminsRes, countriesRes, countRes] = await Promise.all([
    getApplications(page, pageSize, {
      search,
      status,
      assigned_to_id: assignedToId,
      destination,
      nationality,
      refunded_filter: refundedFilter,
      sort,
      order,
    }),
    getAdmins(1, 200, { sort: "first_name", order: "asc" }),
    fetchAllCountriesList(),
    getApplicationCount(),
  ])

  const admins = adminsRes.status && adminsRes.data ? adminsRes.data.admins : []
  const countries = countriesRes.data ?? []
  const count = countRes

  if (!res.status || !res.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Applications" description="View and manage visa applications" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm text-red-600">{res.error ?? "Failed to load applications"}</p>
        </div>
      </div>
    )
  }

  const { applications, total } = res.data

  const tableParams: Record<string, string | undefined> = {
    page: params.page,
    page_size: params.page_size,
    search: params.search,
    status: params.status,
    assigned_to_id: params.assigned_to_id,
    destination: params.destination,
    nationality: params.nationality,
    refunded: params.refunded,
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <div className="flex min-w-0 flex-col rounded-xl border border-border-default bg-white px-3 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-secondary-copy sm:text-xs">Total</p>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary sm:size-8">
              <FileText className="size-3.5 sm:size-4" />
            </div>
          </div>
          <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-primary-copy sm:mt-1 sm:text-2xl">{count.data?.total ?? 0}</p>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-border-default bg-white px-3 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-secondary-copy sm:text-xs">In Progress</p>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500 sm:size-8">
              <Clock className="size-3.5 sm:size-4" />
            </div>
          </div>
          <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-primary-copy sm:mt-1 sm:text-2xl">{count.data?.in_progress ?? 0}</p>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-border-default bg-white px-3 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-secondary-copy sm:text-xs">Total Paid</p>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:size-8">
              <DollarSign className="size-3.5 sm:size-4" />
            </div>
          </div>
          <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-primary-copy sm:mt-1 sm:text-2xl">${(count.data?.total_paid ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-border-default bg-white px-3 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-secondary-copy sm:text-xs">Refunded</p>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 sm:size-8">
              <DollarSign className="size-3.5 sm:size-4" />
            </div>
          </div>
          <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-primary-copy sm:mt-1 sm:text-2xl">${(count.data?.refunded_amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="flex min-w-0 flex-col rounded-xl border border-border-default bg-white px-3 py-2.5 shadow-sm sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-secondary-copy sm:text-xs">Revenue</p>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 sm:size-8">
              <DollarSign className="size-3.5 sm:size-4" />
            </div>
          </div>
          <p className="mt-0.5 truncate text-lg font-bold tabular-nums text-primary-copy sm:mt-1 sm:text-2xl">${(count.data?.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-5 py-3">
          <ApplicationsFilters admins={admins} countries={countries} refunded={params.refunded} />
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
              <FileText className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-primary-copy">No applications found</h3>
            <p className="mt-1 max-w-xs text-sm text-secondary-copy">
              There are no visa applications matching your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-light-grey/80">
                    <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      #
                    </th>
                    <SortableTableHeader
                      sortKey="client_name"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="w-40"
                    >
                      Client
                    </SortableTableHeader>
                    <th className="w-22 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Travellers
                    </th>
                    <th className="w-40 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Destination / Visa
                    </th>
                    <SortableTableHeader
                      sortKey="total_fee"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="w-22"
                    >
                      Total
                    </SortableTableHeader>
                    <th className="w-20 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Refunded
                    </th>
                    <SortableTableHeader
                      sortKey="status"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="w-32 sm:w-28"
                    >
                      Status
                    </SortableTableHeader>
                    <th className="w-48 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Assigned to
                    </th>
                    <SortableTableHeader
                      sortKey="arrival_date"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="w-24"
                    >
                      Arrival
                    </SortableTableHeader>
                    <th className="w-24 py-3 pl-2 pr-5 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-default/60">
                  {applications.map((app, index) => (
                    <tr key={app.id} className="group transition-colors hover:bg-primary/2">
                      <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="w-40 py-3.5 pr-2">
                        <Link href={`/admin/applications/${app.id}`} className="hover:underline group/link">
                          <span className="block truncate text-base font-semibold text-primary-copy transition-colors group-hover/link:text-primary">
                            {app.client_name}
                          </span>
                          <div className="mt-0.5 text-xs text-secondary-copy truncate">
                            {app.contact_email}
                          </div>
                        </Link>
                      </td>

                      <td className="w-22 py-3.5 pr-2">
                        <TravellersCell travellers={app.travellers} />
                      </td>

                      <td className="w-48">
                        <Link href={`/admin/countries/${app.destination_country_id}`} className="py-3.5 pr-2 flex items-center gap-2 hover:underline">
                          <CountryFlag code={app.destination_country_id} className="size-8 rounded-md shrink-0 border border-border-default shadow-sm" loading="lazy" />
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-secondary break-words">{app.visa_type_name?.split(" - ")[0]}</div>
                            <span className="truncate font-normal">{app.destination_country_name}</span>
                          </div>
                        </Link>
                      </td>

                      <td className="w-22 py-3.5 pr-5">
                        <div className="text-base font-semibold text-primary-copy tabular-nums">
                          ${app.total_fee.toFixed(2)}
                        </div>
                        {app.amount_paid_cents != null &&
                          Math.abs(app.amount_paid_cents / 100 - app.total_fee) > 0.001 && (
                            <div className="mt-0.5 text-xs text-secondary-copy tabular-nums">
                              Paid: ${(app.amount_paid_cents / 100).toFixed(2)}
                            </div>
                          )}
                      </td>

                      <td className="w-20 py-3.5 pr-2 text-sm text-secondary-copy tabular-nums">
                        {(app.amount_refunded_cents ?? 0) > 0 ? `$${((app.amount_refunded_cents ?? 0) / 100).toFixed(2)}` : "—"}
                      </td>

                      <td className="w-32 sm:w-28 py-3.5 pr-2">
                        <ApplicationStatusBadge status={app.status} />
                      </td>

                      <td className="w-48 py-3.5 pr-10">
                        <AssigneeDropdown
                          applicationId={app.id}
                          assignedToId={app.assigned_to_id}
                          admins={admins}
                        />
                      </td>

                      <td className="w-24 py-3.5 pr-2 text-secondary-copy">
                        {new Date(app.arrival_date).toLocaleDateString()}
                      </td>

                      <td className="w-24 py-3.5 pl-2 pr-5">
                        <Link
                          href={`/admin/applications/${app.id}`}
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

            {/* Pagination */}
            <div className="border-t border-border-default px-5 py-3">
              <Pagination total={total} page={page} pageSize={pageSize} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
