import Link from "next/link"
import { notFound } from "next/navigation"
import {
  fetchCountryById,
  fetchVisaRulesByDestination,
  fetchVisaRulesByNationality,
} from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountryTabs } from "./country-tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CountryFlag } from "@/components/ui/country-flag"
import { FileText } from "lucide-react"

type ViewAs = "destination" | "nationality"

export default async function CountryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view_as?: string }>
}) {
  const { id } = await params
  const { view_as } = await searchParams
  const resolvedView = (view_as === "nationality" ? "nationality" : "destination") as ViewAs

  const [country, rulesAsDestination, rulesAsNationality] = await Promise.all([
    fetchCountryById(id),
    fetchVisaRulesByDestination(id),
    fetchVisaRulesByNationality(id),
  ])

  if (!country) notFound()

  const rules = resolvedView === "destination" ? rulesAsDestination : rulesAsNationality

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="mb-4 flex items-center gap-3">
          <CountryFlag code={country.id} className="size-10 shrink-0 rounded" round={false} />
          <div>
            <p className="font-medium text-primary-copy">{country.name}</p>
            <p className="text-sm text-secondary-copy">Code: {country.id}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/countries/${id}/visas`}>
            <FileText className="mr-2 size-4" />
            Show all visas
          </Link>
        </Button>
      </div>
      <CountryTabs currentView={resolvedView} countryId={id} />
      <Card className="mt-6 border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  {resolvedView === "destination" ? "Nationality" : "Destination"}
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Visa required
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Supported
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No visa rules found.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => {
                  const otherCountry =
                    resolvedView === "destination"
                      ? rule.nationality_country
                      : rule.destination_country_data
                  const otherId =
                    resolvedView === "destination" ? rule.nationality : rule.destination_country
                  return (
                    <TableRow
                      key={rule.id}
                      className="border-border-default transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-3">
                        <Link
                          href={`/admin/countries/${id}/nationality/${otherId}?view_as=${resolvedView}`}
                          className="flex items-center gap-2 font-medium text-primary-copy hover:text-primary hover:underline"
                        >
                          <CountryFlag
                            code={otherId}
                            className="size-5 shrink-0 rounded-sm"
                            round={false}
                          />
                          {otherCountry?.name ?? otherId}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3 text-secondary-copy">
                        {rule.is_visa_required ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="py-3 text-secondary-copy">
                        {rule.is_supported ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Link
                          href={`/admin/countries/${id}/nationality/${otherId}?view_as=${resolvedView}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          View products
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
