import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchApplicationById } from "@/actions/admin"
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
import { CountryFlag } from "@/components/ui/country-flag"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await fetchApplicationById(id)
  if (!application) notFound()


  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <CountryFlag
              code={application.travellers?.[0]?.nationality_country?.id ?? ""}
              className="size-8"
              round={true}
            />
            <span>
              {application.profile?.first_name} {application.profile?.last_name}
            </span>
            <span className="text-secondary-copy">-</span>
            <CountryFlag
              code={application.product?.visa_type?.destination_country_data?.id ?? ""}
              className="size-8"
              round={true}
            />
            <span>{application.product?.visa_type?.name ?? "Visa"}</span>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {application.profile && (
              <>
                <div className="flex justify-between">
                  <span className="text-secondary-copy">Name</span>
                  <span className="text-primary-copy">
                    {application.profile.first_name} {application.profile.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-copy">Email</span>
                  <span className="text-primary-copy">{application.profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-copy">Phone</span>
                  <span className="text-primary-copy">{application.profile.phone}</span>
                </div>
                <Link
                  href={`/admin/clients/${application.profile.id}`}
                  className="text-primary hover:underline"
                >
                  View all applications for this client →
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Application details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-copy">Status</span>
              <StatusBadge status={application.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Contact email</span>
              <span className="text-primary-copy">{application.contact_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Arrival date</span>
              <span className="text-primary-copy">
                {format(new Date(application.arrival_date), "dd MMM yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Price</span>
              <span className="font-medium text-primary-copy">£{application.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Turnaround</span>
              <span className="text-primary-copy">
                {application.turnaround_time?.name ?? "—"} (£
                {application.turnaround_time_cost})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Assigned to</span>
              <span className="text-primary-copy">
                {application.assigned_admin
                  ? `${application.assigned_admin.first_name} ${application.assigned_admin.last_name}`
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>
      <Card className="mt-6 border-border-default bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Product</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {application.product && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <span className="text-secondary-copy">Visa type:</span>
              <span className="text-primary-copy">
                {application.product.visa_type?.name ?? "—"}
              </span>
              <span className="text-secondary-copy">Destination:</span>
              <span className="text-primary-copy">
                {application.product.visa_type?.destination_country_data?.name ?? "—"}
              </span>
              <span className="text-secondary-copy">Product price:</span>
              <span className="text-primary-copy">£{application.product.price}</span>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6 border-border-default bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Travellers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {application.travellers && application.travellers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border-default hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Nationality
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Date of birth
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Passport
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                    Expiry
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {application.travellers.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-border-default hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium text-primary-copy">
                      {t.first_name} {t.last_name}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {t.nationality_country?.name ?? t.nationality}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {format(new Date(t.date_of_birth), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-sm text-secondary-copy">
                      {t.passport_number}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {format(new Date(t.passport_expiry_date), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-6 text-center text-sm text-secondary-copy">
              No travellers for this application.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
