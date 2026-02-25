import { fetchAdmins } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AdminsPage() {
  const admins = await fetchAdmins()

  return (
    <>
      <Card className="border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Phone
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Role
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No admins found.
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    className="border-border-default transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium text-primary-copy">
                      {admin.first_name} {admin.last_name}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {admin.phone}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={
                          admin.role === "SUPER_ADMIN" ? "default" : "secondary"
                        }
                      >
                        {admin.role.replace("_", " ")}
                      </Badge>
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
