import Link from "next/link"
import type { Application } from "@/lib/admin-types"
import { StatusBadge } from "@/components/admin-layout/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"

interface ApplicationsTableProps {
  applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-secondary-copy">
        No applications found.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border-default hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Client
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Contact
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Product / Destination
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Price
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Status
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
            Assigned to
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
            className="border-border-default transition-colors hover:bg-muted/30"
          >
            <TableCell className="py-3">
              <div className="font-medium text-primary-copy">
                {app.profile
                  ? `${app.profile.first_name} ${app.profile.last_name}`
                  : "—"}
              </div>
              <div className="text-xs text-secondary-copy">
                Ref: {app.id.slice(0, 8)}
              </div>
            </TableCell>
            <TableCell className="py-3 text-sm text-secondary-copy">
              {app.contact_email}
            </TableCell>
            <TableCell className="py-3">
              <div className="text-sm text-primary-copy">
                {app.product?.visa_type?.name ?? "—"}
              </div>
              <div className="text-xs text-secondary-copy">
                {app.product?.visa_type?.destination_country_data?.name ?? "—"}
              </div>
            </TableCell>
            <TableCell className="py-3 font-medium text-primary-copy">
              £{app.price}
            </TableCell>
            <TableCell className="py-3">
              <StatusBadge status={app.status} />
            </TableCell>
            <TableCell className="py-3 text-sm text-secondary-copy">
              {app.assigned_admin
                ? `${app.assigned_admin.first_name} ${app.assigned_admin.last_name}`
                : "—"}
            </TableCell>
            <TableCell className="py-3 text-sm text-secondary-copy">
              {format(new Date(app.created_at), "dd MMM yyyy")}
            </TableCell>
            <TableCell className="py-3 text-right">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/applications/${app.id}`} aria-label="View">
                  <Eye className="size-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
