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
    <div className="space-y-6">
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

      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <table className="w-full text-base font-medium">
          <tbody className="divide-y divide-border-default/60">
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 py-4 pl-5 pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Name
              </td>
              <td className="py-4 pr-5 text-primary-copy">
                {admin.first_name} {admin.last_name}
              </td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 py-4 pl-5 pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Email
              </td>
              <td className="py-4 pr-5 text-primary-copy">{admin.email}</td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 py-4 pl-5 pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Phone
              </td>
              <td className="py-4 pr-5 text-primary-copy">{admin.phone}</td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 py-4 pl-5 pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Role
              </td>
              <td className="py-4 pr-5">
                <div className="w-[400px]">
                  <RoleDropdown adminId={admin.id} currentRole={admin.role} />
                </div>
              </td>
            </tr>
            <tr className="group transition-colors hover:bg-primary/2">
              <td className="w-40 py-4 pl-5 pr-4 text-sm font-semibold uppercase tracking-wider text-secondary-copy">
                Joined
              </td>
              <td className="py-4 pr-5 text-primary-copy">
                {new Date(admin.created_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
