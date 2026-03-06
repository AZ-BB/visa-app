import Link from "next/link"
import { getAdmins } from "@/actions/admins"
import { PageHeader } from "@/components/admin-layout/page-header"
import Pagination from "@/components/Pagination"
import { Users } from "lucide-react"
import Filters from "./_components/Filters"
import RoleDropdown from "./_components/RoleDropdown"
import AdminRowActions from "./_components/AdminRowActions"
import CreateAdminModal from "./_components/CreateAdminModal"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    page_size?: string
    search?: string
    role?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1)
  const rawPageSize = parseInt(params.page_size ?? "10", 10) || 10
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number]) ? rawPageSize : 10
  const search = params.search?.trim() ?? undefined
  const role = params.role === "ADMIN" || params.role === "SUPER_ADMIN" || params.role === "SUPERVISOR" ? params.role : undefined

  const res = await getAdmins(page, pageSize, {
    search,
    role,
    sort: "created_at",
    order: "desc"
  });

  if (!res.status || !res.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admins" description="Manage admin users" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-default bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm text-red-600">{res.error ?? "Failed to load admins"}</p>
        </div>
      </div>
    )
  }

  const { admins, total } = res.data

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-5 py-3">
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
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-border-default bg-bg-light-grey/80">
                  <th className="w-12 py-3 pl-5 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    #
                  </th>
                  <th className="w-40 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Name
                  </th>
                  <th className="w-52 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Email
                  </th>
                  <th className="w-32 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Phone
                  </th>
                  <th className="w-32 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Role
                  </th>
                  <th className="w-24 py-3 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Created
                  </th>
                  <th className="w-24 py-3 pl-2 pr-5 text-left text-xs font-semibold uppercase tracking-wider text-secondary-copy">
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
                    <td className="w-12 py-3.5 pl-5 pr-2 text-xs tabular-nums text-secondary-copy">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    <td className="w-40 py-3.5 pr-2">
                      <Link
                        href={`/admin/admins/${admin.id}`}
                        className="block truncate text-base hover:underline font-medium text-primary-copy transition-colors hover:text-primary"
                      >
                        {admin.first_name} {admin.last_name}
                      </Link>
                    </td>

                    <td className="w-52 py-3.5 pr-2 text-base text-secondary-copy">
                      <span className="block truncate">{admin.email}</span>
                    </td>

                    <td className="w-36 py-3.5 pr-2 text-secondary-copy">
                      <span className="block truncate">{admin.phone}</span>
                    </td>

                    <td className="w-28 py-3.5 pr-4">
                      <RoleDropdown adminId={admin.id} currentRole={admin.role} />
                    </td>

                    <td className="w-24 py-3.5 pr-2 text-secondary-copy">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>

                    <td className="w-24 py-3.5 pl-2 pr-5">
                      <AdminRowActions adminId={admin.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {admins.length > 0 && (
        <Pagination total={total} page={page} pageSize={pageSize} />
      )}
    </div>
  )
}
