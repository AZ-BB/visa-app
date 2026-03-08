import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { fetchClientById } from "@/actions/clients"
import { getApplications } from "@/actions/applications"
import { getAdmins } from "@/actions/admins"
import { fetchAllCountriesList } from "@/actions/countries"
import { CountryFlag } from "@/components/ui/country-flag"
import Pagination from "@/components/Pagination"
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge"
import {
  ChevronLeft,
  Mail,
  Phone,
  User,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react"
import ApplicationsFilters from "@/app/admin/applications/_components/ApplicationsFilters"
import { SortableTableHeader } from "@/app/admin/applications/_components/SortableTableHeader"
import { TravellersCell } from "@/app/admin/applications/_components/TravellersCell"
import { AssigneeDropdown } from "@/app/admin/applications/_components/AssigneeDropdown"
import { ApplicationStatus } from "@/enums"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const SORT_OPTIONS = ["arrival_date", "created_at", "updated_at", "status", "client_name", "total_fee"] as const
const STATUS_VALUES = Object.values(ApplicationStatus)

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
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
  const { id } = await params
  const sp = await searchParams

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const rawPageSize = parseInt(sp.page_size ?? "10", 10) || 10
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? rawPageSize : 10
  const search = sp.search?.trim() ?? undefined
  const status = STATUS_VALUES.includes(sp.status as (typeof STATUS_VALUES)[number])
    ? (sp.status as ApplicationStatus)
    : undefined
  const assignedToId = sp.assigned_to_id?.trim() || undefined
  const destination = sp.destination?.trim() || undefined
  const nationality = sp.nationality?.trim() || undefined
  const sort = SORT_OPTIONS.includes(sp.sort as (typeof SORT_OPTIONS)[number])
    ? (sp.sort as "arrival_date" | "created_at" | "updated_at" | "status" | "client_name" | "total_fee")
    : "created_at"
  const order = sp.order === "asc" ? "asc" : "desc"
  const refundedFilter = sp.refunded === "refunded_only" ? "refunded_only" as const : "all" as const

  const [clientRes, appsRes, adminsRes, countriesRes] = await Promise.all([
    fetchClientById(id, { includeApplications: false }),
    getApplications(page, pageSize, {
      profile_id: id,
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
  ])

  if (clientRes.error || !clientRes.data) notFound()
  const client = clientRes.data

  const admins = adminsRes.status && adminsRes.data ? adminsRes.data.admins : []
  const countries = countriesRes.data ?? []

  const applications = appsRes.status && appsRes.data ? appsRes.data.applications : []
  const total = appsRes.status && appsRes.data ? appsRes.data.total : 0

  const initials = `${(client.first_name?.[0] ?? "").toUpperCase()}${(client.last_name?.[0] ?? "").toUpperCase()}`

  const tableParams: Record<string, string | undefined> = {
    page: sp.page,
    page_size: sp.page_size,
    search: sp.search,
    status: sp.status,
    assigned_to_id: sp.assigned_to_id,
    destination: sp.destination,
    nationality: sp.nationality,
    refunded: sp.refunded,
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to clients
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden bg-primary/10 rounded-xl border border-border-default shadow-sm">
            <div className="flex size-12 items-center justify-center rounded-full text-lg font-semibold text-primary">
              {initials}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-primary-copy">
              {client.first_name} {client.last_name}
            </h1>
            <p className="mt-0.5 text-sm text-secondary-copy">{client.email}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-border-default bg-white shadow-sm">
        <div className="divide-y divide-border-default/60">
          <DetailRow isFirst label="Email">
            <span className="flex items-center gap-2">
              <Mail className="size-3.5 text-secondary-copy/60" />
              {client.email}
            </span>
          </DetailRow>
          <DetailRow label="Phone">
            <span className="flex items-center gap-2">
              <Phone className="size-3.5 text-secondary-copy/60" />
              {client.phone || "—"}
            </span>
          </DetailRow>
          <DetailRow label="First name">
            <span className="flex items-center gap-2">
              <User className="size-3.5 text-secondary-copy/60" />
              {client.first_name}
            </span>
          </DetailRow>
          <DetailRow label="Last name">
            <span className="flex items-center gap-2">
              <User className="size-3.5 text-secondary-copy/60" />
              {client.last_name}
            </span>
          </DetailRow>
          <DetailRow label="Applications">
            {total} total
          </DetailRow>
          <DetailRow label="Joined">
            {format(new Date(client.created_at), "dd MMM yyyy")}
          </DetailRow>
          <DetailRow isLast label="Last updated">
            {format(new Date(client.updated_at), "dd MMM yyyy")}
          </DetailRow>
        </div>
      </div>

      {/* Applications table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-5 py-3">
          <ApplicationsFilters admins={admins} countries={countries} refunded={sp.refunded} />
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
              <FileText className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-primary-copy">No applications found</h3>
            <p className="mt-1 max-w-xs text-sm text-secondary-copy">
              {sp.search || sp.status || sp.assigned_to_id || sp.destination || sp.nationality
                ? "No visa applications matching your filters."
                : "Applications from this client will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-light-grey/80">
                  <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    #
                  </th>
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
                    className="w-32 sm:w-22"
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

                    <td className="w-22 py-3.5 pr-2">
                      <TravellersCell travellers={app.travellers} />
                    </td>

                    <td className="w-48 py-3.5 pr-2 flex items-center gap-2">
                      <CountryFlag
                        code={app.destination_country_id}
                        className="size-8 rounded-md shrink-0 border border-border-default shadow-sm"
                        loading="lazy"
                      />
                      <div>
                        <div className="text-base font-semibold text-secondary truncate">{app.visa_type_name}</div>
                        <span className="truncate font-normal">{app.destination_country_name}</span>
                      </div>
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

                    <td className="w-28 py-3.5 pr-2">
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
                        className="inline-flex bg-primary text-white items-center justify-center rounded-md p-2 transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="View application"
                      >
                        <Eye className="size-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {applications.length > 0 && (
        <Pagination total={total} page={page} pageSize={pageSize} />
      )}
    </div>
  )
}

function DetailRow({
  label,
  children,
  isFirst = false,
  isLast = false,
}: {
  label: string
  children: React.ReactNode
  isFirst?: boolean
  isLast?: boolean
}) {
  const roundedClass =
    isFirst && isLast
      ? "rounded-xl"
      : isFirst
        ? "rounded-t-xl"
        : isLast
          ? "rounded-b-xl"
          : ""
  return (
    <div
      className={`flex items-center justify-between px-5 py-3 ${roundedClass}`}
    >
      <span className="text-sm text-secondary-copy">{label}</span>
      <span className="text-sm font-medium text-primary-copy">{children}</span>
    </div>
  )
}
