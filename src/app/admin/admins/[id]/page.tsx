import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getAdminById } from "@/actions/admins"
import { PageHeader } from "@/components/admin-layout/page-header"
import RoleDropdown from "../_components/RoleDropdown"
import AdminDetailActions from "../_components/AdminDetailActions"

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await getAdminById(id)

  if (!res.status || !res.data) {
    notFound()
  }

  const admin = res.data

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <Link
        href="/admin/admins"
        className="mb-4 inline-flex items-center gap-1 text-sm text-secondary-copy hover:text-primary-copy transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to admins page
      </Link>
      <PageHeader
        title={`${admin.first_name} ${admin.last_name}`}
        description={admin.email}
        actions={<AdminDetailActions admin={admin} />}
      />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="min-w-0 overflow-x-auto">
        <table className="w-full min-w-[320px] text-base font-medium">
          <tbody className="divide-y divide-border-default/60">
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 min-w-[100px] py-4 pl-4 sm:pl-5 pr-3 sm:pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Name
              </td>
              <td className="min-w-0 py-4 pr-4 sm:pr-5 text-primary-copy">
                {admin.first_name} {admin.last_name}
              </td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 min-w-[100px] py-4 pl-4 sm:pl-5 pr-3 sm:pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Email
              </td>
              <td className="min-w-0 py-4 pr-4 sm:pr-5 text-primary-copy break-all">{admin.email}</td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 min-w-[100px] py-4 pl-4 sm:pl-5 pr-3 sm:pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Phone
              </td>
              <td className="min-w-0 py-4 pr-4 sm:pr-5 text-primary-copy">{admin.phone ?? "—"}</td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 min-w-[100px] py-4 pl-4 sm:pl-5 pr-3 sm:pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Role
              </td>
              <td className="min-w-0 py-4 pr-4 sm:pr-5">
                <div className="w-full max-w-[400px]">
                  <RoleDropdown adminId={admin.id} currentRole={admin.role} />
                </div>
              </td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 min-w-[100px] py-4 pl-4 sm:pl-5 pr-3 sm:pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Joined
              </td>
              <td className="min-w-0 py-4 pr-4 sm:pr-5 text-primary-copy">
                {new Date(admin.created_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
