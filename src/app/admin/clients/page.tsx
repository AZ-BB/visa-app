import Link from "next/link"
import { fetchClients } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { AdminSearchInput } from "@/components/admin-layout/admin-search-input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ClientsPage() {
  const clients = await fetchClients()

  return (
    <>
      <Card className="border-border-default bg-white shadow-sm">
        <div className="border-b border-border-default px-4 py-3">
          <AdminSearchInput
            placeholder="Search by name or email..."
            className="max-w-sm"
          />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Phone
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-border-default transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium text-primary-copy">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {client.first_name} {client.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {client.email}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {client.phone}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
