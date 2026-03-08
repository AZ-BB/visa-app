import Link from "next/link"
import { getAdmins } from "@/actions/admins"
import { PageHeader } from "@/components/admin-layout/page-header"
import Pagination from "@/components/Pagination"
import { Users } from "lucide-react"
import Filters from "./_components/Filters"
import RoleDropdown from "./_components/RoleDropdown"
import AdminRowActions from "./_components/AdminRowActions"
import CreateAdminModal from "./_components/CreateAdminModal"
import { SortableTableHeader } from "./_components/SortableTableHeader"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
const SORT_OPTIONS = ["first_name", "role", "created_at", "updated_at"] as const

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    page_size?: string
    search?: string
    role?: string
    sort?: string
    order?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const rawPageSize = parseInt(params.page_size ?? "10", 10) || 10
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? rawPageSize : 10
  const search = params.search?.trim() ?? undefined
  const role = params.role === "ADMIN" || params.role === "SUPER_ADMIN" || params.role === "SUPERVISOR" ? params.role : undefined
  const sort = params.sort && SORT_OPTIONS.includes(params.sort as (typeof SORT_OPTIONS)[number])
    ? (params.sort as "first_name" | "role" | "created_at" | "updated_at")
    : "created_at"
  const order = params.order === "asc" ? "asc" : "desc"

  const res = await getAdmins(page, pageSize, {
    search,
    role,
    sort,
    order,
  });

  if (!res.status || !res.data) {
    return (
      <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
        <PageHeader title="Admins" description="Manage admin users" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm text-red-600">{res.error ?? "Failed to load admins"}</p>
        </div>
      </div>
    )
  }

  const { admins, total } = res.data

  const tableParams: Record<string, string | undefined> = {
    search: params.search,
    role: params.role,
    page_size: params.page_size,
  }

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex min-w-0 flex-col gap-3 border-b border-border-default px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Filters />
          <CreateAdminModal />
        </div>

        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/5 text-secondary-copy">
              <Users className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-primary-copy">
              No admins found
            </h3>
            <p className="mt-1 max-w-xs text-sm text-secondary-copy">
              There are no admin users configured yet.
            </p>
          </div>
        ) : (
          <>
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border-default bg-bg-light-grey/80">
                    <th className="w-12 min-w-12 py-3 pl-4 sm:pl-5 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      #
                    </th>
                    <SortableTableHeader
                      sortKey="first_name"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="min-w-[140px] pl-2"
                    >
                      Name
                    </SortableTableHeader>
                    <th className="min-w-[160px] py-3 pl-2 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Email
                    </th>
                    <th className="min-w-[110px] py-3 pl-2 pr-3 sm:pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Phone
                    </th>
                    <SortableTableHeader
                      sortKey="role"
                      currentSort={sort}
                      currentOrder={order}
                      params={tableParams}
                      className="min-w-[180px] pl-2"
                    >
                      Role
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
                    <th className="min-w-[90px] py-3 pl-2 pr-4 sm:pr-5 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-default/60">
                  {admins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className="group transition-colors hover:bg-primary/2"
                    >
                      <td className="w-12 min-w-12 py-3.5 pl-4 sm:pl-5 pr-3 sm:pr-2 text-xs tabular-nums text-secondary-copy">
                        {(page - 1) * pageSize + index + 1}
                      </td>

                      <td className="min-w-[140px] py-3.5 pl-2 pr-3 sm:pr-2">
                        <Link
                          href={`/admin/admins/${admin.id}`}
                          className="block min-w-0 truncate font-medium text-primary-copy transition-colors hover:text-primary hover:underline"
                        >
                          {admin.first_name} {admin.last_name}
                        </Link>
                      </td>

                      <td className="min-w-[160px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy">
                        <span className="block min-w-0 truncate">{admin.email}</span>
                      </td>

                      <td className="min-w-[110px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy">
                        <span className="block min-w-0 truncate">{admin.phone ?? "—"}</span>
                      </td>

                      <td className="min-w-[180px] py-3.5 pl-2 pr-3 sm:pr-2">
                        <RoleDropdown adminId={admin.id} currentRole={admin.role} />
                      </td>

                      <td className="min-w-[100px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy whitespace-nowrap">
                        {admin.created_at
                          ? new Date(admin.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })
                          : "—"}
                      </td>

                      <td className="min-w-[130px] py-3.5 pl-2 pr-3 sm:pr-2 text-secondary-copy whitespace-nowrap">
                        {admin.updated_at
                          ? new Date(admin.updated_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })
                          : "—"}
                      </td>

                      <td className="min-w-[90px] py-3.5 pl-2 pr-4 sm:pr-5">
                        <AdminRowActions adminId={admin.id} />
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
