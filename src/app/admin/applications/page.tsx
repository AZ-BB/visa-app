import { fetchApplications } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { AdminSearchInput } from "@/components/admin-layout/admin-search-input"
import { ApplicationsTable } from "./_components/applications-table"
import { Card, CardContent } from "@/components/ui/card"

export default async function ApplicationsPage() {
  const applications = await fetchApplications()
  const inProgress = applications.filter((a) => a.status === "IN_PROGRESS").length
  const completed = applications.filter((a) => a.status === "COMPLETED").length

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border-default bg-white shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-secondary-copy">
              Total applications
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary-copy">
              {applications.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-white shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-secondary-copy">
              In progress
            </p>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {inProgress}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-white shadow-sm">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-secondary-copy">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {completed}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-border-default px-4 py-3 sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <AdminSearchInput
                placeholder="Search by client, email, application ID..."
                className="min-w-[200px] max-w-sm"
              />
              <select
                className="h-9 rounded-md border border-border-default bg-white px-3 text-sm text-primary-copy focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue=""
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <ApplicationsTable applications={applications} />
        </CardContent>
      </Card>
    </>
  )
}
