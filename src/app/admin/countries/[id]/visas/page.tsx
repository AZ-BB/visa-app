import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchCountryById, fetchVisasByCountry } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountryFlag } from "@/components/ui/country-flag"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CountryVisasActions } from "./_components/country-visas-actions"
import { Plus } from "lucide-react"

export default async function CountryVisasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [country, visas] = await Promise.all([
    fetchCountryById(id),
    fetchVisasByCountry(id),
  ])

  if (!country) notFound()

  const breadcrumbs = [
    { label: "Countries", href: "/admin/countries" },
    { label: country.name, href: `/admin/countries/${id}` },
    { label: "Visas", href: undefined },
  ]

  return (
    <>
      <PageHeader
        title={`Visas for ${country.name}`}
        description="All visa types for this destination. Create new or manage existing."
        breadcrumbs={breadcrumbs}
        actions={
          <Button asChild>
            <Link href={`/admin/countries/${id}/visas/new`}>
              <Plus className="mr-2 size-4" />
              Create visa
            </Link>
          </Button>
        }
      />
      <div className="mb-6 flex items-center gap-3">
        <CountryFlag code={country.id} className="size-10 shrink-0 rounded" round={false} />
        <span className="font-medium text-primary-copy">{country.name}</span>
      </div>
      <Card className="border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Visa type
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
                <TableHead className="w-[120px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No visas for this country. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                visas.map((visa) => (
                  <TableRow
                    key={visa.id}
                    className="border-border-default hover:bg-muted/30"
                  >
                    <TableCell className="py-3">
                      <Link
                        href={`/admin/visas/${visa.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {visa.name}
                      </Link>
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
                      <span
                        className={
                          visa.is_disabled
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {visa.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <CountryVisasActions visa={visa} />
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
