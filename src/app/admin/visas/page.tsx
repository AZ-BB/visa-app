import Link from "next/link"
import { fetchAllVisas } from "@/actions/admin"
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
import { CountryFlag } from "@/components/ui/country-flag"
import { VisaStatusToggle } from "./_components/visa-status-toggle"

export default async function VisasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; country?: string; status?: string }>
}) {
  const params = await searchParams
  const visas = await fetchAllVisas()

  // Placeholder client-side filtering would go here; for now we show all
  const filtered =
    params.country && params.country !== "all"
      ? visas.filter((v) => v.destination_country === params.country)
      : visas

  return (
    <>
      <Card className="border-border-default bg-white shadow-sm">
        <div className="border-b border-border-default px-4 py-3 sm:flex sm:items-center sm:justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <AdminSearchInput
              placeholder="Search visa name..."
              className="min-w-[200px] max-w-sm"
            />
            <select
              className="h-9 rounded-md border border-border-default bg-white px-3 text-sm text-primary-copy focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={params.country ?? "all"}
              aria-label="Filter by country"
            >
              <option value="all">All countries</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="AE">UAE</option>
              <option value="FR">France</option>
            </select>
            <select
              className="h-9 rounded-md border border-border-default bg-white px-3 text-sm text-primary-copy focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={params.status ?? "all"}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Visa type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Destination
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Valid for
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Entries / Max stay
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Status
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No visas found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((visa) => (
                  <TableRow
                    key={visa.id}
                    className="border-border-default transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {visa.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <CountryFlag
                          code={visa.destination_country}
                          className="size-5 rounded-sm"
                          round={false}
                        />
                        <span className="text-secondary-copy">
                          {visa.destination_country_data?.name ?? visa.destination_country}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {visa.valid_for}
                    </TableCell>
                    <TableCell className="py-3 text-secondary-copy">
                      {visa.number_of_entries === -1
                        ? "Multiple"
                        : visa.number_of_entries}{" "}
                      / {visa.max_stay} days
                    </TableCell>
                    <TableCell className="py-3">
                      <VisaStatusToggle
                        visaId={visa.id}
                        visaName={visa.name}
                        isDisabled={visa.is_disabled}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href={`/admin/visas/${visa.id}`}
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
