import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchCountryById } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CountryFlag } from "@/components/ui/country-flag"

export default async function NewCountryVisaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const country = await fetchCountryById(id)
  if (!country) notFound()

  const breadcrumbs = [
    { label: "Countries", href: "/admin/countries" },
    { label: country.name, href: `/admin/countries/${id}` },
    { label: "Visas", href: `/admin/countries/${id}/visas` },
    { label: "New visa", href: undefined },
  ]

  return (
    <>
      <PageHeader
        title="Create visa"
        description={`New visa type for ${country.name}`}
        breadcrumbs={breadcrumbs}
      />
      <div className="mb-6 flex items-center gap-3">
        <CountryFlag code={country.id} className="size-10 shrink-0 rounded" round={false} />
        <span className="font-medium text-primary-copy">{country.name}</span>
      </div>
      <Card className="max-w-lg border-border-default bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Visa details (placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Standard Visitor" disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valid_for">Valid for</Label>
            <Input id="valid_for" placeholder="e.g. 6 months" disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="entries">Number of entries</Label>
            <Input id="entries" type="number" placeholder="e.g. 2" disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max_stay">Max stay (days)</Label>
            <Input id="max_stay" type="number" placeholder="e.g. 180" disabled />
          </div>
          <div className="flex gap-2 pt-2">
            <Button disabled>Create (placeholder)</Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/countries/${id}/visas`}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
