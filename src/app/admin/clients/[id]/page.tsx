import Link from "next/link"
import { notFound } from "next/navigation"
import {
  fetchClientById,
  fetchApplicationsByClient,
} from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { StatusBadge } from "@/components/admin-layout/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [client, applications] = await Promise.all([
    fetchClientById(id),
    fetchApplicationsByClient(id),
  ])

  if (!client) notFound()



  return (
    <>
      <PageHeader
        title={`${client.first_name} ${client.last_name}`}
        description="Client profile and applications"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Personal info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-copy">Email</span>
              <span className="text-primary-copy">{client.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Phone</span>
              <span className="text-primary-copy">{client.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">First name</span>
              <span className="text-primary-copy">{client.first_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Last name</span>
              <span className="text-primary-copy">{client.last_name}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-secondary-copy">
              {applications.length} application
              {applications.length !== 1 ? "s" : ""} in total.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 border-border-default bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary-copy">
              No applications for this client.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border-default hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Application
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Product / Destination
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Created
                  </TableHead>
                  <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="border-border-default hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-mono text-sm text-primary-copy">
                      {app.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {app.product?.visa_type?.name ?? "—"} /{" "}
                      {app.product?.visa_type?.destination_country_data?.name ??
                        "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {format(new Date(app.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
