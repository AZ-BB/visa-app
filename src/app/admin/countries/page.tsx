import Link from "next/link"
import { fetchCountries } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountriesSearchForm } from "./_components/countries-search-form"
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

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const countries = await fetchCountries(search)

  return (
    <>
      <Card className="border-border-default bg-white shadow-sm">
        <div className="border-b border-border-default px-4 py-3">
          <CountriesSearchForm key={search ?? ""} defaultValue={search ?? ""} />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Country
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Code
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
              {countries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No countries found.
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow
                    key={country.id}
                    className="border-border-default transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-3">
                      <Link
                        href={`/admin/countries/${country.id}`}
                        className="flex items-center gap-3 font-medium text-primary-copy hover:text-primary hover:underline"
                      >
                        <CountryFlag code={country.id} className="size-6 shrink-0 rounded-sm" round={false} />
                        {country.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-sm text-secondary-copy">
                      {country.id}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={
                          country.is_disabled
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {country.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href={`/admin/countries/${country.id}`}
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
