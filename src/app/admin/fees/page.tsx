import { fetchTurnaroundTimes } from "@/actions/admin"
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
import { FeesTableActions } from "./_components/fees-table-actions"

export default async function FeesPage() {
  const turnaroundTimes = await fetchTurnaroundTimes()

  return (
    <>
      <PageHeader
        title="Turnaround times & fees"
        description="Manage turnaround times and their prices."
      />
      <Card className="border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Cost (£)
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Status
                </TableHead>
                <TableHead className="w-[100px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnaroundTimes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No turnaround times configured.
                  </TableCell>
                </TableRow>
              ) : (
                turnaroundTimes.map((tt) => (
                  <TableRow
                    key={tt.id}
                    className="border-border-default hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium text-primary-copy">
                      {tt.name}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-primary-copy">
                      £{tt.cost}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={
                          tt.is_disabled
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {tt.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <FeesTableActions turnaroundTime={tt} />
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
