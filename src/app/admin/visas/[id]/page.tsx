import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchVisaById } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountryFlag } from "@/components/ui/country-flag"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function VisaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const visa = await fetchVisaById(Number(id))
  if (!visa) notFound()


  return (
    <>
      <PageHeader
        title={visa.name}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/admin/countries/${visa.destination_country}/visas`}>
              View all visas for this country
            </Link>
          </Button>
        }
      />
      <div className="mb-6 flex items-center gap-3">
        <CountryFlag
          code={visa.destination_country}
          className="size-10 shrink-0 rounded"
          round={false}
        />
        <div>
          <p className="font-medium text-primary-copy">
            {visa.destination_country_data?.name ?? visa.destination_country}
          </p>
          <p className="text-sm text-secondary-copy">
            Valid for: {visa.valid_for} · Max stay: {visa.max_stay} days
          </p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-copy">Number of entries</span>
              <span className="text-primary-copy">
                {visa.number_of_entries === -1
                  ? "Multiple"
                  : visa.number_of_entries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Max stay</span>
              <span className="text-primary-copy">{visa.max_stay} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-copy">Status</span>
              <span
                className={
                  visa.is_disabled ? "text-amber-600" : "text-emerald-600"
                }
              >
                {visa.is_disabled ? "Disabled" : "Active"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Destination</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/admin/countries/${visa.destination_country}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <CountryFlag
                code={visa.destination_country}
                className="size-6 rounded-sm"
                round={false}
              />
              {visa.destination_country_data?.name ?? visa.destination_country}
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
