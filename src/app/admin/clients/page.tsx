import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchClients } from "@/actions/clients"
import { ClientsSearchForm } from "./_components/clients-search-form"
import { SortableTh } from "./_components/sortable-th"
import Pagination from "@/components/Pagination"
import {
  Users,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Search as SearchIcon,
} from "lucide-react"
import type { ClientSortKey } from "@/actions/clients"

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    sort?: string
    sort_dir?: string
    has_applications?: string
    page?: string
    page_size?: string
  }>
}) {
  const params = await searchParams
  const parsedPage = Number(params.page)
  const parsedPageSize = Number(params.page_size)
  const sortParam = params.sort ?? "";
  const sortKey: ClientSortKey =
    sortParam === "name" || sortParam === "email" || sortParam === "created_at" || sortParam === "applications"
      ? sortParam
      : "created_at";
  const sortDir = params.sort_dir === "asc" ? "asc" : "desc";
  const hasApplications = params.has_applications === "yes" ? "yes" : "all";

  if (Number.isFinite(parsedPage) && (parsedPage < 1 || !Number.isInteger(parsedPage))) {
    const p = new URLSearchParams()
    if (params.search?.trim()) p.set("search", params.search.trim())
    if (sortKey !== "created_at") p.set("sort", sortKey)
    if (sortDir !== "desc") p.set("sort_dir", sortDir)
    if (hasApplications !== "all") p.set("has_applications", hasApplications)
    if (Number.isFinite(parsedPageSize) && parsedPageSize !== 20) p.set("page_size", String(parsedPageSize))
    const qs = p.toString()
    redirect(qs ? `/admin/clients?${qs}` : "/admin/clients")
  }

  const clientsRes = await fetchClients({
    search: params.search,
    page: Number.isFinite(parsedPage) ? parsedPage : undefined,
    pageSize: Number.isFinite(parsedPageSize) ? parsedPageSize : undefined,
    sort: sortKey,
    sortDir,
    hasApplications,
  })

  if (clientsRes.error || !clientsRes.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-primary-copy">Clients</h1>
          <p className="mt-0.5 text-sm text-secondary-copy">
            Manage registered clients
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-sm font-medium text-red-800">
            Failed to load clients
          </p>
          <p className="mt-1 max-w-xs text-sm text-red-600">
            {clientsRes.error ?? "An unexpected error occurred."}
          </p>
          <Link
            href="/admin/clients"
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
    clients,
    total,
    page: currentPage,
    pageSize: currentPageSize,
    totalPages,
  } = clientsRes.data

  if (currentPage > totalPages && totalPages > 0) {
    const p = new URLSearchParams()
    if (params.search?.trim()) p.set("search", params.search.trim())
    if (sortKey !== "created_at") p.set("sort", sortKey)
    if (sortDir !== "desc") p.set("sort_dir", sortDir)
    if (hasApplications !== "all") p.set("has_applications", hasApplications)
    if (currentPageSize !== 20) p.set("page_size", String(currentPageSize))
    p.set("page", String(totalPages))
    redirect(`/admin/clients?${p.toString()}`)
  }

  const fromItem = clients.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1

  const baseParams = new URLSearchParams()
  if (params.search?.trim()) baseParams.set("search", params.search.trim())
  if (hasApplications !== "all") baseParams.set("has_applications", hasApplications)
  if (currentPageSize !== 20) baseParams.set("page_size", String(currentPageSize))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-primary-copy">Clients</h1>
        <p className="mt-0.5 text-sm text-secondary-copy">
          {total} registered {total === 1 ? "client" : "clients"}
        </p>
      </div>

      {/* Clients table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-border-default px-5 py-3">
          <ClientsSearchForm
            key={`${params.search ?? ""}-${sortKey}-${sortDir}-${hasApplications}`}
            defaultSearch={params.search ?? ""}
            defaultSort={sortKey}
            defaultSortDir={sortDir}
            defaultHasApplications={hasApplications}
          />
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
              <SearchIcon className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-primary-copy">
              No clients found
            </h3>
            <p className="mt-1 max-w-xs text-sm text-secondary-copy">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-light-grey/80">
                    <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      #
                    </th>
                    <SortableTh
                      column="name"
                      label="Name"
                      currentSort={sortKey}
                      currentSortDir={sortDir}
                      baseParams={baseParams}
                    />
                    <SortableTh
                      column="email"
                      label="Email"
                      currentSort={sortKey}
                      currentSortDir={sortDir}
                      baseParams={baseParams}
                    />
                    <th className="py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Phone
                    </th>
                    <SortableTh
                      column="applications"
                      label="Applications"
                      currentSort={sortKey}
                      currentSortDir={sortDir}
                      baseParams={baseParams}
                    />
                    <SortableTh
                      column="created_at"
                      label="Joined"
                      currentSort={sortKey}
                      currentSortDir={sortDir}
                      baseParams={baseParams}
                    />
                    <th className="w-20 py-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/60">
                  {clients.map((client, index) => {
                    const initials = `${(client.first_name?.[0] ?? "").toUpperCase()}${(client.last_name?.[0] ?? "").toUpperCase()}`
                    const appCount = client.applications?.[0]?.count ?? 0

                    return (
                      <tr
                        key={client.id}
                        className="group transition-colors hover:bg-primary/2"
                      >
                        <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                          {fromItem + index}
                        </td>

                        <td className="py-3.5 pr-2">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {initials}
                            </div>
                            <span className="font-medium text-primary-copy transition-colors group-hover:text-primary">
                              {client.first_name} {client.last_name}
                            </span>
                          </Link>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2 text-secondary-copy">
                            <Mail className="size-3.5 shrink-0 opacity-50" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2 text-secondary-copy">
                            <Phone className="size-3.5 shrink-0 opacity-50" />
                            <span>{client.phone || "—"}</span>
                          </div>
                        </td>

                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2 text-secondary-copy">
                            <FileText className="size-3.5 shrink-0 opacity-50" />
                            <span className="tabular-nums">{appCount}</span>
                          </div>
                        </td>

                        <td className="py-3.5 pr-2 text-secondary-copy">
                          {new Date(client.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="w-20 py-3.5 pr-5 text-right">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-copy shadow-sm transition-all hover:border-primary/40 hover:text-primary"
                          >
                            View
                            <ExternalLink className="size-3 opacity-50" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-border-default px-5 py-3">
              <Pagination
                total={total}
                page={currentPage}
                pageSize={currentPageSize}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
